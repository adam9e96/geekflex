package com.geekflex.app.like.controller;

import com.geekflex.app.dto.ApiResponse;
import com.geekflex.app.like.dto.LikeCountResponse;
import com.geekflex.app.like.dto.LikeStatusResponse;
import com.geekflex.app.like.dto.LikeToggleResponse;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.like.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Log4j2
@RestController
@RequestMapping("/api/v1/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    /**
     * 좋아요 토글 API (POST)
     * /api/v1/likes/{targetType}/{targetId}
     *
     * @param targetType  타겟 타입 (REVIEW, COMMENT 등)
     * @param targetId    타겟 ID (리뷰/댓글 ID 등)
     * @param userDetails 인증된 사용자 정보
     * @return 좋아요 상태 및 개수 정보
     */
    @PostMapping("/{targetType}/{targetId}")
    public ResponseEntity<ApiResponse<LikeToggleResponse>> toggleLike(
            @PathVariable TargetType targetType,
            @PathVariable Long targetId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("좋아요 토글 요청: targetType={}, targetId={}, username={}",
                targetType, targetId, userDetails != null ? userDetails.getUsername() : "null");

        if (userDetails == null) {
            log.warn("인증되지 않은 사용자의 좋아요 토글 시도: targetType={}, targetId={}", targetType, targetId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("인증이 필요합니다."));
        }

        try {
            LikeToggleResponse response =
                    likeService.toggleLike(userDetails.getUsername(), targetType, targetId);

            // liked 상태에 따라 메시지 설정
            String message = response.isLiked()
                    ? "좋아요가 추가되었습니다."
                    : "좋아요가 취소되었습니다.";

            ApiResponse<LikeToggleResponse> apiResponse = ApiResponse.<LikeToggleResponse>builder()
                    .success(true)
                    .message(message)
                    .data(response)
                    .build();

            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            log.error("좋아요 토글 처리 중 오류 발생: targetType={}, targetId={}", targetType, targetId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("좋아요 처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 좋아요 상태 조회 API (GET)
     * /api/v1/likes/{targetType}/{targetId}
     */
    @GetMapping("/{targetType}/{targetId}")
    public ResponseEntity<ApiResponse<LikeStatusResponse>> getLikeStatus(
            @PathVariable TargetType targetType,
            @PathVariable Long targetId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = (userDetails != null) ? userDetails.getUsername() : null;

        LikeStatusResponse likeStatus =
                likeService.getLikeStatus(username, targetType, targetId);

        ApiResponse<LikeStatusResponse> apiResponse = ApiResponse.<LikeStatusResponse>builder()
                .success(true)
                .message("좋아요 상태 조회에 성공했습니다.")
                .data(likeStatus)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * 좋아요 개수 조회 API (GET)
     * /api/v1/likes/{targetType}/{targetId}/all
     */
    @GetMapping("/{targetType}/{targetId}/all")
    public ResponseEntity<ApiResponse<LikeCountResponse>> getAllLike(
            @PathVariable TargetType targetType,
            @PathVariable Long targetId
    ) {
        LikeCountResponse likeCount = likeService.countLikes(targetType, targetId);

        ApiResponse<LikeCountResponse> apiResponse = ApiResponse.<LikeCountResponse>builder()
                .success(true)
                .message("좋아요 개수 조회에 성공했습니다.")
                .data(likeCount)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

}

