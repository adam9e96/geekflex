package com.geekflex.app.review.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewCountResponse {
    private Long reviewCount;

    public static ReviewCountResponse of(Long reviewCount) {
        return ReviewCountResponse.builder().reviewCount(reviewCount).build();
    }
}