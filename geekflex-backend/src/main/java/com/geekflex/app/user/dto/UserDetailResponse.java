package com.geekflex.app.user.dto;

import com.geekflex.app.user.entity.Role;
import com.geekflex.app.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserDetailResponse {
    String publicId;
    String userId;
    String nickname;
    Role role;
    int activityScore;
    String userEmail;
    String profileImage;
    String bio;
    LocalDateTime joinedAt;

    /** User 엔티티로부터 회원가입 응답 DTO를 생성합니다. */
    public static UserDetailResponse from(User user) {
        return UserDetailResponse.builder()
                .publicId(user.getPublicId())
                .userId(user.getUserId())
                .nickname(user.getNickname())
                .role(user.getRole())
                .activityScore(user.getActivityScore())
                .userEmail(user.getUserEmail())
                .profileImage(user.getProfileImage())
                .bio(user.getBio())
                .joinedAt(user.getJoinedAt())
                .build();
    }
}








