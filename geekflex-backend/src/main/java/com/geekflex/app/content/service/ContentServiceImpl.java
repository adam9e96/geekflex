package com.geekflex.app.content.service;

import com.geekflex.app.content.dto.ContentResponse;
import com.geekflex.app.content.dto.tmdb.MovieDetailResponse;
import com.geekflex.app.content.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.content.dto.tmdb.TmdbTvDetailResponse;
import com.geekflex.app.content.dto.tmdb.TvDetailResponse;
import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.entity.ContentType;
import com.geekflex.app.content.entity.TagType;
import com.geekflex.app.content.repository.ContentRepository;
import com.geekflex.app.content.service.factory.ContentFactory;
import com.geekflex.app.content.service.tmdb.TmdbApiService;
import com.geekflex.app.content.service.tmdb.TmdbDetailCache;
import com.geekflex.app.content.service.tmdb.TmdbSyncProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class ContentServiceImpl implements ContentService {
    private final ContentRepository contentRepository;
    private final ContentCacheManager contentCacheManager;
    private final TmdbApiService tmdbApiService;
    private final ContentFactory contentFactory;
    private final TmdbDetailCache tmdbDetailCache;
    private final TmdbSyncProperties tmdbSyncProperties;

    // 4개의 API에 대한 콘텐츠 불러오기
    @Override
    public List<ContentResponse> getContentsByTagType(TagType tagType) {
        return contentRepository.findByTagType(tagType)
                .stream()
                .map(ContentResponse::from)
                .toList();
    }

    @Override
    public ContentResponse getRandomContent() {
        return contentRepository.findRandom()
                .map(ContentResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("저장된 콘텐츠가 없습니다."));
    }

    @Override
    public List<ContentResponse> getRandomContentSuggestions() {
        return contentRepository.findRandomSuggestions()
                .stream()
                .map(ContentResponse::from)
                .toList();
    }

    @Override
    public MovieDetailResponse getMovieDetailWithCaching(Long tmdbId, String lang) {
        Content content = contentCacheManager.getOrCreate(tmdbId, ContentType.MOVIE);

        // freshness 체크: 동기화 주기 이내 + 캐시 hit이면 API 스킵
        if (content.isFresh(tmdbSyncProperties.getSyncInterval())) {
            TmdbMovieDetailResponse cached = tmdbDetailCache.getMovieDetail(tmdbId);
            if (cached != null) {
                log.debug("TMDB API 스킵 (fresh) - Movie tmdbId={}", tmdbId);
                return MovieDetailResponse.from(content, cached);
            }
        }

        // API 호출 필요 (stale 또는 캐시 miss)
        TmdbMovieDetailResponse detail = tmdbApiService.getMovieDetails(tmdbId);
        tmdbDetailCache.putMovieDetail(tmdbId, detail);

        // DB 비교&업데이트 + 동기화 시각 갱신
        boolean contentChanged = contentFactory.updateContentFromMovie(content, detail);
        content.setLastSyncedAt(LocalDateTime.now());
        contentRepository.save(content);

        if (!contentChanged) {
            log.debug("Content 변경 없음, 동기화 시각만 갱신 - Movie tmdbId={}", tmdbId);
        }

        return MovieDetailResponse.from(content, detail);
    }

    @Override
    public TvDetailResponse getTvDetailWithCaching(Long tmdbId, String lang) {
        Content content = contentCacheManager.getOrCreate(tmdbId, ContentType.TV);

        // freshness 체크: 동기화 주기 이내 + 캐시 hit이면 API 스킵
        if (content.isFresh(tmdbSyncProperties.getSyncInterval())) {
            TmdbTvDetailResponse cached = tmdbDetailCache.getTvDetail(tmdbId);
            if (cached != null) {
                log.debug("TMDB API 스킵 (fresh) - TV tmdbId={}", tmdbId);
                return TvDetailResponse.from(content, cached);
            }
        }

        // API 호출 필요 (stale 또는 캐시 miss)
        TmdbTvDetailResponse detail = tmdbApiService.getTvDetails(tmdbId);
        tmdbDetailCache.putTvDetail(tmdbId, detail);

        // DB 비교&업데이트 + 동기화 시각 갱신
        boolean contentChanged = contentFactory.updateContentFromTv(content, detail);
        content.setLastSyncedAt(LocalDateTime.now());
        contentRepository.save(content);

        if (!contentChanged) {
            log.debug("Content 변경 없음, 동기화 시각만 갱신 - TV tmdbId={}", tmdbId);
        }

        return TvDetailResponse.from(content, detail);
    }

    @Override
    public Content getOrCreateContent(Long tmdbId, ContentType contentType) {
        return contentCacheManager.getOrCreate(tmdbId, contentType);
    }
}








