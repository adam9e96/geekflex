package com.geekflex.app.review.repository;
import com.geekflex.app.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByUserIdAndContentId(Long userId, Long contentId);

    List<Review> findByContentId(Long contentId);

    List<Review> findByUserId(Long userId);

    @Query("SELECT count(r) from Review r where r.userId = :userId")
    Long countByUserId(Long userId);

    @Query("SELECT AVG(r.rating) from Review r where r.userId = :userId")
    Double findAverageRatingByUserId(Long userId);

}









