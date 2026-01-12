//package com.geekflex.app.repository;
//
//import com.geekflex.app.entity.Subscription;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//
//import java.util.List;
//import java.util.Optional;
//
//public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
//
//    // 특정 유저가 특정 유저를 구독하고 있는지 확인
//    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
//
//    // 구독 관계 조회
//    Optional<Subscription> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
//
//    // 내가 구독하는 사람들 (following 목록)
//    List<Subscription> findByFollowerId(Long followerId);
//
//    // 나를 구독하는 사람들 (follower 목록)
//    List<Subscription> findByFollowingId(Long followingId);
//
//    // 구독자 수 (나를 구독하는 사람 수)
//    long countByFollowingId(Long followingId);
//
//    // 구독 중인 수 (내가 구독하는 사람 수)
//    long countByFollowerId(Long followerId);
//
//    // 특정 유저를 구독하는 모든 구독자 ID 목록 조회
//    @Query("SELECT s.followerId FROM Subscription s WHERE s.followingId = :followingId")
//    List<Long> findFollowerIdsByFollowingId(@Param("followingId") Long followingId);
//}
//
