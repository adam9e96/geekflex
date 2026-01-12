package com.geekflex.app.like.service;

import com.geekflex.app.entity.Content;
import com.geekflex.app.like.dto.LikeCountResponse;
import com.geekflex.app.like.dto.LikeStatusResponse;
import com.geekflex.app.like.dto.LikeToggleResponse;
import com.geekflex.app.like.entity.Like;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.like.repository.LikeRepository;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.repository.ReviewRepository;
import com.geekflex.app.repository.ContentRepository;
import com.geekflex.app.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Log4j2
@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserService userService;
    private final ContentRepository contentRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 좋아요 토글 기능
     * 이미 좋아요면 삭제, 없으면 추가
     *
     * @param username   로그인한 사용자 username
     * @param targetType 좋아요 타입 (REVIEW, COMMENT 등)
     * @param targetId   타겟 ID (CONTENT 타입인 경우 tmdbId, 그 외는 PK)
     */
    @Transactional
    public LikeToggleResponse toggleLike(String username, TargetType targetType, Long targetId) {
        // 입력값 검증
        if (targetId == null || targetId <= 0) {
            log.warn("잘못된 targetId: {}", targetId);
            throw new IllegalArgumentException("유효하지 않은 타겟 ID입니다.");
        }
        if (targetType == null) {
            log.warn("잘못된 targetType: null");
            throw new IllegalArgumentException("유효하지 않은 타겟 타입입니다.");
        }

        // 타입별 ID 변환 및 존재 여부 검증
        Long actualTargetId = targetId;
        if (TargetType.CONTENT.equals(targetType)) {
            // CONTENT 타입: tmdbId를 content.id(PK)로 변환
            Content content = contentRepository.findByTmdbId(targetId)
                    .orElseThrow(() -> {
                        log.warn("Content를 찾을 수 없습니다: tmdbId={}", targetId);
                        return new IllegalArgumentException("해당 콘텐츠를 찾을 수 없습니다.");
                    });
            actualTargetId = content.getId();
            log.debug("CONTENT 타입: tmdbId={} -> content.id={}", targetId, actualTargetId);
        } else if (TargetType.REVIEW.equals(targetType)) {
            // REVIEW 타입: Review 존재 여부 검증
            Review review = reviewRepository.findById(targetId)
                    .orElseThrow(() -> {
                        log.warn("Review를 찾을 수 없습니다: reviewId={}", targetId);
                        return new IllegalArgumentException("해당 리뷰를 찾을 수 없습니다.");
                    });
            actualTargetId = review.getId(); // PK 그대로 사용
            log.debug("REVIEW 타입: reviewId={} 검증 완료", targetId);
        }

        // 1) 로그인한 유저 PK 조회
        Long userId = userService.findUserIdByUsername(username);

        // 2) 이미 좋아요 눌렀는지 확인 (실제 PK로 확인)
        boolean exists = likeRepository.existsByUserIdAndTargetTypeAndTargetId(
                userId, targetType, actualTargetId
        );

        if (exists) {
            // 3) 좋아요 취소
            likeRepository.deleteByUserIdAndTargetTypeAndTargetId(
                    userId, targetType, actualTargetId
            );

            log.info("좋아요 취소됨(삭제): userId={}, type={}, id={}", userId, targetType, actualTargetId);

            return LikeToggleResponse.builder()
                    .liked(false)
                    .targetId(targetId) // 원본 ID 반환 (tmdbId 또는 PK)
                    .targetType(targetType)
                    .build();
        }

        // 4) 좋아요 추가
        try {
            Like like = Like.builder()
                    .userId(userId)
                    .targetType(targetType)
                    .targetId(actualTargetId) // 실제 PK 저장
                    .build();

            likeRepository.save(like);

            log.info("좋아요 추가됨: userId={}, type={}, id={}", userId, targetType, actualTargetId);

            return LikeToggleResponse.builder()
                    .liked(true)
                    .targetId(targetId) // 원본 ID 반환 (tmdbId 또는 PK)
                    .targetType(targetType)
                    .build();

        } catch (DataIntegrityViolationException e) {
            // 동시성 문제 방어: 이미 다른 스레드가 추가했으면 중복 에러 발생
            log.warn("중복 좋아요 방지 triggered: userId={}, type={}, id={}", userId, targetType, actualTargetId);

            return LikeToggleResponse.builder()
                    .liked(true)
                    .targetId(targetId) // 원본 ID 반환 (tmdbId 또는 PK)
                    .targetType(targetType)
                    .build();
        } catch (Exception e) {
            log.error("좋아요 처리 중 예상치 못한 오류 발생: userId={}, type={}, id={}", userId, targetType, actualTargetId, e);
            throw new RuntimeException("좋아요 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 좋아요 상태 조회 API
     * 로그인 여부에 따라 본인의 liked(true/false) 상태만 반환
     *
     * @param username   로그인한 사용자 username
     * @param targetType 좋아요 타입 (REVIEW, COMMENT 등)
     * @param targetId   타겟 ID (CONTENT 타입인 경우 tmdbId, 그 외는 PK)
     */
    @Transactional(readOnly = true)
    public LikeStatusResponse getLikeStatus(String username, TargetType targetType, Long targetId) {

        // 타입별 ID 변환 및 존재 여부 검증
        Long actualTargetId = targetId;
        if (TargetType.CONTENT.equals(targetType)) {
            // CONTENT 타입: tmdbId를 content.id(PK)로 변환
            Content content = contentRepository.findByTmdbId(targetId)
                    .orElseThrow(() -> {
                        log.warn("Content를 찾을 수 없습니다: tmdbId={}", targetId);
                        return new IllegalArgumentException("해당 콘텐츠를 찾을 수 없습니다.");
                    });
            actualTargetId = content.getId();
        } else if (TargetType.REVIEW.equals(targetType)) {
            // REVIEW 타입: Review 존재 여부 검증
            Review review = reviewRepository.findById(targetId)
                    .orElseThrow(() -> {
                        log.warn("Review를 찾을 수 없습니다: reviewId={}", targetId);
                        return new IllegalArgumentException("해당 리뷰를 찾을 수 없습니다.");
                    });
            actualTargetId = review.getId(); // PK 그대로 사용
        }

        boolean liked = false;

        if (username != null) {
            Long userId = userService.findUserIdByUsername(username);
            liked = likeRepository.existsByUserIdAndTargetTypeAndTargetId(userId, targetType, actualTargetId);
        }

        return LikeStatusResponse.builder()
                .liked(liked)
                .build();
    }

    /**
     * 특정 타겟의 좋아요 개수 누적 조회
     *
     * @param targetType 좋아요 타입 (REVIEW, COMMENT 등)
     * @param targetId   타겟 ID (CONTENT 타입인 경우 tmdbId, 그 외는 PK)
     */
    @Transactional(readOnly = true)
    public LikeCountResponse countLikes(TargetType targetType, Long targetId) {
        // 타입별 ID 변환 및 존재 여부 검증
        Long actualTargetId = targetId;
        if (TargetType.CONTENT.equals(targetType)) {
            // CONTENT 타입: tmdbId를 content.id(PK)로 변환
            Content content = contentRepository.findByTmdbId(targetId)
                    .orElseThrow(() -> {
                        log.warn("Content를 찾을 수 없습니다: tmdbId={}", targetId);
                        return new IllegalArgumentException("해당 콘텐츠를 찾을 수 없습니다.");
                    });
            actualTargetId = content.getId();
            log.debug("CONTENT 타입: tmdbId={} -> content.id={}", targetId, actualTargetId);
        } else if (TargetType.REVIEW.equals(targetType)) {
            // REVIEW 타입: Review 존재 여부 검증
            Review review = reviewRepository.findById(targetId)
                    .orElseThrow(() -> {
                        log.warn("Review를 찾을 수 없습니다: reviewId={}", targetId);
                        return new IllegalArgumentException("해당 리뷰를 찾을 수 없습니다.");
                    });
            actualTargetId = review.getId(); // PK 그대로 사용
            log.debug("REVIEW 타입: reviewId={} 검증 완료", targetId);
        }

        long count = likeRepository.countByTargetTypeAndTargetId(targetType, actualTargetId);
        return LikeCountResponse.builder().count(count).build();
    }

}

