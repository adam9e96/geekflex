package com.geekflex.app.review.service;

import com.geekflex.app.entity.*;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.repository.*;
import com.geekflex.app.review.dto.*;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewBasic;
import com.geekflex.app.review.repository.ReviewBasicRepository;
import com.geekflex.app.review.repository.ReviewRepository;
import com.geekflex.app.service.ContentService;
import com.geekflex.app.service.UserActivityLogService;
import com.geekflex.app.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Review 서비스
 * 
 * 리뷰 관련 유스케이스를 조율합니다.
 * - 트랜잭션 관리
 * - 도메인 서비스 호출
 * - 외부 서비스 연동 (Content, User 등)
 * - DTO 변환
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewDomainService reviewDomainService;
    private final ReviewRepository reviewRepository;
    private final ReviewBasicRepository reviewBasicRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ContentService contentService;
    private final UserActivityLogService userActivityLogService;

    /**
     * 리뷰 작성
     */
    @Transactional
    public ReviewCreateResponse createReview(String username, Long tmdbId, ReviewCreateRequest request) {
        // 1) 콘텐츠 조회 또는 생성
        Content content = contentService.getOrCreateContent(tmdbId, ContentType.MOVIE);
        
        // 2) 사용자 조회
        User user = userService.findUserEntity(username);
        
        // 3) 도메인 규칙 검증: 중복 리뷰 체크
        reviewDomainService.validateReviewNotExists(user.getId(), content.getId());
        
        // 4) 도메인 규칙 검증: BASIC 리뷰 한줄평 필수
        reviewDomainService.validateBasicReviewComment(request.getReviewType(), request.getComment());
        
        // 5) 리뷰 생성 및 저장
        Review review = Review.builder()
                .userId(user.getId())
                .contentId(content.getId())
                .rating(request.getRating())
                .reviewType(request.getReviewType())
                .build();
        
        Review saved = reviewRepository.save(review);
        
        // 6) BASIC 리뷰인 경우 ReviewBasic 생성
        if (request.getReviewType() == ReviewType.BASIC) {
            reviewDomainService.createReviewBasic(saved.getId(), request.getComment());
        }
        
        // 7) 사용자 활동 로그 기록
        userActivityLogService.log(
                user.getId(),
                ActionType.REVIEW,
                saved.getId(),
                TargetType.REVIEW
        );
        
        // 8) 응답 DTO 생성
        ReviewUserInfo userSummary = ReviewUserInfo.builder()
                .publicId(user.getPublicId())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .build();
        
        return ReviewCreateResponse.builder()
                .id(saved.getId())
                .rating(saved.getRating())
                .reviewType(saved.getReviewType())
                .createdAt(saved.getCreatedAt())
                .user(userSummary)
                .comment(request.getComment())
                .build();
    }

    /**
     * 리뷰 수정
     */
    @Transactional
    public ReviewResponse updateReview(Long reviewId, String username, ReviewUpdateRequest request) {
        // 1) 사용자 ID 조회
        Long currentUserId = userService.findUserIdByUsername(username);
        
        // 2) 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        
        // 3) 도메인 규칙 검증: 소유권 확인
        reviewDomainService.validateReviewOwnership(review, currentUserId);
        
        // 4) 도메인 규칙 검증: BASIC 리뷰 한줄평 필수
        reviewDomainService.validateBasicReviewComment(request.getReviewType(), request.getComment());
        
        // 5) 리뷰 정보 업데이트
        review.setRating(request.getRating());
        review.setReviewType(request.getReviewType());
        Review saved = reviewRepository.save(review);
        
        // 6) ReviewBasic 처리
        if (request.getReviewType() == ReviewType.BASIC) {
            reviewDomainService.updateOrCreateReviewBasic(reviewId, request.getComment());
        } else if (request.getReviewType() == ReviewType.SHORT) {
            reviewDomainService.deleteReviewBasicIfExists(reviewId);
        }
        
        // 7) 작성자 정보 조회
        User user = userRepository.findById(saved.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("작성자 정보를 찾을 수 없습니다."));
        
        ReviewUserInfo userInfo = ReviewUserInfo.builder()
                .publicId(user.getPublicId())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .build();
        
        // 8) BASIC 리뷰인 경우 comment 조회
        String comment = null;
        if (saved.getReviewType() == ReviewType.BASIC) {
            comment = reviewBasicRepository.findByReviewId(reviewId)
                    .map(ReviewBasic::getComment)
                    .orElse(null);
        }
        
        // 9) 응답 DTO 생성
        return ReviewResponse.builder()
                .id(saved.getId())
                .rating(saved.getRating())
                .reviewType(saved.getReviewType())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .comment(comment)
                .user(userInfo)
                .build();
    }

    /**
     * 리뷰 삭제
     */
    @Transactional
    public void deleteReview(Long reviewId, String username) {
        // 1) 사용자 ID 조회
        Long currentUserId = userService.findUserIdByUsername(username);
        
        // 2) 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        
        // 3) 도메인 규칙 검증: 소유권 확인
        reviewDomainService.validateReviewOwnership(review, currentUserId);
        
        // 4) 리뷰 삭제 (ReviewBasic도 함께 삭제)
        reviewDomainService.deleteReviewWithBasic(review);
        
        // 5) 활동 기록 삭제
        userActivityLogService.deleteActivity(currentUserId, ActionType.REVIEW, reviewId);
    }
}

