package com.geekflex.app.review.dto;

import com.geekflex.app.entity.Content;
import com.geekflex.app.review.entity.Review;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewMyPageResponse {

    private Long reviewId;
    private Long contentId;

    private String reviewType;
    private Double rating;

    private String comment; // BASIC 리뷰라면 존재

    // Content 정보
    private Long tmdbId;
    private String title;
    private String posterUrl;
    private String genre;
    private String originalLanguage;

    public static ReviewMyPageResponse from(Review review, Content content, String comment) {

        return ReviewMyPageResponse.builder()
                .reviewId(review.getId())
                .contentId(content.getId())

                .reviewType(review.getReviewType().name())
                .rating(review.getRating())

                .comment(comment)

                .tmdbId(content.getTmdbId())
                .title(content.getTitle())
                .posterUrl(content.getPosterUrl())
                .genre(content.getGenre())
                .originalLanguage(content.getOriginalLanguage())

                .build();
    }
}

