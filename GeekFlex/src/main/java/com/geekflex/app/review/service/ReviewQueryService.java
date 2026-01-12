package com.geekflex.app.review.service;

import com.geekflex.app.entity.*;
import com.geekflex.app.repository.*;
import com.geekflex.app.review.dto.*;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewBasic;
import com.geekflex.app.review.repository.ReviewBasicRepository;
import com.geekflex.app.review.repository.ReviewRepository;
import com.geekflex.app.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Review 조회 전용 서비스
 * 
 * 리뷰 조회 관련 유스케이스를 담당합니다.
 * - 읽기 전용 트랜잭션
 * - DTO 변환
 * - 통계 정보 조회
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class ReviewQueryService {

    private final ReviewRepository reviewRepository;
    private final ReviewBasicRepository reviewBasicRepository;
    private final UserRepository userRepository;
    private final ContentRepository contentRepository;
    private final UserService userService;

    /**
     * 특정 콘텐츠의 모든 리뷰 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByContentId(Long contentId) {
        List<Review> reviews = reviewRepository.findByContentId(contentId);

        return reviews.stream()
                .map(review -> {
                    // 작성자 정보 조회
                    User user = userRepository.findById(review.getUserId())
                            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                    ReviewUserInfo userSummary = ReviewUserInfo.builder()
                            .publicId(user.getPublicId())
                            .nickname(user.getNickname())
                            .profileImage(user.getProfileImage())
                            .build();

                    // BASIC 리뷰인 경우 comment 조회
                    String comment = null;
                    if (review.getReviewType() == ReviewType.BASIC) {
                        comment = reviewBasicRepository.findByReviewId(review.getId())
                                .map(ReviewBasic::getComment)
                                .orElse(null);
                    }

                    return ReviewResponse.builder()
                            .id(review.getId())
                            .rating(review.getRating())
                            .reviewType(review.getReviewType())
                            .createdAt(review.getCreatedAt())
                            .updatedAt(review.getUpdatedAt())
                            .user(userSummary)
                            .comment(comment)
                            .build();
                })
                .toList();
    }

    /**
     * 본인의 리뷰 목록 반환
     */
    @Transactional(readOnly = true)
    public List<ReviewMyPageResponse> getMyReviews(String username) {
        User user = userService.findUserEntity(username);
        List<Review> reviews = reviewRepository.findByUserId(user.getId());

        return reviews.stream()
                .map(review -> {
                    // 콘텐츠 조회
                    Content content = contentRepository.findById(review.getContentId())
                            .orElseThrow(() -> new RuntimeException("콘텐츠를 찾을 수 없습니다."));

                    // BASIC 타입이면 comment 조회
                    String comment = reviewBasicRepository.findByReviewId(review.getId())
                            .map(ReviewBasic::getComment)
                            .orElse(null);

                    return ReviewMyPageResponse.from(review, content, comment);
                })
                .toList();
    }

    /**
     * publicId로 유저의 리뷰 목록 반환
     */
    @Transactional(readOnly = true)
    public List<ReviewMyPageResponse> getUserReviewsByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Review> reviews = reviewRepository.findByUserId(user.getId());

        return reviews.stream()
                .map(review -> {
                    // 콘텐츠 조회
                    Content content = contentRepository.findById(review.getContentId())
                            .orElseThrow(() -> new RuntimeException("콘텐츠를 찾을 수 없습니다."));

                    // BASIC 타입이면 comment 조회
                    String comment = reviewBasicRepository.findByReviewId(review.getId())
                            .map(ReviewBasic::getComment)
                            .orElse(null);

                    return ReviewMyPageResponse.from(review, content, comment);
                })
                .toList();
    }

    /**
     * 유저의 리뷰 통계 조회
     */
    @Transactional(readOnly = true)
    public UserReviewStatsDto getUserReviewStats(String publicId) {
        User findUser = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        Long reviewCount = reviewRepository.countByUserId(findUser.getId());
        Double reviewAvg = reviewRepository.findAverageRatingByUserId(findUser.getId());
        reviewAvg = reviewAvg == null ? 0.0 : Math.round(reviewAvg * 10) / 10.0;

        return UserReviewStatsDto.builder()
                .totalReviews(reviewCount)
                .averageRating(reviewAvg)
                .build();
    }

    /**
     * 본인의 리뷰 개수 조회
     */
    @Transactional(readOnly = true)
    public ReviewCountResponse getMyReviewCounts(String username) {
        User user = userService.findUserEntity(username);
        return ReviewCountResponse.builder()
                .reviewCount(reviewRepository.countByUserId(user.getId()))
                .build();
    }
}

