package com.geekflex.app.review.service;

import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewBasic;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.exception.DuplicateReviewException;
import com.geekflex.app.review.repository.ReviewBasicRepository;
import com.geekflex.app.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * Review 도메인 서비스
 * 
 * 리뷰 도메인의 비즈니스 로직을 담당합니다.
 * - 리뷰 생성 규칙 검증
 * - 리뷰 수정 규칙 검증
 * - 리뷰 삭제 규칙 검증
 * - ReviewBasic과의 연관 관계 관리
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class ReviewDomainService {

    private final ReviewRepository reviewRepository;
    private final ReviewBasicRepository reviewBasicRepository;

    /**
     * 리뷰 중복 검증
     * 
     * @param userId 사용자 ID
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
     * BASIC 리뷰의 한줄평 검증
     * 
     * @param reviewType 리뷰 타입
     * @param comment 한줄평
     * @throws IllegalArgumentException BASIC 리뷰인데 한줄평이 없는 경우
     */
    public void validateBasicReviewComment(ReviewType reviewType, String comment) {
        if (reviewType == ReviewType.BASIC) {
            if (comment == null || comment.isBlank()) {
                throw new IllegalArgumentException("BASIC 리뷰는 한 줄평(comment)이 필요합니다.");
            }
        }
    }

    /**
     * ReviewBasic 생성 및 저장
     * 
     * @param reviewId 리뷰 ID
     * @param comment 한줄평
     * @return 저장된 ReviewBasic
     */
    public ReviewBasic createReviewBasic(Long reviewId, String comment) {
        ReviewBasic reviewBasic = ReviewBasic.builder()
                .reviewId(reviewId)
                .comment(comment)
                .build();
        
        return reviewBasicRepository.save(reviewBasic);
    }

    /**
     * ReviewBasic 업데이트 또는 생성
     * 
     * @param reviewId 리뷰 ID
     * @param comment 한줄평
     */
    public void updateOrCreateReviewBasic(Long reviewId, String comment) {
        reviewBasicRepository.findByReviewId(reviewId)
                .ifPresentOrElse(
                        basic -> basic.setComment(comment),
                        () -> createReviewBasic(reviewId, comment)
                );
    }

    /**
     * ReviewBasic 삭제 (SHORT 타입으로 변경 시)
     * 
     * @param reviewId 리뷰 ID
     */
    public void deleteReviewBasicIfExists(Long reviewId) {
        reviewBasicRepository.findByReviewId(reviewId)
                .ifPresent(reviewBasicRepository::delete);
    }

    /**
     * 리뷰 삭제 시 관련 ReviewBasic도 함께 삭제
     * 
     * @param review 리뷰 엔티티
     */
    public void deleteReviewWithBasic(Review review) {
        if (review.getReviewType() == ReviewType.BASIC) {
            deleteReviewBasicIfExists(review.getId());
        }
        reviewRepository.delete(review);
    }
}
