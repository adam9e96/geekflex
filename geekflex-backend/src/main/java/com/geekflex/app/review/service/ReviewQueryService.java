package com.geekflex.app.review.service;

import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.repository.ContentRepository;
import com.geekflex.app.review.dto.ReviewCountResponse;
import com.geekflex.app.review.dto.ReviewMyPageResponse;
import com.geekflex.app.review.dto.ReviewResponse;
import com.geekflex.app.review.dto.ReviewUserInfo;
import com.geekflex.app.review.dto.UserReviewStatsDto;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewBasic;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.repository.ReviewBasicRepository;
import com.geekflex.app.review.repository.ReviewRepository;
import com.geekflex.app.user.entity.User;
import com.geekflex.app.user.repository.UserRepository;
import com.geekflex.app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
public class ReviewQueryService {

    private final ReviewRepository reviewRepository;
    private final ReviewBasicRepository reviewBasicRepository;
    private final UserRepository userRepository;
    private final ContentRepository contentRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByContentId(Long contentId) {
        return reviewRepository.findByContentId(contentId).stream()
                .map(this::toReviewResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewMyPageResponse> getMyReviews(String username) {
        User user = userService.findUserEntity(username);
        return mapToMyPageResponses(user.getId());
    }

    @Transactional(readOnly = true)
    public List<ReviewMyPageResponse> getUserReviewsByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return mapToMyPageResponses(user.getId());
    }

    @Transactional(readOnly = true)
    public UserReviewStatsDto getUserReviewStats(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Long totalReviews = reviewRepository.countByUserId(user.getId());
        Double averageRating = normalizeAverage(reviewRepository.findAverageRatingByUserId(user.getId()));

        return UserReviewStatsDto.builder()
                .totalReviews(totalReviews)
                .averageRating(averageRating)
                .build();
    }

    @Transactional(readOnly = true)
    public ReviewCountResponse getMyReviewCounts(String username) {
        User user = userService.findUserEntity(username);

        return ReviewCountResponse.builder()
                .reviewCount(reviewRepository.countByUserId(user.getId()))
                .build();
    }

    private ReviewResponse toReviewResponse(Review review) {
        User user = findUserById(review.getUserId());

        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .reviewType(review.getReviewType())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .user(buildReviewUserInfo(user))
                .comment(loadBasicComment(review))
                .build();
    }

    private List<ReviewMyPageResponse> mapToMyPageResponses(Long userId) {
        return reviewRepository.findByUserId(userId).stream()
                .map(this::toMyPageResponse)
                .toList();
    }

    private ReviewMyPageResponse toMyPageResponse(Review review) {
        Content content = findContentById(review.getContentId());
        String comment = loadBasicComment(review);
        return ReviewMyPageResponse.from(review, content, comment);
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private Content findContentById(Long contentId) {
        return contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("콘텐츠를 찾을 수 없습니다."));
    }

    private String loadBasicComment(Review review) {
        if (review.getReviewType() != ReviewType.BASIC) {
            return null;
        }
        return reviewBasicRepository.findByReviewId(review.getId())
                .map(ReviewBasic::getComment)
                .orElse(null);
    }

    private ReviewUserInfo buildReviewUserInfo(User user) {
        return ReviewUserInfo.builder()
                .publicId(user.getPublicId())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .build();
    }

    private Double normalizeAverage(Double average) {
        if (average == null) {
            return 0.0;
        }
        return Math.round(average * 10) / 10.0;
    }
}
