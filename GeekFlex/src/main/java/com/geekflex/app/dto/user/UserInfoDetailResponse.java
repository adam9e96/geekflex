package com.geekflex.app.dto.user;

import com.geekflex.app.dto.collection.CollectionResponse;
import com.geekflex.app.review.dto.ReviewMyPageResponse;
import com.geekflex.app.review.dto.UserReviewStatsDto;
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
}

