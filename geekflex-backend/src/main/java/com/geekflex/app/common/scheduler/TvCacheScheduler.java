package com.geekflex.app.common.scheduler;

import com.geekflex.app.content.entity.TagType;
import com.geekflex.app.content.service.TmdbCachingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * TMDB TV 데이터를 정기적으로 가져와서 DB에 저장하는 스케줄러
 */
@Component
@Log4j2
@RequiredArgsConstructor
public class TvCacheScheduler {

    private final TmdbCachingService tmdbCachingService;

    /**
     * TV_AIRING_TODAY (오늘 방영) 데이터 갱신
     * 2일마다 새벽 3시 02분 00초에 실행
     */
    @Scheduled(cron = "0 2 3 */2 * *", zone = "Asia/Seoul")
    public void cacheAiringTodayTv() {
        log.info("[SCHEDULER] TV_AIRING_TODAY 데이터 캐싱 시작");
        try {
            tmdbCachingService.cacheTvCategory(TagType.TV_AIRING_TODAY, "/tv/airing_today");
            log.info("[SCHEDULER] TV_AIRING_TODAY 데이터 캐싱 완료");
        } catch (Exception e) {
            log.error("[SCHEDULER] TV_AIRING_TODAY 데이터 캐싱 실패", e);
        }
    }

    /**
     * TV_POPULAR (인기 드라마) 데이터 갱신
     * 2일마다 새벽 3시 02분 20초에 실행
     */
    @Scheduled(cron = "20 2 3 */2 * *", zone = "Asia/Seoul")
    public void cachePopularTv() {
        log.info("[SCHEDULER] TV_POPULAR 데이터 캐싱 시작");
        try {
            tmdbCachingService.cacheTvCategory(TagType.TV_POPULAR, "/tv/popular");
            log.info("[SCHEDULER] TV_POPULAR 데이터 캐싱 완료");
        } catch (Exception e) {
            log.error("[SCHEDULER] TV_POPULAR 데이터 캐싱 실패", e);
        }
    }

    /**
     * TV_TOP_RATED (높은 평점) 데이터 갱신
     * 2일마다 새벽 3시 02분 40초에 실행
     */
    @Scheduled(cron = "40 2 3 */2 * *", zone = "Asia/Seoul")
    public void cacheTopRatedTv() {
        log.info("[SCHEDULER] TV_TOP_RATED 데이터 캐싱 시작");
        try {
            tmdbCachingService.cacheTvCategory(TagType.TV_TOP_RATED, "/tv/top_rated");
            log.info("[SCHEDULER] TV_TOP_RATED 데이터 캐싱 완료");
        } catch (Exception e) {
            log.error("[SCHEDULER] TV_TOP_RATED 데이터 캐싱 실패", e);
        }
    }

    /**
     * TV_ON_THE_AIR (방영 중) 데이터 갱신
     * 2일마다 새벽 3시 03분 00초에 실행
     */
    @Scheduled(cron = "0 3 3 */2 * *", zone = "Asia/Seoul")
    public void cacheOnTheAirTv() {
        log.info("[SCHEDULER] TV_ON_THE_AIR 데이터 캐싱 시작");
        try {
            tmdbCachingService.cacheTvCategory(TagType.TV_ON_THE_AIR, "/tv/on_the_air");
            log.info("[SCHEDULER] TV_ON_THE_AIR 데이터 캐싱 완료");
        } catch (Exception e) {
            log.error("[SCHEDULER] TV_ON_THE_AIR 데이터 캐싱 실패", e);
        }
    }
}
