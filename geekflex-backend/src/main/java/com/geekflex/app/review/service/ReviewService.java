package com.geekflex.app.review.service;

import com.geekflex.app.content.repository.ContentRepository;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.review.dto.ReviewCreateRequest;
import com.geekflex.app.review.dto.ReviewCreateResponse;
import com.geekflex.app.review.dto.ReviewResponse;
import com.geekflex.app.review.dto.ReviewUpdateRequest;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewBasic;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.repository.ReviewBasicRepository;
import com.geekflex.app.review.repository.ReviewRepository;
import com.geekflex.app.user.entity.ActionType;
import com.geekflex.app.user.entity.User;
import com.geekflex.app.user.service.UserActivityLogService;
import com.geekflex.app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 리뷰 명령 서비스
 * <p>
 * 리뷰의 생성, 수정, 삭제를 담당하는 서비스 클래스입니다.
 * 조회 기능은 {@link ReviewQueryService}에서 처리합니다.
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewValidator reviewValidator;
    private final ReviewRepository reviewRepository;
    private final ReviewBasicRepository reviewBasicRepository;
    private final ContentRepository contentRepository;
    private final UserService userService;
    private final UserActivityLogService userActivityLogService;

    /**
     * 리뷰 생성
     * <p>
     * 콘텐츠 존재 여부 확인 → 중복 리뷰 검증 → 타입별 제약 조건 검증 → 리뷰 저장 → 활동 로그 기록 순으로 처리
     *
     * @param username  현재 로그인한 사용자의 username
     * @param contentId 리뷰 대상 콘텐츠 ID
     * @param request   리뷰 생성 요청 DTO (평점, 리뷰 타입, 한줄평)
     * @return 생성된 리뷰 응답 DTO
     * @throws IllegalArgumentException 콘텐츠가 존재하지 않는 경우
     */
    @Transactional
    public ReviewCreateResponse createReview(String username, Long contentId, ReviewCreateRequest request) {
        // Content 존재 확인 (리뷰 작성 시점에 Content는 이미 DB에 존재함 방어적 코드)
        if (!contentRepository.existsById(contentId)) {
            throw new IllegalArgumentException("콘텐츠를 찾을 수 없습니다. contentId=" + contentId);
        }

        User user = userService.findUserEntity(username);

        reviewValidator.validateReviewNotExists(user.getId(), contentId);
        reviewValidator.validateReviewTypeConstraints(request.getReviewType(), request.getComment());

        Review savedReview = saveReview(user.getId(), contentId, request);
        handleReviewByType(savedReview.getId(), request.getReviewType(), request.getComment());
        logReviewCreated(user.getId(), savedReview.getId());

        return ReviewCreateResponse.from(savedReview, user, request.getComment());
    }

    /**
     * 리뷰 수정
     * <p>
     * 소유권 검증 및 타입별 제약 조건 검증 후 리뷰를 수정합니다.
     *
     * @param reviewId 수정할 리뷰 ID
     * @param username 현재 로그인한 사용자의 username
     * @param request  리뷰 수정 요청 DTO (평점, 리뷰 타입, 한줄평)
     * @return 수정된 리뷰 응답 DTO
     */
    @Transactional
    public ReviewResponse updateReview(Long reviewId, String username, ReviewUpdateRequest request) {
        User user = userService.findUserEntity(username);
        Review review = findReviewById(reviewId);

        reviewValidator.validateUpdateRequest(review, user.getId(), request.getReviewType(), request.getComment());

        Review savedReview = applyReviewUpdate(review, request);

        return ReviewResponse.from(savedReview, user, request.getComment());
    }

    /**
     * 리뷰 삭제
     * <p>
     * 소유권 검증 후 리뷰와 연관된 ReviewBasic 데이터를 함께 삭제하고, 활동 로그도 제거합니다.
     *
     * @param reviewId 삭제할 리뷰 ID
     * @param username 현재 로그인한 사용자의 username
     */
    @Transactional
    public void deleteReview(Long reviewId, String username) {
        Long currentUserId = userService.findUserIdByUsername(username);
        Review review = findReviewById(reviewId);

        reviewValidator.validateReviewOwnership(review, currentUserId);
        deleteReviewWithBasic(review);
        userActivityLogService.deleteActivity(currentUserId, ActionType.REVIEW, reviewId);
    }

    /** 리뷰 엔티티를 생성하여 저장합니다. */
    private Review saveReview(Long userId, Long contentId, ReviewCreateRequest request) {
        Review review = Review.builder()
                .userId(userId)
                .contentId(contentId)
                .rating(request.getRating())
                .reviewType(request.getReviewType())
                .build();

        return reviewRepository.save(review);
    }

    /** 리뷰 평점을 갱신하고, BASIC 타입인 경우 한줄평도 함께 수정합니다. (dirty checking으로 자동 반영) */
    private Review applyReviewUpdate(Review review, ReviewUpdateRequest request) {
        review.setRating(request.getRating());
        if (review.getReviewType() == ReviewType.BASIC) {
            updateBasicComment(review.getId(), request.getComment());
        }
        return review;
    }

    /** 리뷰 타입에 따라 추가 데이터를 생성합니다. (BASIC → ReviewBasic 저장) */
    private void handleReviewByType(Long reviewId, ReviewType reviewType, String comment) {
        switch (reviewType) {
            case BASIC -> createReviewBasic(reviewId, comment);
            case SHORT -> {
            } // SHORT는 추가 데이터 없음
            case DETAILED -> throw new IllegalStateException("DETAILED 리뷰는 아직 지원되지 않습니다.");
        }
    }

    /** BASIC 리뷰의 한줄평(ReviewBasic)을 저장합니다. */
    private void createReviewBasic(Long reviewId, String comment) {
        ReviewBasic reviewBasic = ReviewBasic.builder()
                .reviewId(reviewId)
                .comment(comment)
                .build();
        reviewBasicRepository.save(reviewBasic);
    }

    /** BASIC 리뷰의 한줄평을 수정합니다. */
    private void updateBasicComment(Long reviewId, String comment) {
        reviewBasicRepository.findByReviewId(reviewId)
                .ifPresent(basic -> basic.setComment(comment));
    }

    /** ReviewBasic이 존재하면 삭제합니다. */
    private void deleteReviewBasicIfExists(Long reviewId) {
        reviewBasicRepository.findByReviewId(reviewId)
                .ifPresent(reviewBasicRepository::delete);
    }

    /** 리뷰와 연관된 ReviewBasic을 함께 삭제합니다. */
    private void deleteReviewWithBasic(Review review) {
        if (review.getReviewType() == ReviewType.BASIC) {
            deleteReviewBasicIfExists(review.getId());
        }
        reviewRepository.delete(review);
    }

    /** 리뷰 생성 활동 로그를 기록합니다. */
    private void logReviewCreated(Long userId, Long reviewId) {
        userActivityLogService.log(userId, ActionType.REVIEW, reviewId, TargetType.REVIEW);
    }

    /** ID로 리뷰를 조회합니다. 존재하지 않으면 예외를 던집니다. */
    private Review findReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
    }

}


