package com.geekflex.app.review.service;

import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.repository.ContentRepository;
import com.geekflex.app.review.dto.ReviewCountResponse;
import com.geekflex.app.review.dto.ReviewMyPageResponse;
import com.geekflex.app.review.dto.ReviewResponse;
import com.geekflex.app.review.dto.UserReviewStatsDto;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewBasic;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.repository.ReviewBasicRepository;
import com.geekflex.app.review.repository.ReviewRepository;
import com.geekflex.app.user.entity.User;
import com.geekflex.app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 리뷰 조회 서비스
 * <p>
 * 리뷰 데이터의 읽기 전용 조회를 담당하는 서비스 클래스입니다.
 * 콘텐츠별 리뷰 목록, 사용자별 리뷰 목록, 리뷰 통계 등을 제공합니다.
 * N+1 문제를 방지하기 위해 배치 로딩 방식으로 연관 데이터를 조회합니다.
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class ReviewQueryService {

    private final ReviewRepository reviewRepository;
    private final ReviewBasicRepository reviewBasicRepository;
    private final UserRepository userRepository;
    private final ContentRepository contentRepository;

    /**
     * 콘텐츠별 리뷰 목록 조회
     * <p>
     * 해당 콘텐츠에 작성된 모든 리뷰를 조회하며, 작성자 정보와 한줄평을 배치 로딩합니다.
     *
     * @param contentId 조회할 콘텐츠 ID
     * @return 리뷰 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByContentId(Long contentId) {
        List<Review> reviews = reviewRepository.findByContentId(contentId);
        if (reviews.isEmpty()) {
            return List.of();
        }

        // 배치 로딩: User, ReviewBasic을 한 번에 조회
        Map<Long, User> userMap = batchLoadUsers(reviews);
        Map<Long, String> commentMap = batchLoadBasicComments(reviews);

        return reviews.stream()
                .map(review -> ReviewResponse.from(
                        review,
                        userMap.get(review.getUserId()),
                        commentMap.get(review.getId())))
                .toList();
    }

    /**
     * 내 리뷰 목록 조회 (마이페이지)
     *
     * @param username 현재 로그인한 사용자의 username
     * @return 마이페이지용 리뷰 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<ReviewMyPageResponse> getMyReviews(String username) {
        User user = findUserByUsername(username);
        return mapToMyPageResponses(user.getId());
    }

    /**
     * 특정 사용자의 리뷰 목록 조회 (프로필 페이지)
     *
     * @param publicId 조회 대상 사용자의 공개 ID
     * @return 마이페이지용 리뷰 응답 DTO 목록
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public List<ReviewMyPageResponse> getUserReviewsByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return mapToMyPageResponses(user.getId());
    }

    /**
     * 사용자의 리뷰 통계 조회
     * <p>
     * 총 리뷰 수와 평균 평점을 계산하여 반환합니다.
     *
     * @param publicId 조회 대상 사용자의 공개 ID
     * @return 리뷰 통계 DTO (총 리뷰 수, 평균 평점)
     */
    @Transactional(readOnly = true)
    public UserReviewStatsDto getUserReviewStats(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Long totalReviews = reviewRepository.countByUserId(user.getId());
        Double averageRating = normalizeAverage(reviewRepository.findAverageRatingByUserId(user.getId()));

        return UserReviewStatsDto.of(totalReviews, averageRating);
    }

    /**
     * 내 리뷰 개수 조회
     *
     * @param username 현재 로그인한 사용자의 username
     * @return 리뷰 개수 응답 DTO
     */
    @Transactional(readOnly = true)
    public ReviewCountResponse getMyReviewCounts(String username) {
        User user = findUserByUsername(username);

        return ReviewCountResponse.of(reviewRepository.countByUserId(user.getId()));
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUserIdOrUserEmail(username, username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    /**
     * 사용자 ID로 리뷰 목록을 조회하고, 콘텐츠와 한줄평을 배치 로딩하여 마이페이지 응답으로 변환합니다.
     */
    private List<ReviewMyPageResponse> mapToMyPageResponses(Long userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        if (reviews.isEmpty()) {
            return List.of();
        }

        // 배치 로딩: Content, ReviewBasic을 한 번에 조회
        List<Long> contentIds = reviews.stream()
                .map(Review::getContentId)
                .distinct()
                .toList();
        // IN절로 한번에 처리
        // → [Content(id=1, title="인터스텔라"), Content(id=5, title="기생충"), Content(id=9, title="올드보이")]
        // Stream으로 변환
        Map<Long, Content> contentMap = contentRepository.findAllById(contentIds).stream()
                .collect(Collectors.toMap(Content::getId, Function.identity()));

        Map<Long, String> commentMap = batchLoadBasicComments(reviews);

        return reviews.stream()
                .map(review -> ReviewMyPageResponse.from(
                        review,
                        contentMap.get(review.getContentId()),
                        commentMap.get(review.getId())))
                .toList();
    }

    /**
     * 리뷰 목록에서 사용자 ID를 추출하여 한 번에 조회합니다. (N+1 방지)
     */
    private Map<Long, User> batchLoadUsers(List<Review> reviews) {
        List<Long> userIds = reviews.stream().map(Review::getUserId).distinct().toList();
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    // BASIC 타입 리뷰의 id를 모아 한 번에 조회
    private Map<Long, String> batchLoadBasicComments(List<Review> reviews) {
        List<Long> basicReviewIds = reviews.stream()
                .filter(r -> r.getReviewType() == ReviewType.BASIC)
                .map(Review::getId)
                .toList();

        if (basicReviewIds.isEmpty()) {
            return Map.of();
        }

        return reviewBasicRepository.findByReviewIdIn(basicReviewIds).stream()
                .collect(Collectors.toMap(ReviewBasic::getReviewId, ReviewBasic::getComment));
    }

    /**
     * 평균 평점을 소수점 첫째 자리로 반올림합니다. null인 경우 0.0을 반환합니다.
     */
    private Double normalizeAverage(Double average) {
        if (average == null) {
            return 0.0;
        }
        return Math.round(average * 10) / 10.0;
    }
}
