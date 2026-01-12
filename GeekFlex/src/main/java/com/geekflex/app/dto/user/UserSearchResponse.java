package com.geekflex.app.dto.user;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;

@Data
public class UserSearchResponse {
    private String publicId;
    private String nickname;
    private String profileImage;
    private int activityScore;

    @QueryProjection
    public UserSearchResponse(String publicId, String nickname, String profileImage, int activityScore) {
        this.publicId = publicId;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.activityScore = activityScore;
    }
}
