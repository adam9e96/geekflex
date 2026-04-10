package com.geekflex.app.admin.controller;

import com.geekflex.app.admin.service.AdminCacheService;
import com.geekflex.app.common.dto.ApiResponse;
import com.geekflex.app.content.entity.TagType;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/scheduler")
@RequiredArgsConstructor
@Log4j2
public class AdminController {

    private final AdminCacheService adminCacheService;

    @PostMapping("/now-playing")
    public ApiResponse<Void> cacheNowPlaying() {
        adminCacheService.cacheMovieCategory(TagType.NOW_PLAYING, "/movie/now_playing");
        return ApiResponse.successMessage("NOW_PLAYING 데이터가 성공적으로 업데이트되었습니다.");
    }

    @PostMapping("/popular")
    public ApiResponse<Void> cachePopular() {
        adminCacheService.cacheMovieCategory(TagType.POPULAR, "/movie/popular");
        return ApiResponse.successMessage("POPULAR 데이터가 성공적으로 업데이트되었습니다.");
    }

    @PostMapping("/top-rated")
    public ApiResponse<Void> cacheTopRated() {
        adminCacheService.cacheMovieCategory(TagType.TOP_RATED, "/movie/top_rated");
        return ApiResponse.successMessage("TOP_RATED 데이터가 성공적으로 업데이트되었습니다.");
    }

    @PostMapping("/upcoming")
    public ApiResponse<Void> cacheUpcoming() {
        adminCacheService.cacheMovieCategory(TagType.UPCOMING, "/movie/upcoming");
        return ApiResponse.successMessage("UPCOMING 데이터가 성공적으로 업데이트되었습니다.");
    }

    @PostMapping("/tv/airing-today")
    public ApiResponse<Void> cacheTvAiringToday() {
        adminCacheService.cacheTvCategory(TagType.TV_AIRING_TODAY, "/tv/airing_today");
        return ApiResponse.successMessage("TV_AIRING_TODAY 데이터가 성공적으로 업데이트되었습니다.");
    }

    @PostMapping("/tv/popular")
    public ApiResponse<Void> cacheTvPopular() {
        adminCacheService.cacheTvCategory(TagType.TV_POPULAR, "/tv/popular");
        return ApiResponse.successMessage("TV_POPULAR 데이터가 성공적으로 업데이트되었습니다.");
    }

    @PostMapping("/tv/top-rated")
    public ApiResponse<Void> cacheTvTopRated() {
        adminCacheService.cacheTvCategory(TagType.TV_TOP_RATED, "/tv/top_rated");
        return ApiResponse.successMessage("TV_TOP_RATED 데이터가 성공적으로 업데이트되었습니다.");
    }

    @PostMapping("/tv/on-the-air")
    public ApiResponse<Void> cacheTvOnTheAir() {
        adminCacheService.cacheTvCategory(TagType.TV_ON_THE_AIR, "/tv/on_the_air");
        return ApiResponse.successMessage("TV_ON_THE_AIR 데이터가 성공적으로 업데이트되었습니다.");
    }
}
