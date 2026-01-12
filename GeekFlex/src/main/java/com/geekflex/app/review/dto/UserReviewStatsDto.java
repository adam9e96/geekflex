package com.geekflex.app.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


// 공개 프로필에 사용할 정보 DTO
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserReviewStatsDto {
    private Long totalReviews; // 리뷰 개수
    private Double averageRating; // 평균 리뷰 평점
}

