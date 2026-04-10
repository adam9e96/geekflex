package com.geekflex.app.user.dto;

import com.geekflex.app.review.dto.UserReviewStatsDto;
import com.geekflex.app.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String publicId; // 외부 공개용 ULID
    private String nickname; // 닉네임
    private String bio; // 자기소개
    private LocalDateTime joinedAt; // 가입일시
    private String profileImage;

    private UserReviewStatsDto userReviewStats;

    /** User 엔티티로부터 프로필 응답 DTO를 생성합니다. */
    public static UserProfileResponse from(User user) {
        return UserProfileResponse.builder()
                .publicId(user.getPublicId())
                .nickname(user.getNickname())
                .bio(user.getBio())
                .profileImage(user.getProfileImage())
                .joinedAt(user.getJoinedAt())
                .build();
    }
}








