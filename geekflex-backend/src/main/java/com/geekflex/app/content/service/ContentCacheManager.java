package com.geekflex.app.content.service;

import com.geekflex.app.content.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.content.dto.tmdb.TmdbTvDetailResponse;
import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.entity.ContentType;
import com.geekflex.app.content.repository.ContentRepository;
import com.geekflex.app.content.service.factory.ContentFactory;
import com.geekflex.app.content.service.tmdb.TmdbApiService;
import com.geekflex.app.content.service.tmdb.TmdbDetailCache;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Log4j2
public class ContentCacheManager {

    private final ContentRepository contentRepository;
    private final TmdbApiService tmdbApiService;
    private final ContentFactory contentFactory;
    private final TmdbDetailCache tmdbDetailCache;

    public Content getOrCreate(Long tmdbId, ContentType type) {
        return contentRepository.findByTmdbIdAndContentType(tmdbId, type)
                .orElseGet(() -> {
                            Content content;

                            if (type == ContentType.MOVIE) {
                                TmdbMovieDetailResponse detail = tmdbApiService.getMovieDetails(tmdbId);
                                content = contentFactory.fromTmdbDetail(detail, type);
                                // TMDB 응답을 캐시에 저장하여 ContentServiceImpl에서 이중 API 호출 방지
                                tmdbDetailCache.putMovieDetail(tmdbId, detail);
                            } else if (type == ContentType.TV) {
                                TmdbTvDetailResponse detail = tmdbApiService.getTvDetails(tmdbId);
                                content = contentFactory.fromTmdbTvDetail(detail, type);
                                tmdbDetailCache.putTvDetail(tmdbId, detail);
                            } else {
                                log.warn("지원하지 않는 ContentType: {}", type);
                                throw new IllegalArgumentException("지원하지 않는 ContentType: " + type);
                            }

                            // 동기화 시각 설정 → ContentServiceImpl의 freshness 체크에서 API 스킵됨
                            content.setLastSyncedAt(LocalDateTime.now());

                            try {
                                return contentRepository.save(content);
                            } catch (DataIntegrityViolationException e) {
                                log.warn("동시성으로 인한 중복 INSERT 감지 - tmdbId={}, type={}",
                                        tmdbId, type, e);
                                return contentRepository.findByTmdbIdAndContentType(tmdbId, type)
                                        .orElseThrow(() -> e);
                            }
                        }
                );
    }
}







