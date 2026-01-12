package com.geekflex.app.review.dto;

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
}

