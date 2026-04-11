package com.geekflex.app.common.scheduler;

import com.geekflex.app.admin.service.AdminCacheService;
import com.geekflex.app.content.entity.TagType;
import com.geekflex.app.content.repository.ContentListTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@Log4j2
@RequiredArgsConstructor
public class InitialContentSeedRunner {

    private final ContentListTagRepository contentListTagRepository;
    private final AdminCacheService adminCacheService;
    private final TaskScheduler taskScheduler;

    private static final Map<TagType, String> MOVIE_SEED_TARGETS = new LinkedHashMap<>();
    private static final Map<TagType, String> TV_SEED_TARGETS = new LinkedHashMap<>();

    static {
        MOVIE_SEED_TARGETS.put(TagType.NOW_PLAYING, "/movie/now_playing");
        MOVIE_SEED_TARGETS.put(TagType.POPULAR, "/movie/popular");
        MOVIE_SEED_TARGETS.put(TagType.TOP_RATED, "/movie/top_rated");
        MOVIE_SEED_TARGETS.put(TagType.UPCOMING, "/movie/upcoming");

        TV_SEED_TARGETS.put(TagType.TV_AIRING_TODAY, "/tv/airing_today");
        TV_SEED_TARGETS.put(TagType.TV_POPULAR, "/tv/popular");
        TV_SEED_TARGETS.put(TagType.TV_TOP_RATED, "/tv/top_rated");
        TV_SEED_TARGETS.put(TagType.TV_ON_THE_AIR, "/tv/on_the_air");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedMissingContentAfterStartup() {
        taskScheduler.schedule(this::seedMissingContentSafely, Instant.now().plusSeconds(5));
    }

    private void seedMissingContentSafely() {
        try {
            seedMissingMovieTags();
            seedMissingTvTags();
        } catch (Exception e) {
            log.error("[BOOTSTRAP] 초기 콘텐츠 시드 작업 중 오류가 발생했습니다.", e);
        }
    }

    private void seedMissingMovieTags() {
        boolean hasMissingMovieSeed = MOVIE_SEED_TARGETS.keySet().stream()
                .anyMatch(tagType -> !contentListTagRepository.existsByTagType(tagType));

        if (!hasMissingMovieSeed) {
            log.info("[BOOTSTRAP] 영화 캐시 시드 건너뜀 - 기존 데이터가 이미 존재합니다.");
            return;
        }

        log.info("[BOOTSTRAP] 영화 캐시 시드 시작");
        MOVIE_SEED_TARGETS.forEach((tagType, apiPath) -> {
            if (contentListTagRepository.existsByTagType(tagType)) {
                log.info("[BOOTSTRAP] {} 시드 건너뜀 - 기존 데이터 존재", tagType);
                return;
            }

            try {
                adminCacheService.cacheMovieCategory(tagType, apiPath);
            } catch (Exception e) {
                log.error("[BOOTSTRAP] {} 영화 시드 실패", tagType, e);
            }
        });
        log.info("[BOOTSTRAP] 영화 캐시 시드 종료");
    }

    private void seedMissingTvTags() {
        boolean hasMissingTvSeed = TV_SEED_TARGETS.keySet().stream()
                .anyMatch(tagType -> !contentListTagRepository.existsByTagType(tagType));

        if (!hasMissingTvSeed) {
            log.info("[BOOTSTRAP] TV 캐시 시드 건너뜀 - 기존 데이터가 이미 존재합니다.");
            return;
        }

        log.info("[BOOTSTRAP] TV 캐시 시드 시작");
        TV_SEED_TARGETS.forEach((tagType, apiPath) -> {
            if (contentListTagRepository.existsByTagType(tagType)) {
                log.info("[BOOTSTRAP] {} 시드 건너뜀 - 기존 데이터 존재", tagType);
                return;
            }

            try {
                adminCacheService.cacheTvCategory(tagType, apiPath);
            } catch (Exception e) {
                log.error("[BOOTSTRAP] {} TV 시드 실패", tagType, e);
            }
        });
        log.info("[BOOTSTRAP] TV 캐시 시드 종료");
    }
}
