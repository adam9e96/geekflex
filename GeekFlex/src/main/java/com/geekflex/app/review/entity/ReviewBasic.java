package com.geekflex.app.review.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "review_basic")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewBasic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "review_id", nullable = false)
    private Long reviewId; // 리뷰 FK

    @Column(nullable = false, length = 200)
    private String comment;
}

