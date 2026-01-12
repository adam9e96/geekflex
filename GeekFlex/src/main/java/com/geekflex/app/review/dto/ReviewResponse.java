package com.geekflex.app.review.dto;

import com.geekflex.app.review.entity.ReviewType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Double rating;
    private ReviewType reviewType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private ReviewUserInfo user;  // 닉네임, 사진 등 FE용
    private String comment; // BASIC 리뷰 한줄평 추가
}

