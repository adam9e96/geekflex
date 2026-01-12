//package com.geekflex.app.service;
//
//import com.geekflex.app.dto.notification.NotificationListResponse;
//import com.geekflex.app.dto.notification.NotificationResponse;
//import com.geekflex.app.entity.*;
//import com.geekflex.app.repository.NotificationRepository;
//import com.geekflex.app.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Log4j2
//@Service
//@RequiredArgsConstructor
//public class NotificationService {
//
//    private final NotificationRepository notificationRepository;
//    private final UserRepository userRepository;
//    private final UserService userService;
//
//    /**
//     * 알림 생성
//     */
//    @Transactional
//    public void createNotification(
//            Long userId, // 알림을 받을 유저 (구독자)
//            Long actorId, // 알림을 발생시킨 유저 (피구독자)
//            NotificationType notificationType,
//            Long targetId,
//            TargetType targetType,
//            String title,
//            String message
//    ) {
//        Notification notification = Notification.builder()
//                .userId(userId)
//                .actorId(actorId)
//                .notificationType(notificationType)
//                .targetId(targetId)
//                .targetType(targetType)
//                .title(title)
//                .message(message)
//                .isRead(false)
//                .build();
//
//        notificationRepository.save(notification);
//    }
//
//    /**
//     * 여러 유저에게 알림 일괄 생성 (구독자들에게 알림 발송)
//     */
//    @Transactional
//    public void createNotificationsForSubscribers(
//            List<Long> subscriberIds, // 구독자 ID 목록
//            Long actorId, // 알림을 발생시킨 유저
//            NotificationType notificationType,
//            Long targetId,
//            TargetType targetType,
//            String title,
//            String message
//    ) {
//        // 자기 자신에게는 알림을 보내지 않음
//        List<Long> filteredIds = subscriberIds.stream()
//                .filter(id -> !id.equals(actorId))
//                .collect(Collectors.toList());
//
//        for (Long userId : filteredIds) {
//            createNotification(userId, actorId, notificationType, targetId, targetType, title, message);
//        }
//    }
//
//    /**
//     * 알림 목록 조회 (페이징)
//     */
//    @Transactional(readOnly = true)
//    public NotificationListResponse getNotifications(String username, int page, int size) {
//        User user = userService.findUserEntity(username);
//
//        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
//        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(
//                user.getId(), pageable);
//
//        List<NotificationResponse> notifications = notificationPage.getContent().stream()
//                .map(this::convertToResponse)
//                .collect(Collectors.toList());
//
//        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
//
//        return NotificationListResponse.builder()
//                .notifications(notifications)
//                .unreadCount(unreadCount)
//                .totalPages(notificationPage.getTotalPages())
//                .totalElements(notificationPage.getTotalElements())
//                .build();
//    }
//
//    /**
//     * 읽지 않은 알림 목록 조회
//     */
//    @Transactional(readOnly = true)
//    public List<NotificationResponse> getUnreadNotifications(String username) {
//        User user = userService.findUserEntity(username);
//        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
//                user.getId());
//
//        return notifications.stream()
//                .map(this::convertToResponse)
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * 읽지 않은 알림 개수 조회
//     */
//    @Transactional(readOnly = true)
//    public long getUnreadCount(String username) {
//        User user = userService.findUserEntity(username);
//        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
//    }
//
//    /**
//     * 알림 읽음 처리
//     */
//    @Transactional
//    public void markAsRead(String username, Long notificationId) {
//        User user = userService.findUserEntity(username);
//
//        Notification notification = notificationRepository.findById(notificationId)
//                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다."));
//
//        // 본인 알림인지 확인
//        if (!notification.getUserId().equals(user.getId())) {
//            throw new IllegalArgumentException("본인의 알림만 읽음 처리할 수 있습니다.");
//        }
//
//        notificationRepository.markAsRead(notificationId, LocalDateTime.now());
//    }
//
//    /**
//     * 모든 알림 읽음 처리
//     */
//    @Transactional
//    public void markAllAsRead(String username) {
//        User user = userService.findUserEntity(username);
//        notificationRepository.markAllAsRead(user.getId(), LocalDateTime.now());
//    }
//
//    /**
//     * Notification 엔티티를 NotificationResponse DTO로 변환
//     */
//    private NotificationResponse convertToResponse(Notification notification) {
//        User actor = userRepository.findById(notification.getActorId())
//                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
//
//        return NotificationResponse.builder()
//                .id(notification.getId())
//                .actorPublicId(actor.getPublicId())
//                .actorNickname(actor.getNickname())
//                .actorProfileImage(actor.getProfileImage())
//                .notificationType(notification.getNotificationType())
//                .targetId(notification.getTargetId())
//                .targetType(notification.getTargetType())
//                .title(notification.getTitle())
//                .message(notification.getMessage())
//                .isRead(notification.getIsRead())
//                .readAt(notification.getReadAt())
//                .createdAt(notification.getCreatedAt())
//                .build();
//    }
//}
//
