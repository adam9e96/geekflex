package com.geekflex.app.review.repository;

import com.geekflex.app.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByUserIdAndContentId(Long userId, Long contentId);

    // select * from contents where id = 46;
    List<Review> findByContentId(Long contentId);

//    List<Review> findByUserId(Long userId);

    // 유저의 리뷰 개수 (COUNT)
    @Query("SELECT count(r) from Review r where r.userId = :userId")
    Long countByUserId(Long userId);

    // 유저의 평균 평점 (AVG)
    @Query("SELECT AVG(r.rating) from  Review r where r.userId = :userId")
    Double findAverageRatingByUserId(Long userId);

//    Page<Review> findByUser(User user, Pageable pageable);
//    List<Review> findByUser(User user);
    List<Review> findByUserId(Long userId);


}

