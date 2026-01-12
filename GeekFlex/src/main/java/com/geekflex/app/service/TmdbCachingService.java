package com.geekflex.app.service;

import com.geekflex.app.dto.tmdb.TmdbMovieListResponse;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentListTag;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.entity.TagType;
import com.geekflex.app.entity.TmdbGenre;
import com.geekflex.app.repository.ContentListTagRepository;
import com.geekflex.app.repository.ContentRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.reactive.function.client.WebClient;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Log4j2
public class TmdbCachingService {


    private final WebClient tmdbWebClient;
    private final ContentRepository contentRepository;
    private final ContentListTagRepository contentListTagRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    private static final String DEFAULT_LANGUAGE = "ko-KR";
    private static final String DEFAULT_REGION = "KR";
    private static final int DEFAULT_PAGE = 1;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void cacheCategory(TagType tagType, String apiPath) {
        log.info("[{}] TMDB API 호출 시작", tagType);

        TmdbMovieListResponse response = tmdbWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(apiPath)
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .queryParam("page", DEFAULT_PAGE)
                        .queryParam("region", DEFAULT_REGION)
                        .build())
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class)
                .block();


        if (response == null || response.getResults() == null) {
            log.warn("TMDB 응답 실패 또는 빈 목록 (tagType: {})", tagType);
            return;
        }

        log.info("TMDB 응답 수신 - API : {}: {} 건", tagType, response.getResults().size());


        // 1. 기존 태그 삭제
        contentListTagRepository.deleteByTagType(tagType);

        // 2. 캐시용 태그 준비
        Map<Long, ContentListTag> tagMap = new LinkedHashMap<>(); // <tmdbId, 엔티티>
        // Long: tmdbId (TMDB에서 받은 고유 콘텐츠 ID)
        //ContentListTag: 해당 콘텐츠의 태그 (NOW_PLAYING, POPULAR 등)

        for (TmdbMovieListResponse.MovieSummary movie : response.getResults()) {
            // 같은 content_id가 이미 Map에 있으면 건너뛰기 (중복 방지)
            if (tagMap.containsKey(movie.getId())) {
                log.warn("중복된 영화 건너뛰기: tmdbId={}", movie.getId());
                continue;
            }

            // 존재하면 업데이트, 없으면 삽입 (데드락 발생 시 재시도)
            Content content = getOrCreateContentWithRetry(movie);

            ContentListTag tag = ContentListTag.builder()
                    .content(content)
                    .tagType(tagType)
                    .region(DEFAULT_REGION)
                    .build();

            log.info("콘텐츠리스트태그 추가됨 : {}, ", tag.toString());
            tagMap.put(movie.getId(), tag);
        }
        log.info("최종 저장될 콘텐츠 태그 리스트: {}", tagMap.values());
        contentListTagRepository.saveAll(tagMap.values());
        log.info("[{}] 태그 저장 완료: {}건", tagType, tagMap.size());
    }

    /**
     * 데드락 발생 시 재시도하면서 Content를 가져오거나 생성합니다.
     * 별도 트랜잭션으로 분리하여 예외 발생 시 세션 오염을 방지합니다.
     * 
     * @param movie 영화 정보
     * @return Content 엔티티
     */
    private Content getOrCreateContentWithRetry(TmdbMovieListResponse.MovieSummary movie) {
        return getOrCreateContentInNewTransaction(movie);
    }
    
    /**
     * 별도 트랜잭션에서 Content를 가져오거나 생성합니다.
     * 예외 발생 시에도 메인 트랜잭션에 영향을 주지 않습니다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    private Content getOrCreateContentInNewTransaction(TmdbMovieListResponse.MovieSummary movie) {
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                return contentRepository.findByTmdbIdAndContentType(
                                movie.getId(),
                                ContentType.MOVIE)
                        .map(existing -> updateContent(existing, movie))
                        .orElseGet(() -> createContent(movie));
            } catch (CannotAcquireLockException | JpaSystemException e) {
                // 데드락 또는 락 관련 예외 발생 시 세션 정리 후 재시도
                entityManager.clear(); // 세션 오염 방지
                retryCount++;
                if (retryCount >= maxRetries) {
                    log.error("데드락 재시도 실패 ({}회 시도) - tmdbId: {}", maxRetries, movie.getId(), e);
                    throw e;
                }
                log.warn("데드락 발생 - 재시도 {}/{} - tmdbId: {}", retryCount, maxRetries, movie.getId());
                try {
                    // 재시도 전 짧은 대기 (랜덤 백오프로 데드락 확률 감소)
                    Thread.sleep(50 + (long)(Math.random() * 100));
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("재시도 중 인터럽트 발생", ie);
                }
            } catch (DataIntegrityViolationException e) {
                // 동시성으로 인한 중복 INSERT 시 세션 정리 후 기존 데이터 조회
                entityManager.clear(); // 세션 오염 방지
                log.warn("동시성으로 인한 중복 INSERT 감지 - tmdbId: {}", movie.getId());
                return contentRepository.findByTmdbIdAndContentType(movie.getId(), ContentType.MOVIE)
                        .map(existing -> updateContent(existing, movie))
                        .orElseThrow(() -> e);
            } catch (Exception e) {
                // 기타 예외 발생 시에도 세션 정리
                entityManager.clear();
                throw e;
            }
        }
        
        // 이 코드는 실행되지 않지만 컴파일러를 위해 필요
        throw new RuntimeException("재시도 로직 오류");
    }

    // 4개의 Movie LIST API에서는 제작국가 정보를 반환하지 않음 일단 어쩔수없이 빈값으로 처리함
    private Content createContent(TmdbMovieListResponse.MovieSummary movie) {
        Content content = Content.builder()
                .tmdbId(movie.getId()) // TMDB_ID
                .contentType(ContentType.MOVIE) // 콘텐츠 타입
                .title(movie.getTitle()) // 제목
                .originalTitle(movie.getOriginalTitle())
                .originalLanguage(movie.getOriginalLanguage())
                .overview(movie.getOverview())
                .posterUrl(movie.getPosterPath()) // 포스터
                .backdropUrl(movie.getBackdropPath()) // 백드롭
                .releaseDate(movie.getReleaseDate()) // 개봉일
                .voteAverage(movie.getVoteAverage()) // 평점
                .voteCount(movie.getVoteCount()) // 투표수
                .popularity(movie.getPopularity()) // 인지도
                .genre(TmdbGenre.convertGenreIdsToString(movie.getGenreIds())) // 장르 (콤마로 구분된 한글명)
                .originCountry("")
                .build();
        return contentRepository.save(content);
    }

    private Content updateContent(Content content, TmdbMovieListResponse.MovieSummary movie) {
        // 기존 엔티티에 변경 사항만 반영
        content.setTitle(movie.getTitle());
        content.setOriginalTitle(movie.getOriginalTitle());
        content.setOriginalLanguage(movie.getOriginalLanguage());
        content.setOverview(movie.getOverview());
        content.setPosterUrl(movie.getPosterPath());
        content.setBackdropUrl(movie.getBackdropPath());
        content.setReleaseDate(movie.getReleaseDate());
        content.setVoteAverage(movie.getVoteAverage());
        content.setVoteCount(movie.getVoteCount());
        content.setPopularity(movie.getPopularity());
        content.setGenre(TmdbGenre.convertGenreIdsToString(movie.getGenreIds())); // 장르 (콤마로 구분된 한글명)
        // 기존 데이터 유지
        // contentType, tmdbId, createdAt 같은 값은 변경하지 않음
        return content;
    }

}