package com.geekflex.app.review.service;

import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.exception.DuplicateReviewException;
import com.geekflex.app.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * Review 검증 서비스
 * <p>
 * 리뷰 도메인의 비즈니스 규칙 검증을 담당합니다.
 * - 리뷰 중복 검증
 * - 리뷰 소유권 검증
 * - 리뷰 타입별 제약 조건 검증
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class ReviewValidator {

    private final ReviewRepository reviewRepository;

    /**
     * 리뷰 중복 검증
     *
     * @param userId    사용자 ID
     * @param contentId 콘텐츠 ID
     * @throws DuplicateReviewException 이미 리뷰가 존재하는 경우
     */
    public void validateReviewNotExists(Long userId, Long contentId) {
        reviewRepository.findByUserIdAndContentId(userId, contentId)
                .ifPresent(r -> {
                    throw new DuplicateReviewException("이미 이 작품에 대한 리뷰가 존재합니다.");
                });
    }

    /**
     * 리뷰 소유권 검증
     *
     * @param review 리뷰 엔티티
     * @param userId 사용자 ID
     * @throws IllegalArgumentException 본인의 리뷰가 아닌 경우
     */
    public void validateReviewOwnership(Review review, Long userId) {
        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 리뷰만 수정/삭제할 수 있습니다.");
        }
    }

    /**
     * 리뷰 타입 변경 방지 검증
     *
     * @param currentType 현재 리뷰 타입
     * @param requestType 요청된 리뷰 타입
     * @throws IllegalArgumentException 타입이 다른 경우
     */
    public void validateReviewTypeSame(ReviewType currentType, ReviewType requestType) {
        if (currentType != requestType) {
            throw new IllegalArgumentException(
                    "리뷰 타입은 변경할 수 없습니다. 타입을 변경하려면 리뷰를 삭제 후 다시 작성해주세요."
            );
        }
    }

    /**
     * 리뷰 수정 요청 검증
     * 소유권, 타입 변경 방지, 타입별 제약 조건을 순서대로 검증합니다.
     *
     * @param review        기존 리뷰 엔티티
     * @param currentUserId 요청한 사용자 ID
     * @param requestType   요청된 리뷰 타입
     * @param comment       한줄평
     */
    public void validateUpdateRequest(Review review, Long currentUserId, ReviewType requestType, String comment) {
        validateReviewOwnership(review, currentUserId);
        validateReviewTypeSame(review.getReviewType(), requestType);
        validateReviewTypeConstraints(requestType, comment);
    }

    /**
     * 리뷰 타입별 제약 조건 검증
     *
     * @param reviewType 리뷰 타입
     * @param comment    한줄평
     * @throws IllegalArgumentException 타입별 제약 조건 위반 시
     */
    public void validateReviewTypeConstraints(ReviewType reviewType, String comment) {
        switch (reviewType) {
            case BASIC -> {
                if (comment == null || comment.isBlank()) {
                    throw new IllegalArgumentException("BASIC 리뷰는 한 줄평(comment)이 필요합니다.");
                }
            }
            case SHORT -> {
                if (comment != null && !comment.isBlank()) {
                    throw new IllegalArgumentException("SHORT 리뷰는 한 줄평(comment)을 포함할 수 없습니다.");
                }
            }
            case DETAILED -> throw new IllegalArgumentException("DETAILED 리뷰는 아직 지원되지 않습니다.");
        }
    }
}