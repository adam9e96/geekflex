package com.geekflex.app.review.dto;

import com.geekflex.app.review.entity.ReviewType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewUpdateRequest {
    private Double rating;
    private ReviewType reviewType;
    private String comment; // BASIC 인경우 한줄평
}

