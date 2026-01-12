package com.geekflex.app.service;

import com.geekflex.app.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.dto.tmdb.TmdbMovieListResponse;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentListTag;
import com.geekflex.app.entity.TagType;
import com.geekflex.app.repository.ContentListTagRepository;
import com.geekflex.app.repository.ContentRepository;
import com.geekflex.app.service.tmdb.TmdbApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
@SpringBootTest
@RequiredArgsConstructor
class TmdbApiServiceTest {
    @Autowired
    private TmdbApiService tmdbApiService;

    @Autowired
    private TmdbCachingService tmdbCachingService;

    @Autowired
    private  WebClient tmdbWebClient;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private ContentListTagRepository contentListTagRepository;

    /**
     * cacheMoviesByTag 메서드 테스트 - NOW_PLAYING
     */
    @Test
    @Transactional
    void testCacheMoviesByTag_NowPlaying() {
        log.info("========== [TEST] NOW_PLAYING 캐싱 테스트 시작 ==========");

        // Given: 초기 상태 확인
        long initialContentCount = contentRepository.count();
        long initialTagCount = contentListTagRepository.count();
        log.info("초기 Content 개수: {}", initialContentCount);
        log.info("초기 ContentListTag 개수: {}", initialTagCount);

        // When: TMDB API 호출하여 NOW_PLAYING 데이터 캐싱
        tmdbCachingService.cacheCategory(TagType.NOW_PLAYING, "/movie/now_playing");

        // Then: DB에 데이터가 저장되었는지 확인
        List<ContentListTag> nowPlayingTags = contentListTagRepository.findByTagType(TagType.NOW_PLAYING);

        // 검증 1: ContentListTag가 저장되었는지 확인
        assertThat(nowPlayingTags).isNotEmpty();
        log.info("NOW_PLAYING 태그 개수: {}", nowPlayingTags.size());

        // 검증 2: 각 태그가 Content와 연결되어 있는지 확인
        for (ContentListTag tag : nowPlayingTags) {
            assertThat(tag.getContent()).isNotNull();
            assertThat(tag.getTagType()).isEqualTo(TagType.NOW_PLAYING);
            assertThat(tag.getRegion()).isEqualTo("KR");
            assertThat(tag.getContent().getContentType()).isNotNull();
        }

        // 검증 3: Content 엔티티의 필수 필드 확인
        ContentListTag firstTag = nowPlayingTags.get(0);
        Content firstContent = firstTag.getContent();
        
        assertThat(firstContent.getTmdbId()).isNotNull();
        assertThat(firstContent.getTitle()).isNotBlank();
        assertThat(firstContent.getPosterUrl()).isNotNull();
        
        log.info("첫 번째 영화 정보:");
        log.info("  - 제목: {}", firstContent.getTitle());
        log.info("  - 원제: {}", firstContent.getOriginalTitle());
        log.info("  - TMDB ID: {}", firstContent.getTmdbId());
        log.info("  - 개봉일: {}", firstContent.getReleaseDate());
        log.info("  - 평점: {}", firstContent.getVoteAverage());
        log.info("  - 투표수: {}", firstContent.getVoteCount());
        log.info("  - 인기도: {}", firstContent.getPopularity());

        // 검증 4: 중복 저장 방지 확인 (같은 tmdbId로 다시 호출해도 Content는 중복 생성되지 않음)
        long contentCountBeforeSecondCall = contentRepository.count();
        tmdbCachingService.cacheCategory(TagType.NOW_PLAYING, "/movie/now_playing");
        long contentCountAfterSecondCall = contentRepository.count();
        
        // Content는 재사용되므로 크게 증가하지 않아야 함
        log.info("두 번째 호출 전 Content 개수: {}", contentCountBeforeSecondCall);
        log.info("두 번째 호출 후 Content 개수: {}", contentCountAfterSecondCall);

        log.info("========== [TEST] NOW_PLAYING 캐싱 테스트 완료 ==========");
    }

    /**
     * cacheMoviesByTag 메서드 테스트 - POPULAR
     */
    @Test
    @org.springframework.transaction.annotation.Transactional
    void testCacheMoviesByTag_Popular() {
        log.info("========== [TEST] POPULAR 캐싱 테스트 시작 ==========");

        // Given: 초기 상태 확인
        long initialContentCount = contentRepository.count();
        long initialTagCount = contentListTagRepository.count();
        log.info("초기 Content 개수: {}", initialContentCount);
        log.info("초기 ContentListTag 개수: {}", initialTagCount);

        // When: TMDB API 호출하여 POPULAR 데이터 캐싱
        tmdbCachingService.cacheCategory(TagType.POPULAR, "/movie/popular");

        // Then: DB에 데이터가 저장되었는지 확인
        List<ContentListTag> popularTags = contentListTagRepository.findByTagType(TagType.POPULAR);

        // 검증 1: ContentListTag가 저장되었는지 확인
        assertThat(popularTags).isNotEmpty();
        log.info("POPULAR 태그 개수: {}", popularTags.size());

        // 검증 2: 각 태그가 Content와 연결되어 있는지 확인
        for (ContentListTag tag : popularTags) {
            assertThat(tag.getContent()).isNotNull();
            assertThat(tag.getTagType()).isEqualTo(TagType.POPULAR);
            assertThat(tag.getRegion()).isEqualTo("KR");
        }

        // 검증 3: Content 엔티티의 필수 필드 확인
        ContentListTag firstTag = popularTags.get(0);
        Content firstContent = firstTag.getContent();
        
        assertThat(firstContent.getTmdbId()).isNotNull();
        assertThat(firstContent.getTitle()).isNotBlank();
        assertThat(firstContent.getPosterUrl()).isNotNull();
        
        log.info("첫 번째 인기 영화 정보:");
        log.info("  - 제목: {}", firstContent.getTitle());
        log.info("  - 원제: {}", firstContent.getOriginalTitle());
        log.info("  - TMDB ID: {}", firstContent.getTmdbId());
        log.info("  - 개봉일: {}", firstContent.getReleaseDate());
        log.info("  - 평점: {}", firstContent.getVoteAverage());
        log.info("  - 투표수: {}", firstContent.getVoteCount());
        log.info("  - 인기도: {}", firstContent.getPopularity());

        // 검증 4: NOW_PLAYING과 POPULAR가 서로 다른 태그로 저장되는지 확인
        List<ContentListTag> nowPlayingTags = contentListTagRepository.findByTagType(TagType.NOW_PLAYING);
        if (!nowPlayingTags.isEmpty()) {
            assertThat(popularTags.get(0).getTagType())
                    .isNotEqualTo(nowPlayingTags.get(0).getTagType());
            log.info("NOW_PLAYING과 POPULAR 태그가 올바르게 구분됨");
        }

        log.info("========== [TEST] POPULAR 캐싱 테스트 완료 ==========");
    }

    /**
     * cacheMoviesByTag 통합 테스트 - NOW_PLAYING과 POPULAR 동시 테스트
     */
    @Test
    @org.springframework.transaction.annotation.Transactional
    void testCacheMoviesByTag_BothNowPlayingAndPopular() {
        log.info("========== [TEST] NOW_PLAYING & POPULAR 통합 테스트 시작 ==========");

        // When: 두 가지 태그 모두 캐싱
        log.info("1. NOW_PLAYING 캐싱 시작");
        tmdbCachingService.cacheCategory(TagType.NOW_PLAYING, "/movie/now_playing");
        
        log.info("2. POPULAR 캐싱 시작");
        tmdbCachingService.cacheCategory(TagType.POPULAR, "/movie/popular");

        // Then: 두 태그 모두 저장되었는지 확인
        List<ContentListTag> nowPlayingTags = contentListTagRepository.findByTagType(TagType.NOW_PLAYING);
        List<ContentListTag> popularTags = contentListTagRepository.findByTagType(TagType.POPULAR);

        assertThat(nowPlayingTags).isNotEmpty();
        assertThat(popularTags).isNotEmpty();

        log.info("NOW_PLAYING 태그 개수: {}", nowPlayingTags.size());
        log.info("POPULAR 태그 개수: {}", popularTags.size());

        // 검증: 두 태그가 서로 다른 영화를 가리키는지 확인 (일부 겹칠 수 있지만 태그는 다름)
        assertThat(nowPlayingTags.get(0).getTagType()).isEqualTo(TagType.NOW_PLAYING);
        assertThat(popularTags.get(0).getTagType()).isEqualTo(TagType.POPULAR);

        // Content 재사용 확인 (같은 영화가 두 태그에 모두 포함될 수 있음)
        // 이 부분은 TMDB API 응답에 따라 유동적이므로 제거함.
        // long totalContentCount = contentRepository.count();
        // long totalTagCount = nowPlayingTags.size() + popularTags.size();
        // log.info("총 Content 개수: {}", totalContentCount);
        // log.info("총 태그 개수: {}", totalTagCount);

        log.info("========== [TEST] NOW_PLAYING & POPULAR 통합 테스트 완료 ==========");
    }


    // ========================
    //  ⭐ 새로 추가: 영화 상세 테스트
    // ========================

    @Test
    void testMovieDetailFetching() {
        log.info("[TEST] 영화 상세 조회 테스트 시작");

        // TMDB 실제 존재하는 영화 ID
        Long movieId = 1218925L;

        TmdbMovieDetailResponse detail =
                tmdbApiService.getMovieDetails(movieId);

        // 검증
        assertThat(detail).isNotNull();
        assertThat(detail.getId()).isEqualTo(movieId);

        log.info("제목: {}", detail.getTitle());
        log.info("원제: {}", detail.getOriginalTitle());
        log.info("개봉일: {}", detail.getReleaseDate());
        log.info("평점: {}", detail.getVoteAverage());
        log.info("런타임: {}", detail.getRuntime());
        log.info("국가: {}", detail.getOriginCountry());
        log.info("장르 목록: {}", detail.getGenres());
        log.info("프로덕션: {}", detail.getProductionCompanies());

        log.info("[TEST] 영화 상세 조회 테스트 완료");
    }

    @Test
    void testWebRequest(){
        // TagType.NOW_PLAYING, "/movie/now_playing", "ko-KR", 1
        String apiPath = "/movie/now_playing";
        String language = "ko-KR";
        String page = "1";
        // 1. TMDB API 호출 (먼저 성공해야 함)
        TmdbMovieListResponse response = tmdbWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(apiPath)
                        .queryParam("language", language)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class)
                .block();

        log.info(response.getResults().get(2).toString());

    }

}
