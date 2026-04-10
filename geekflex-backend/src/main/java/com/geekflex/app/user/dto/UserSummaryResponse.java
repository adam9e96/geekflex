package com.geekflex.app.user.dto;

import com.geekflex.app.user.entity.User;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    private String nickname;
    private String profileImage;
    private String userId;

    /** User 엔티티로부터 요약 정보 DTO를 생성합니다. */
    public static UserSummaryResponse from(User user) {
        return UserSummaryResponse.builder()
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .userId(user.getUserId())
                .build();
    }
}








