//package com.geekflex.app.service;
//
//import com.geekflex.app.dto.subscription.*;
//import com.geekflex.app.entity.Subscription;
//import com.geekflex.app.entity.User;
//import com.geekflex.app.repository.SubscriptionRepository;
//import com.geekflex.app.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Log4j2
//@Service
//@RequiredArgsConstructor
//public class SubscriptionService {
//
//    private final SubscriptionRepository subscriptionRepository;
//    private final UserRepository userRepository;
//    private final UserService userService;
//
//    /**
//     * 구독하기
//     */
//    @Transactional
//    public SubscriptionResponse subscribe(String username, String followingPublicId) {
//        // 현재 로그인한 유저 조회
//        User follower = userService.findUserEntity(username);
//
//        // 구독할 유저 조회
//        User following = userRepository.findByPublicId(followingPublicId)
//                .orElseThrow(() -> new IllegalArgumentException("구독할 유저를 찾을 수 없습니다."));
//
//        // 자기 자신 구독 방지
//        if (follower.getId().equals(following.getId())) {
//            throw new IllegalArgumentException("자기 자신을 구독할 수 없습니다.");
//        }
//
//        // 이미 구독 중인지 확인
//        if (subscriptionRepository.existsByFollowerIdAndFollowingId(follower.getId(), following.getId())) {
//            throw new IllegalArgumentException("이미 구독 중인 유저입니다.");
//        }
//
//        // 구독 관계 생성
//        Subscription subscription = Subscription.builder()
//                .followerId(follower.getId())
//                .followingId(following.getId())
//                .build();
//
//        Subscription saved = subscriptionRepository.save(subscription);
//
//        return SubscriptionResponse.builder()
//                .id(saved.getId())
//                .followerPublicId(follower.getPublicId())
//                .followingPublicId(following.getPublicId())
//                .createdAt(saved.getCreatedAt())
//                .isSubscribed(true)
//                .build();
//    }
//
//    /**
//     * 구독 취소
//     */
//    @Transactional
//    public void unsubscribe(String username, String followingPublicId) {
//        // 현재 로그인한 유저 조회
//        User follower = userService.findUserEntity(username);
//
//        // 구독 취소할 유저 조회
//        User following = userRepository.findByPublicId(followingPublicId)
//                .orElseThrow(() -> new IllegalArgumentException("구독 취소할 유저를 찾을 수 없습니다."));
//
//        // 구독 관계 조회 및 삭제
//        Subscription subscription = subscriptionRepository
//                .findByFollowerIdAndFollowingId(follower.getId(), following.getId())
//                .orElseThrow(() -> new IllegalArgumentException("구독 관계가 존재하지 않습니다."));
//
//        subscriptionRepository.delete(subscription);
//    }
//
//    /**
//     * 구독 상태 조회
//     */
//    @Transactional(readOnly = true)
//    public SubscriptionStatusResponse getSubscriptionStatus(String username, String targetPublicId) {
//        // 현재 로그인한 유저 조회
//        User currentUser = userService.findUserEntity(username);
//
//        // 대상 유저 조회
//        User targetUser = userRepository.findByPublicId(targetPublicId)
//                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
//
//        // 구독 여부 확인
//        boolean isSubscribed = subscriptionRepository.existsByFollowerIdAndFollowingId(
//                currentUser.getId(), targetUser.getId());
//
//        // 구독자 수, 구독 중인 수 조회
//        long followerCount = subscriptionRepository.countByFollowingId(targetUser.getId());
//        long followingCount = subscriptionRepository.countByFollowerId(targetUser.getId());
//
//        return SubscriptionStatusResponse.builder()
//                .isSubscribed(isSubscribed)
//                .followerCount(followerCount)
//                .followingCount(followingCount)
//                .build();
//    }
//
//    /**
//     * 구독 목록 조회 (내가 구독하는 사람들 + 나를 구독하는 사람들)
//     */
//    @Transactional(readOnly = true)
//    public SubscriptionListResponse getSubscriptionList(String username) {
//        // 현재 로그인한 유저 조회
//        User currentUser = userService.findUserEntity(username);
//
//        // 내가 구독하는 사람들 (following 목록)
//        List<Subscription> followings = subscriptionRepository.findByFollowerId(currentUser.getId());
//        List<UserSubscriptionInfo> followingList = followings.stream()
//                .map(sub -> {
//                    User user = userRepository.findById(sub.getFollowingId())
//                            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
//                    return UserSubscriptionInfo.builder()
//                            .publicId(user.getPublicId())
//                            .nickname(user.getNickname())
//                            .profileImage(user.getProfileImage())
//                            .subscribedAt(sub.getCreatedAt())
//                            .build();
//                })
//                .collect(Collectors.toList());
//
//        // 나를 구독하는 사람들 (follower 목록)
//        List<Subscription> followers = subscriptionRepository.findByFollowingId(currentUser.getId());
//        List<UserSubscriptionInfo> followerList = followers.stream()
//                .map(sub -> {
//                    User user = userRepository.findById(sub.getFollowerId())
//                            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
//                    return UserSubscriptionInfo.builder()
//                            .publicId(user.getPublicId())
//                            .nickname(user.getNickname())
//                            .profileImage(user.getProfileImage())
//                            .subscribedAt(sub.getCreatedAt())
//                            .build();
//                })
//                .collect(Collectors.toList());
//
//        return SubscriptionListResponse.builder()
//                .followers(followerList)
//                .followings(followingList)
//                .followerCount(followerList.size())
//                .followingCount(followingList.size())
//                .build();
//    }
//
//    /**
//     * 특정 유저를 구독하는 모든 구독자 ID 목록 조회 (알림 발송용)
//     */
//    @Transactional(readOnly = true)
//    public List<Long> getFollowerIds(Long userId) {
//        return subscriptionRepository.findFollowerIdsByFollowingId(userId);
//    }
//}
//
