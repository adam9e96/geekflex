package com.geekflex.app.content.service.tmdb;

import com.geekflex.app.content.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.content.dto.tmdb.TmdbTvDetailResponse;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Component;

/**
 * TMDB API 응답을 인메모리 캐싱하는 컴포넌트.
 * DB에 저장하지 않는 상세 필드(genres, runtime, productionCompanies 등)를
 * API 재호출 없이 제공하기 위해 사용한다.
 */
@Component
public class TmdbDetailCache {

    private final Cache<Long, TmdbMovieDetailResponse> movieCache;
    private final Cache<Long, TmdbTvDetailResponse> tvCache;

    public TmdbDetailCache(TmdbSyncProperties tmdbSyncProperties) {
        this.movieCache = Caffeine.newBuilder()
                .maximumSize(5_000)
                .expireAfterWrite(tmdbSyncProperties.getSyncInterval())
                .build();

        this.tvCache = Caffeine.newBuilder()
                .maximumSize(5_000)
                .expireAfterWrite(tmdbSyncProperties.getSyncInterval())
                .build();
    }

    public TmdbMovieDetailResponse getMovieDetail(Long tmdbId) {
        return movieCache.getIfPresent(tmdbId);
    }

    public void putMovieDetail(Long tmdbId, TmdbMovieDetailResponse response) {
        movieCache.put(tmdbId, response);
    }

    public TmdbTvDetailResponse getTvDetail(Long tmdbId) {
        return tvCache.getIfPresent(tmdbId);
    }

    public void putTvDetail(Long tmdbId, TmdbTvDetailResponse response) {
        tvCache.put(tmdbId, response);
    }
}
