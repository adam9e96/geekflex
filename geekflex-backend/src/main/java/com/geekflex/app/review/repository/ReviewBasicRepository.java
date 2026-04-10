package com.geekflex.app.review.repository;
import com.geekflex.app.review.entity.ReviewBasic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewBasicRepository extends JpaRepository<ReviewBasic, Long> {
    Optional<ReviewBasic> findByReviewId(Long reviewId);
    List<ReviewBasic> findByReviewIdIn(List<Long> reviewIds);
}









