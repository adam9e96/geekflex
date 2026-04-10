package com.geekflex.app.admin.service;

import com.geekflex.app.content.entity.TagType;
import com.geekflex.app.content.service.TmdbCachingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

/**
 * 관리자 캐싱 서비스
 * <p>
 * TMDB 데이터 수동 캐싱을 담당합니다.
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class AdminCacheService {

    private final TmdbCachingService tmdbCachingService;

    /** 영화 카테고리 수동 캐싱 */
    public void cacheMovieCategory(TagType tagType, String apiPath) {
        log.info("[ADMIN] {} 수동 캐싱 요청", tagType);
        tmdbCachingService.cacheCategory(tagType, apiPath);
        log.info("[ADMIN] {} 수동 캐싱 완료", tagType);
    }

    /** TV 카테고리 수동 캐싱 */
    public void cacheTvCategory(TagType tagType, String apiPath) {
        log.info("[ADMIN] {} TV 수동 캐싱 요청", tagType);
        tmdbCachingService.cacheTvCategory(tagType, apiPath);
        log.info("[ADMIN] {} TV 수동 캐싱 완료", tagType);
    }
}
