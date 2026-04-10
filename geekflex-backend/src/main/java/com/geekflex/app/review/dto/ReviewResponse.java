package com.geekflex.app.review.dto;

import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.user.entity.User;
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

    /** Review 엔티티와 작성자 정보로부터 응답 DTO를 구성합니다. */
    public static ReviewResponse from(Review review, User user, String comment) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .reviewType(review.getReviewType())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .user(ReviewUserInfo.from(user))
                .comment(comment)
                .build();
    }
}









