package com.geekflex.app.review.dto;

import com.geekflex.app.review.entity.ReviewType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewCreateRequest {
//    private Long tmdbId;        // TMDB 아이디로 넘어오면 → 자동 content 생성
    private Double rating;
    private ReviewType reviewType;
    private String comment; // BASIC일 때만 사용

    // 작성한 리뷰 내용은 상세 리뷰에서 별도 엔티티가 처리되므로 기본 Review에서는 제외
}

