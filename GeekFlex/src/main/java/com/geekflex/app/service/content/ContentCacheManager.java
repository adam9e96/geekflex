package com.geekflex.app.service.content;

import com.geekflex.app.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.dto.tmdb.TmdbTvDetailResponse;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.repository.ContentRepository;
import com.geekflex.app.service.factory.ContentFactory;
import com.geekflex.app.service.tmdb.TmdbApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class ContentCacheManager {

    private final ContentRepository contentRepository;
    private final TmdbApiService tmdbApiService;
    private final ContentFactory contentFactory;

    public Content getOrCreate(Long tmdbId, ContentType type) {
        // 1. tmdbId 로 먼저 조회
        return contentRepository.findByTmdbId(tmdbId)
                .orElseGet(() -> {
                    // 2. 없으면 contentType 에 맞는 TMDB 상세 정보로 Content 생성
                    Content content;

                    if (type == ContentType.MOVIE) {
                        TmdbMovieDetailResponse detail = tmdbApiService.getMovieDetails(tmdbId);
                        content = contentFactory.fromTmdbDetail(detail, type);
                    } else if (type == ContentType.TV) {
                        TmdbTvDetailResponse detail = tmdbApiService.getTvDetails(tmdbId);
                        content = contentFactory.fromTmdbTvDetail(detail, type);
                    } else {
                        log.warn("지원하지 않는 ContentType: {}", type);
                        throw new IllegalArgumentException("지원하지 않는 ContentType: " + type);
                    }

                    // 3. 새 Content 저장 (id = PK, tmdbId 도 컬럼에 함께 저장)
                    try {
                        return contentRepository.save(content);
                    } catch (DataIntegrityViolationException e) {
                        // 동시 요청으로 이미 다른 트랜잭션이 동일 tmdbId/type 를 INSERT 한 경우
                        log.warn("동시성으로 인한 중복 INSERT 감지 - tmdbId={}, type={}", tmdbId, type, e);
                        return contentRepository.findByTmdbId(tmdbId)
                                .orElseThrow(() -> e);
                    }
                });
    }
}