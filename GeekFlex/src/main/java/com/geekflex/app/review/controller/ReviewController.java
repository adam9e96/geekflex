package com.geekflex.app.review.controller;

import com.geekflex.app.review.service.ReviewService;
import com.geekflex.app.review.service.ReviewQueryService;
import com.geekflex.app.review.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final ReviewQueryService reviewQueryService;

    @PostMapping("/{tmdbId}")
    public ReviewCreateResponse createReview(
            @PathVariable Long tmdbId,
            @RequestBody ReviewCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("Review Create Request  tmdbId = {} ", tmdbId);
        return reviewService.createReview(
                userDetails.getUsername(),
                tmdbId,
                request
        );
    }

    /**
     * 특정 콘텐츠의 리뷰 리스트 조회 (콘텐츠 PK 사용)
     */
    @GetMapping("/content/{contentId}")
    public List<ReviewResponse> getReviews(
            @PathVariable Long contentId
    ) {
        return reviewQueryService.getReviewsByContentId(contentId);
    }

    // 리뷰 수정
    @PutMapping("/{reviewId}")
    public ReviewResponse updateReview(
            @PathVariable Long reviewId,
            @RequestBody ReviewUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return reviewService.updateReview(reviewId, userDetails.getUsername(), request);
    }

    //   리뷰 삭제
    // 삭제 성공시 204 NO CONTENT 를 반환한다.
    // 200 이 아닌 204 인이유 데이터 삭제& 응답 바다 필요없음이라서
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        reviewService.deleteReview(reviewId, userDetails.getUsername());

        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @GetMapping("/me")
    public List<ReviewMyPageResponse> getMyReviewList(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return reviewQueryService.getMyReviews(userDetails.getUsername());
    }

    // 내가 작성한 리뷰의 총 개수 반환
    @GetMapping("/me/count")
    public ReviewCountResponse getMyReviewCount(@AuthenticationPrincipal UserDetails userDetails) {
        return reviewQueryService.getMyReviewCounts(userDetails.getUsername());

    }

}

