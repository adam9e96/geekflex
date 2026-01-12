package com.geekflex.app.review.dto;

import com.geekflex.app.review.entity.ReviewType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewCreateResponse {
    private Long id; // review
    private Double rating;
    private ReviewType reviewType;
    private LocalDateTime createdAt;
    private ReviewUserInfo user;  // 닉네임, 사진 등 FE용
    private String comment;
}

