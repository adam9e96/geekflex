package com.geekflex.app.review.service;

import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.entity.ContentType;
import com.geekflex.app.content.service.ContentService;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.review.dto.ReviewCreateRequest;
import com.geekflex.app.review.dto.ReviewCreateResponse;
import com.geekflex.app.review.dto.ReviewResponse;
import com.geekflex.app.review.dto.ReviewUpdateRequest;
import com.geekflex.app.review.dto.ReviewUserInfo;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewBasic;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.repository.ReviewBasicRepository;
import com.geekflex.app.review.repository.ReviewRepository;
import com.geekflex.app.user.entity.ActionType;
import com.geekflex.app.user.entity.User;
import com.geekflex.app.user.repository.UserRepository;
import com.geekflex.app.user.service.UserActivityLogService;
import com.geekflex.app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public ReviewCreateResponse createReview(String username, Long tmdbId, ReviewCreateRequest request) {
        Content content = contentService.getOrCreateContent(tmdbId, ContentType.MOVIE);
        User user = userService.findUserEntity(username);

        validateCreateReviewRequest(user, content, request);

        Review savedReview = saveReview(user.getId(), content.getId(), request);
        syncBasicReview(savedReview.getId(), request.getReviewType(), request.getComment());
        logReviewCreated(user.getId(), savedReview.getId());

        return buildCreateResponse(savedReview, user, request.getComment());
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, String username, ReviewUpdateRequest request) {
        Long currentUserId = userService.findUserIdByUsername(username);
        Review review = findReviewById(reviewId);

        validateUpdateReviewRequest(review, currentUserId, request);

        Review savedReview = applyReviewUpdate(review, request);
        syncBasicReview(savedReview.getId(), request.getReviewType(), request.getComment());

        User author = findAuthorById(savedReview.getUserId());
        String comment = loadBasicCommentIfNeeded(savedReview);

        return buildUpdateResponse(savedReview, author, comment);
    }

    @Transactional
    public void deleteReview(Long reviewId, String username) {
        Long currentUserId = userService.findUserIdByUsername(username);
        Review review = findReviewById(reviewId);

        reviewDomainService.validateReviewOwnership(review, currentUserId);
        reviewDomainService.deleteReviewWithBasic(review);
        userActivityLogService.deleteActivity(currentUserId, ActionType.REVIEW, reviewId);
    }

    private void validateCreateReviewRequest(User user, Content content, ReviewCreateRequest request) {
        reviewDomainService.validateReviewNotExists(user.getId(), content.getId());
        reviewDomainService.validateBasicReviewComment(request.getReviewType(), request.getComment());
    }
    private Review saveReview(Long userId, Long contentId, ReviewCreateRequest request) {
        Review review = Review.builder()
                .userId(userId)
                .contentId(contentId)
                .rating(request.getRating())
                .reviewType(request.getReviewType())
                .build();

        return reviewRepository.save(review);
    }

    private void validateUpdateReviewRequest(Review review, Long currentUserId, ReviewUpdateRequest request) {
        reviewDomainService.validateReviewOwnership(review, currentUserId);
        reviewDomainService.validateBasicReviewComment(request.getReviewType(), request.getComment());
    }

    private Review applyReviewUpdate(Review review, ReviewUpdateRequest request) {
        review.setRating(request.getRating());
        review.setReviewType(request.getReviewType());
        return reviewRepository.save(review);
    }

    private void syncBasicReview(Long reviewId, ReviewType reviewType, String comment) {
        if (reviewType == ReviewType.BASIC) {
            reviewDomainService.updateOrCreateReviewBasic(reviewId, comment);
            return;
        }
        reviewDomainService.deleteReviewBasicIfExists(reviewId);
    }

    private void logReviewCreated(Long userId, Long reviewId) {
        userActivityLogService.log(userId, ActionType.REVIEW, reviewId, TargetType.REVIEW);
    }

    private Review findReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
    }

    private User findAuthorById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("작성자 정보를 찾을 수 없습니다."));
    }

    private String loadBasicCommentIfNeeded(Review review) {
        if (review.getReviewType() != ReviewType.BASIC) {
            return null;
        }

        return reviewBasicRepository.findByReviewId(review.getId())
                .map(ReviewBasic::getComment)
                .orElse(null);
    }

    private ReviewUserInfo buildUserInfo(User user) {
        return ReviewUserInfo.builder()
                .publicId(user.getPublicId())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .build();
    }

    private ReviewCreateResponse buildCreateResponse(Review review, User user, String comment) {
        return ReviewCreateResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .reviewType(review.getReviewType())
                .createdAt(review.getCreatedAt())
                .user(buildUserInfo(user))
                .comment(comment)
                .build();
    }

    private ReviewResponse buildUpdateResponse(Review review, User author, String comment) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .reviewType(review.getReviewType())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .comment(comment)
                .user(buildUserInfo(author))
                .build();
    }
}


