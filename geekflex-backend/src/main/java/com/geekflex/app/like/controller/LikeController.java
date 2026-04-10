package com.geekflex.app.like.controller;

import com.geekflex.app.common.dto.ApiResponse;
import com.geekflex.app.like.dto.LikeCountResponse;
import com.geekflex.app.like.dto.LikeStatusResponse;
import com.geekflex.app.like.dto.LikeToggleResponse;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.like.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RestController
@RequestMapping("/api/v1/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    /**
     * 좋아요 토글 API
     * 인증된 사용자만 호출 가능합니다.
     */
    @PostMapping("/{targetType}/{targetId}")
    public ApiResponse<LikeToggleResponse> toggleLike(
            @PathVariable TargetType targetType,
            @PathVariable Long targetId,
            @AuthenticationPrincipal UserDetails userDetails) {

        LikeToggleResponse response = likeService.toggleLike(
                userDetails.getUsername(), targetType, targetId);

        String message = response.isLiked() ? "좋아요가 추가되었습니다." : "좋아요가 취소되었습니다.";
        return ApiResponse.success(response, message);
    }

    /**
     * 좋아요 상태 조회 API
     * 비로그인 사용자도 조회 가능합니다. (liked=false 반환)
     */
    @GetMapping("/{targetType}/{targetId}")
    public ApiResponse<LikeStatusResponse> getLikeStatus(
            @PathVariable TargetType targetType,
            @PathVariable Long targetId,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = (userDetails != null) ? userDetails.getUsername() : null;
        LikeStatusResponse response = likeService.getLikeStatus(username, targetType, targetId);
        return ApiResponse.success(response);
    }

    /**
     * 좋아요 개수 조회 API
     */
    @GetMapping("/{targetType}/{targetId}/all")
    public ApiResponse<LikeCountResponse> getAllLike(
            @PathVariable TargetType targetType,
            @PathVariable Long targetId) {

        LikeCountResponse response = likeService.countLikes(targetType, targetId);
        return ApiResponse.success(response);
    }

    /**
     * 일괄 좋아요 상태 조회 API
     * 비로그인 사용자도 조회 가능합니다. (빈 목록 반환)
     */
    @GetMapping("/{targetType}")
    public ApiResponse<List<Long>> getLikeStatuses(
            @PathVariable TargetType targetType,
            @RequestParam(value = "reviewIds", required = false) List<Long> reviewIds,
            @RequestParam(value = "targetIds", required = false) List<Long> targetIds,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<Long> ids = (reviewIds != null && !reviewIds.isEmpty()) ? reviewIds : targetIds;
        String username = (userDetails != null) ? userDetails.getUsername() : null;

        List<Long> likedIds = likeService.getLikeStatuses(username, targetType, ids);
        return ApiResponse.success(likedIds);
    }

}








