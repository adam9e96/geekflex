//package com.geekflex.app.repository;
//
//import com.geekflex.app.entity.Notification;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//public interface NotificationRepository extends JpaRepository<Notification, Long> {
//
//    // 특정 유저의 알림 목록 조회 (최신순)
//    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
//
//    // 특정 유저의 읽지 않은 알림 목록
//    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
//
//    // 특정 유저의 읽지 않은 알림 개수
//    long countByUserIdAndIsReadFalse(Long userId);
//
//    // 알림 읽음 처리
//    @Modifying
//    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
//    void markAsRead(@Param("id") Long id, @Param("readAt") LocalDateTime readAt);
//
//    // 모든 알림 읽음 처리
//    @Modifying
//    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.userId = :userId AND n.isRead = false")
//    void markAllAsRead(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
//
//    // 특정 유저의 알림 삭제
//    void deleteByUserId(Long userId);
//}
//
