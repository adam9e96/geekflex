package com.geekflex.app.user.dto;

import com.geekflex.app.collection.dto.CollectionResponse;
import com.geekflex.app.review.dto.ReviewMyPageResponse;
import com.geekflex.app.review.dto.UserReviewStatsDto;
import com.geekflex.app.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDetailResponse {
    // 간단한 유저 프로필 정보
    private String publicId;
    private String nickname;
    private String bio;
    private LocalDateTime joinedAt;
    private String profileImage;
    private int activityScore;

    // 리뷰 통계 정보
    private UserReviewStatsDto reviewStats;

    // 리뷰 목록
    private List<ReviewMyPageResponse> reviews;

    // 컬렉션 목록
    private List<CollectionResponse> collections;

    /** User 엔티티와 연관 데이터로부터 사용자 상세 정보 DTO를 생성합니다. */
    public static UserInfoDetailResponse from(User user, UserReviewStatsDto reviewStats,
                                               List<ReviewMyPageResponse> reviews,
                                               List<CollectionResponse> collections) {
        return UserInfoDetailResponse.builder()
                .publicId(user.getPublicId())
                .nickname(user.getNickname())
                .bio(user.getBio())
                .joinedAt(user.getJoinedAt())
                .profileImage(user.getProfileImage())
                .activityScore(user.getActivityScore())
                .reviewStats(reviewStats)
                .reviews(reviews)
                .collections(collections)
                .build();
    }
}









