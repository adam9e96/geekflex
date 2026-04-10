package com.geekflex.app.review.controller;

import com.geekflex.app.review.service.ReviewService;
import com.geekflex.app.review.service.ReviewQueryService;
import com.geekflex.app.review.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Review", description = "리뷰 CRUD API")
public class ReviewController {
    private final ReviewService reviewService;
    private final ReviewQueryService reviewQueryService;

    @Operation(summary = "리뷰 작성", description = "특정 콘텐츠에 리뷰를 작성합니다. 콘텐츠당 1개의 리뷰만 작성 가능합니다.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201", description = "리뷰 작성 성공",
                    content = @Content(schema = @Schema(implementation = ReviewCreateResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "입력값 검증 실패"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "409", description = "중복 리뷰")
    })
    @PostMapping("/{contentId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewCreateResponse createReview(
            @Parameter(description = "리뷰 대상 콘텐츠 ID") @PathVariable Long contentId,
            @Valid @RequestBody ReviewCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("Review 추가 contentId = {} ", contentId);
        return reviewService.createReview(userDetails.getUsername(), contentId, request);
    }

    @Operation(summary = "콘텐츠별 리뷰 목록 조회", description = "특정 콘텐츠에 작성된 모든 리뷰를 조회합니다.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReviewResponse.class)))
            )
    })
    @GetMapping("/content/{contentId}")
    public List<ReviewResponse> getReviews(
            @Parameter(description = "조회할 콘텐츠 ID") @PathVariable Long contentId
    ) {
        return reviewQueryService.getReviewsByContentId(contentId);
    }

    @Operation(summary = "리뷰 수정", description = "본인이 작성한 리뷰를 수정합니다. 리뷰 타입은 변경할 수 없습니다.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200", description = "리뷰 수정 성공",
                    content = @Content(schema = @Schema(implementation = ReviewResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "본인 리뷰가 아니거나 타입 변경 시도"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @PutMapping("/{reviewId}")
    public ReviewResponse updateReview(
            @Parameter(description = "수정할 리뷰 ID") @PathVariable Long reviewId,
            @Valid @RequestBody ReviewUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return reviewService.updateReview(reviewId, userDetails.getUsername(), request);
    }

    @Operation(summary = "리뷰 삭제", description = "본인이 작성한 리뷰를 삭제합니다. 성공 시 204 No Content를 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "리뷰 삭제 성공"),
            @ApiResponse(responseCode = "400", description = "본인 리뷰가 아님"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @Parameter(description = "삭제할 리뷰 ID") @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        reviewService.deleteReview(reviewId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "내 리뷰 목록 조회", description = "현재 로그인한 사용자가 작성한 리뷰 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReviewMyPageResponse.class)))
            ),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping("/me")
    public List<ReviewMyPageResponse> getMyReviewList(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return reviewQueryService.getMyReviews(userDetails.getUsername());
    }

    @Operation(summary = "내 리뷰 개수 조회", description = "현재 로그인한 사용자가 작성한 리뷰의 총 개수를 반환합니다.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ReviewCountResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping("/me/count")
    public ReviewCountResponse getMyReviewCount(@AuthenticationPrincipal UserDetails userDetails) {
        return reviewQueryService.getMyReviewCounts(userDetails.getUsername());
    }

}









