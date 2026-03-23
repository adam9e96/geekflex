package com.geekflex.app.common.scheduler;
import com.geekflex.app.content.entity.TagType;
import com.geekflex.app.content.service.TmdbCachingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * TMDB 영화 데이터를 정기적으로 가져와서 DB에 저장하는 스케줄러
 */
@Component
@Log4j2
@RequiredArgsConstructor
public class MovieCacheScheduler {

    private final TmdbCachingService tmdbCachingService;

    /**
     * NOW_PLAYING (현재 상영작) 데이터 갱신
     * 5분마다 0초에 실행 (예: 11:00:00, 11:05:00, 11:10:00...)
     */
    @Scheduled(cron = "0 */5 * * * *", zone = "Asia/Seoul")
    public void cacheNowPlayingMovies() {
        log.info("[SCHEDULER] NOW_PLAYING 영화 데이터 캐싱 시작");
        try {
            tmdbCachingService.cacheCategory(TagType.NOW_PLAYING, "/movie/now_playing");
            log.info("[SCHEDULER] NOW_PLAYING 영화 데이터 캐싱 완료");
        } catch (Exception e) {
            log.error("[SCHEDULER] NOW_PLAYING 영화 데이터 캐싱 실패", e);
        }
    }

    /**
     * POPULAR (인기 영화) 데이터 갱신
     * 5분마다 10초에 실행 (예: 11:00:10, 11:05:10, 11:10:10...)
     */
    @Scheduled(cron = "10 */5 * * * *", zone = "Asia/Seoul")
    public void cachePopularMovies() {
        log.info("[SCHEDULER] POPULAR 영화 데이터 캐싱 시작");
        try {
            tmdbCachingService.cacheCategory(TagType.POPULAR, "/movie/popular");
            log.info("[SCHEDULER] POPULAR 영화 데이터 캐싱 완료");
        } catch (Exception e) {
            log.error("[SCHEDULER] POPULAR 영화 데이터 캐싱 실패", e);
        }
    }

    /**
     * UPCOMING (개봉 예정) 데이터 갱신
     * 5분마다 20초에 실행 (예: 11:00:20, 11:05:20, 11:10:20...)
     */
    @Scheduled(cron = "20 */5 * * * *", zone = "Asia/Seoul")
    public void cacheUpcomingMovies() {
        log.info("[SCHEDULER] UPCOMING 영화 데이터 캐싱 시작");
        try {
            tmdbCachingService.cacheCategory(TagType.UPCOMING, "/movie/upcoming");
            log.info("[SCHEDULER] UPCOMING 영화 데이터 캐싱 완료");
        } catch (Exception e) {
            log.error("[SCHEDULER] UPCOMING 영화 데이터 캐싱 실패", e);
        }
    }

    /**
     * TOP_RATED (인기있는) 데이터 갱신
     * 5분마다 30초에 실행 (예: 11:00:30, 11:05:30, 11:10:30...)
     */
    @Scheduled(cron = "30 */5 * * * *", zone = "Asia/Seoul")
    public void cacheTopRatedMovies() {
        log.info("[SCHEDULER] TOP_RATED 영화 데이터 캐싱 시작");
        try {
            tmdbCachingService.cacheCategory(TagType.TOP_RATED, "/movie/top_rated");
            log.info("[SCHEDULER] TOP_RATED 영화 데이터 캐싱 완료");
        } catch (Exception e) {
            log.error("[SCHEDULER] TOP_RATED 영화 데이터 캐싱 실패", e);
        }
    }
}








