package com.geekflex.app.review.dto;

import com.geekflex.app.review.entity.ReviewType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewCreateRequest {

    @NotNull(message = "평점은 필수입니다.")
    @DecimalMin(value = "0.5", message = "평점은 0.5 이상이어야 합니다.")
    @DecimalMax(value = "5.0", message = "평점은 5.0 이하여야 합니다.")
    private Double rating;

    @NotNull(message = "리뷰 타입은 필수입니다.")
    private ReviewType reviewType;

    private String comment; // BASIC일 때만 사용, SHORT일 때는 null
}









