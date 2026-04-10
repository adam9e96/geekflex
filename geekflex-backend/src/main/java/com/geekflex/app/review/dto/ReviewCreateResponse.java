package com.geekflex.app.review.dto;

import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.user.entity.User;
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

    /**
     * Review 엔티티와 작성자 정보로부터 생성 응답 DTO를 구성합니다.
     */
    public static ReviewCreateResponse from(Review review, User user, String comment) {
        return ReviewCreateResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .reviewType(review.getReviewType())
                .createdAt(review.getCreatedAt())
                .user(ReviewUserInfo.from(user))
                .comment(comment)
                .build();
    }
}









