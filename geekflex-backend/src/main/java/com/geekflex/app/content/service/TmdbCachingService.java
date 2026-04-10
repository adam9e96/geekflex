package com.geekflex.app.content.service;

import com.geekflex.app.common.exception.TmdbApiException;
import com.geekflex.app.content.dto.tmdb.TmdbMovieListResponse;
import com.geekflex.app.content.dto.tmdb.TmdbTvListResponse;
import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.entity.ContentListTag;
import com.geekflex.app.content.entity.ContentType;
import com.geekflex.app.content.entity.TagType;
import com.geekflex.app.content.entity.TmdbGenre;
import com.geekflex.app.content.repository.ContentListTagRepository;
import com.geekflex.app.content.repository.ContentRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Log4j2
public class TmdbCachingService {

    private static final String DEFAULT_LANGUAGE = "ko-KR";
    private static final String DEFAULT_REGION = "KR";
    private static final int DEFAULT_PAGE = 1;
    private static final int MAX_RETRIES = 3;

    private final WebClient tmdbWebClient;
    private final ContentRepository contentRepository;
    private final ContentListTagRepository contentListTagRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void cacheCategory(TagType tagType, String apiPath) {
        TmdbMovieListResponse response = requestCategoryMovies(tagType, apiPath);
        if (isInvalidResponse(response, tagType)) {
            return;
        }

        replaceCategoryTags(tagType, response);
    }

    private TmdbMovieListResponse requestCategoryMovies(TagType tagType, String apiPath) {
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

        int count = response == null || response.getResults() == null ? 0 : response.getResults().size();
        log.info("TMDB 응답 수신 - API: {}: {}건", tagType, count);
        return response;
    }

    private boolean isInvalidResponse(TmdbMovieListResponse response, TagType tagType) {
        if (response != null && response.getResults() != null) {
            return false;
        }

        log.warn("TMDB 응답 실패 또는 빈 목록 (tagType: {})", tagType);
        return true;
    }

    private void replaceCategoryTags(TagType tagType, TmdbMovieListResponse response) {
        contentListTagRepository.deleteByTagType(tagType);

        Map<Long, ContentListTag> tagMap = buildTagMap(tagType, response);
        contentListTagRepository.saveAll(tagMap.values());

        log.info("[{}] 태그 저장 완료: {}건", tagType, tagMap.size());
    }

    private Map<Long, ContentListTag> buildTagMap(TagType tagType, TmdbMovieListResponse response) {
        Map<Long, ContentListTag> tagMap = new LinkedHashMap<>();

        for (TmdbMovieListResponse.MovieSummary movie : response.getResults()) {
            if (tagMap.containsKey(movie.getId())) {
                log.warn("중복된 영화 건너뛰기: tmdbId={}", movie.getId());
                continue;
            }

            Content content = getOrCreateContentInSeparateTransaction(movie);
            tagMap.put(movie.getId(), buildTag(tagType, content));
        }

        return tagMap;
    }

    private ContentListTag buildTag(TagType tagType, Content content) {
        return ContentListTag.builder()
                .content(content)
                .tagType(tagType)
                .region(DEFAULT_REGION)
                .build();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    private Content getOrCreateContentInSeparateTransaction(TmdbMovieListResponse.MovieSummary movie) {
        int retryCount = 0;

        while (retryCount < MAX_RETRIES) {
            try {
                return upsertContent(movie);
            } catch (CannotAcquireLockException | JpaSystemException e) {
                retryCount++;
                clearPersistenceContext();

                if (retryCount >= MAX_RETRIES) {
                    log.error("데드락 재시도 실패 ({}회 시도) - tmdbId={}", MAX_RETRIES, movie.getId(), e);
                    throw e;
                }

                log.warn("데드락 발생 - 재시도 {}/{} - tmdbId={}", retryCount, MAX_RETRIES, movie.getId());
                sleepBeforeRetry();
            } catch (DataIntegrityViolationException e) {
                clearPersistenceContext();
                log.warn("동시성 중복 INSERT 감지 - tmdbId={}", movie.getId());

                return contentRepository.findByTmdbIdAndContentType(movie.getId(), ContentType.MOVIE)
                        .map(existing -> updateContent(existing, movie))
                        .orElseThrow(() -> e);
            } catch (Exception e) {
                clearPersistenceContext();
                throw e;
            }
        }

        throw new TmdbApiException("영화 캐싱 재시도 로직 오류");
    }

    private Content upsertContent(TmdbMovieListResponse.MovieSummary movie) {
        return contentRepository.findByTmdbIdAndContentType(movie.getId(), ContentType.MOVIE)
                .map(existing -> updateContent(existing, movie))
                .orElseGet(() -> createContent(movie));
    }

    private void clearPersistenceContext() {
        entityManager.clear();
    }

    private void sleepBeforeRetry() {
        try {
            Thread.sleep(50 + (long) (Math.random() * 100));
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new TmdbApiException("재시도 중 인터럽트 발생", ie);
        }
    }

    private Content createContent(TmdbMovieListResponse.MovieSummary movie) {
        Content content = Content.builder()
                .tmdbId(movie.getId())
                .contentType(ContentType.MOVIE)
                .title(movie.getTitle())
                .originalTitle(movie.getOriginalTitle())
                .originalLanguage(movie.getOriginalLanguage())
                .overview(movie.getOverview())
                .posterUrl(movie.getPosterPath())
                .backdropUrl(movie.getBackdropPath())
                .releaseDate(movie.getReleaseDate())
                .voteAverage(movie.getVoteAverage())
                .voteCount(movie.getVoteCount())
                .popularity(movie.getPopularity())
                .genre(TmdbGenre.convertGenreIdsToString(movie.getGenreIds()))
                .originCountry("")
                .build();

        return contentRepository.save(content);
    }

    private Content updateContent(Content content, TmdbMovieListResponse.MovieSummary movie) {
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
        content.setGenre(TmdbGenre.convertGenreIdsToString(movie.getGenreIds()));
        return content;
    }

    // ========== TV 카테고리 캐싱 ==========

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void cacheTvCategory(TagType tagType, String apiPath) {
        TmdbTvListResponse response = requestCategoryTv(tagType, apiPath);
        if (isInvalidTvResponse(response, tagType)) {
            return;
        }

        replaceTvCategoryTags(tagType, response);
    }

    private TmdbTvListResponse requestCategoryTv(TagType tagType, String apiPath) {
        log.info("[{}] TMDB TV API 호출 시작", tagType);

        TmdbTvListResponse response = tmdbWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(apiPath)
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .queryParam("page", DEFAULT_PAGE)
                        .build())
                .retrieve()
                .bodyToMono(TmdbTvListResponse.class)
                .block();

        int count = response == null || response.getResults() == null ? 0 : response.getResults().size();
        log.info("TMDB TV 응답 수신 - API: {}: {}건", tagType, count);
        return response;
    }

    private boolean isInvalidTvResponse(TmdbTvListResponse response, TagType tagType) {
        if (response != null && response.getResults() != null) {
            return false;
        }

        log.warn("TMDB TV 응답 실패 또는 빈 목록 (tagType: {})", tagType);
        return true;
    }

    private void replaceTvCategoryTags(TagType tagType, TmdbTvListResponse response) {
        contentListTagRepository.deleteByTagType(tagType);

        Map<Long, ContentListTag> tagMap = buildTvTagMap(tagType, response);
        contentListTagRepository.saveAll(tagMap.values());

        log.info("[{}] TV 태그 저장 완료: {}건", tagType, tagMap.size());
    }

    private Map<Long, ContentListTag> buildTvTagMap(TagType tagType, TmdbTvListResponse response) {
        Map<Long, ContentListTag> tagMap = new LinkedHashMap<>();

        for (TmdbTvListResponse.TvSummary tv : response.getResults()) {
            if (tagMap.containsKey(tv.getId())) {
                log.warn("중복된 TV 건너뛰기: tmdbId={}", tv.getId());
                continue;
            }

            Content content = getOrCreateTvContentInSeparateTransaction(tv);
            tagMap.put(tv.getId(), buildTag(tagType, content));
        }

        return tagMap;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    private Content getOrCreateTvContentInSeparateTransaction(TmdbTvListResponse.TvSummary tv) {
        int retryCount = 0;

        while (retryCount < MAX_RETRIES) {
            try {
                return upsertTvContent(tv);
            } catch (CannotAcquireLockException | JpaSystemException e) {
                retryCount++;
                clearPersistenceContext();

                if (retryCount >= MAX_RETRIES) {
                    log.error("TV 데드락 재시도 실패 ({}회 시도) - tmdbId={}", MAX_RETRIES, tv.getId(), e);
                    throw e;
                }

                log.warn("TV 데드락 발생 - 재시도 {}/{} - tmdbId={}", retryCount, MAX_RETRIES, tv.getId());
                sleepBeforeRetry();
            } catch (DataIntegrityViolationException e) {
                clearPersistenceContext();
                log.warn("TV 동시성 중복 INSERT 감지 - tmdbId={}", tv.getId());

                return contentRepository.findByTmdbIdAndContentType(tv.getId(), ContentType.TV)
                        .map(existing -> updateTvContent(existing, tv))
                        .orElseThrow(() -> e);
            } catch (Exception e) {
                clearPersistenceContext();
                throw e;
            }
        }

        throw new TmdbApiException("TV 캐싱 재시도 로직 오류");
    }

    private Content upsertTvContent(TmdbTvListResponse.TvSummary tv) {
        return contentRepository.findByTmdbIdAndContentType(tv.getId(), ContentType.TV)
                .map(existing -> updateTvContent(existing, tv))
                .orElseGet(() -> createTvContent(tv));
    }

    private Content createTvContent(TmdbTvListResponse.TvSummary tv) {
        Content content = Content.builder()
                .tmdbId(tv.getId())
                .contentType(ContentType.TV)
                .title(tv.getName())
                .originalTitle(tv.getOriginalName())
                .originalLanguage(tv.getOriginalLanguage())
                .overview(tv.getOverview())
                .posterUrl(tv.getPosterPath())
                .backdropUrl(tv.getBackdropPath())
                .releaseDate(tv.getFirstAirDate())
                .voteAverage(tv.getVoteAverage())
                .voteCount(tv.getVoteCount())
                .popularity(tv.getPopularity())
                .genre(TmdbGenre.convertGenreIdsToString(tv.getGenreIds()))
                .originCountry("")
                .build();

        return contentRepository.save(content);
    }

    private Content updateTvContent(Content content, TmdbTvListResponse.TvSummary tv) {
        content.setTitle(tv.getName());
        content.setOriginalTitle(tv.getOriginalName());
        content.setOriginalLanguage(tv.getOriginalLanguage());
        content.setOverview(tv.getOverview());
        content.setPosterUrl(tv.getPosterPath());
        content.setBackdropUrl(tv.getBackdropPath());
        content.setReleaseDate(tv.getFirstAirDate());
        content.setVoteAverage(tv.getVoteAverage());
        content.setVoteCount(tv.getVoteCount());
        content.setPopularity(tv.getPopularity());
        content.setGenre(TmdbGenre.convertGenreIdsToString(tv.getGenreIds()));
        return content;
    }
}
