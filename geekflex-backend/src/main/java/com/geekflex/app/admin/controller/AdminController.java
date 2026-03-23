package com.geekflex.app.admin.controller;

import com.geekflex.app.content.entity.TagType;
import com.geekflex.app.content.service.TmdbCachingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/scheduler")
@RequiredArgsConstructor
@Log4j2
public class AdminController {

    private final TmdbCachingService tmdbCachingService;

    @PostMapping("/now-playing")
    public ResponseEntity<Map<String, String>> cacheNowPlaying() {
        return executeCache(TagType.NOW_PLAYING, "/movie/now_playing");
    }

    @PostMapping("/popular")
    public ResponseEntity<Map<String, String>> cachePopular() {
        return executeCache(TagType.POPULAR, "/movie/popular");
    }

    @PostMapping("/top-rated")
    public ResponseEntity<Map<String, String>> cacheTopRated() {
        return executeCache(TagType.TOP_RATED, "/movie/top_rated");
    }

    @PostMapping("/upcoming")
    public ResponseEntity<Map<String, String>> cacheUpcoming() {
        return executeCache(TagType.UPCOMING, "/movie/upcoming");
    }

    private ResponseEntity<Map<String, String>> executeCache(TagType tagType, String apiPath) {
        log.info("[ADMIN] {} 수동 캐싱 요청", tagType);
        try {
            tmdbCachingService.cacheCategory(tagType, apiPath);
            log.info("[ADMIN] {} 수동 캐싱 완료", tagType);
            return ResponseEntity.ok(Map.of("message", tagType + " 데이터가 성공적으로 업데이트되었습니다."));
        } catch (Exception e) {
            log.error("[ADMIN] {} 수동 캐싱 실패", tagType, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", tagType + " 업데이트 실패: " + e.getMessage()));
        }
    }
}
