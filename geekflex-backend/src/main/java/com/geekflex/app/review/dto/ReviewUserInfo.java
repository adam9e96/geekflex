package com.geekflex.app.review.dto;

import com.geekflex.app.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ReviewUserInfo {
    private String publicId;        // ULID
    private String nickname;
    private String profileImage;

    /** User 엔티티로부터 리뷰 응답용 사용자 정보를 생성합니다. */
    public static ReviewUserInfo from(User user) {
        if (user == null) {
            return null;
        }
        return ReviewUserInfo.builder()
                .publicId(user.getPublicId())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .build();
    }
}









