package com.geekflex.app.like.service;

import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.repository.ContentRepository;
import com.geekflex.app.like.dto.LikeCountResponse;
import com.geekflex.app.like.dto.LikeStatusResponse;
import com.geekflex.app.like.dto.LikeToggleResponse;
import com.geekflex.app.like.entity.Like;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.like.repository.LikeRepository;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.repository.ReviewRepository;
import com.geekflex.app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserService userService;
    private final ContentRepository contentRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public LikeToggleResponse toggleLike(String username, TargetType targetType, Long targetId) {
        validateTargetArguments(targetType, targetId);

        Long actualTargetId = resolveTargetId(targetType, targetId);
        Long userId = userService.findUserIdByUsername(username);

        if (isAlreadyLiked(userId, targetType, actualTargetId)) {
            removeLike(userId, targetType, actualTargetId);
            return buildToggleResponse(false, targetType, targetId);
        }

        return saveLikeWithConcurrencyGuard(userId, targetType, targetId, actualTargetId);
    }

    @Transactional(readOnly = true)
    public LikeStatusResponse getLikeStatus(String username, TargetType targetType, Long targetId) {
        validateTargetArguments(targetType, targetId);

        Long actualTargetId = resolveTargetId(targetType, targetId);
        boolean liked = isLikedByUser(username, targetType, actualTargetId);

        return LikeStatusResponse.builder()
                .liked(liked)
                .build();
    }

    @Transactional(readOnly = true)
    public LikeCountResponse countLikes(TargetType targetType, Long targetId) {
        validateTargetArguments(targetType, targetId);

        Long actualTargetId = resolveTargetId(targetType, targetId);
        long count = likeRepository.countByTargetTypeAndTargetId(targetType, actualTargetId);

        return LikeCountResponse.builder()
                .count(count)
                .build();
    }

    @Transactional(readOnly = true)
    public List<Long> getLikeStatuses(String username, TargetType targetType, List<Long> targetIds) {
        if (username == null || targetIds == null || targetIds.isEmpty()) {
            return Collections.emptyList();
        }

        Long userId = userService.findUserIdByUsername(username);
        List<Long> actualTargetIds = resolveBatchTargetIds(targetType, targetIds);
        List<Like> likes = likeRepository.findByUserIdAndTargetTypeAndTargetIdIn(userId, targetType, actualTargetIds);

        return likes.stream()
                .map(Like::getTargetId)
                .toList();
    }

    private void validateTargetArguments(TargetType targetType, Long targetId) {
        if (targetType == null) {
            throw new IllegalArgumentException("유효하지 않은 타겟 타입입니다.");
        }
        if (targetId == null || targetId <= 0) {
            throw new IllegalArgumentException("유효하지 않은 타겟 ID입니다.");
        }
    }

    private Long resolveTargetId(TargetType targetType, Long targetId) {
        if (TargetType.CONTENT.equals(targetType)) {
            return resolveContentIdByTmdbId(targetId);
        }
        if (TargetType.REVIEW.equals(targetType)) {
            return resolveReviewId(targetId);
        }
        return targetId;
    }

    private Long resolveContentIdByTmdbId(Long tmdbId) {
        Content content = contentRepository.findByTmdbId(tmdbId)
                .orElseThrow(() -> new IllegalArgumentException("해당 콘텐츠를 찾을 수 없습니다."));

        log.debug("CONTENT 타입: tmdbId={} -> contentId={}", tmdbId, content.getId());
        return content.getId();
    }

    private Long resolveReviewId(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("해당 리뷰를 찾을 수 없습니다."));

        log.debug("REVIEW 타입 검증 완료: reviewId={}", reviewId);
        return review.getId();
    }

    private boolean isAlreadyLiked(Long userId, TargetType targetType, Long actualTargetId) {
        return likeRepository.existsByUserIdAndTargetTypeAndTargetId(userId, targetType, actualTargetId);
    }

    private void removeLike(Long userId, TargetType targetType, Long actualTargetId) {
        likeRepository.deleteByUserIdAndTargetTypeAndTargetId(userId, targetType, actualTargetId);
        log.info("좋아요 취소됨: userId={}, type={}, targetId={}", userId, targetType, actualTargetId);
    }

    private LikeToggleResponse saveLikeWithConcurrencyGuard(
            Long userId,
            TargetType targetType,
            Long originalTargetId,
            Long actualTargetId
    ) {
        try {
            Like like = Like.builder()
                    .userId(userId)
                    .targetType(targetType)
                    .targetId(actualTargetId)
                    .build();

            likeRepository.save(like);
            log.info("좋아요 추가됨: userId={}, type={}, targetId={}", userId, targetType, actualTargetId);
            return buildToggleResponse(true, targetType, originalTargetId);
        } catch (DataIntegrityViolationException e) {
            log.warn("동시성 중복 좋아요 감지: userId={}, type={}, targetId={}", userId, targetType, actualTargetId);
            return buildToggleResponse(true, targetType, originalTargetId);
        }
    }

    private LikeToggleResponse buildToggleResponse(boolean liked, TargetType targetType, Long originalTargetId) {
        return LikeToggleResponse.builder()
                .liked(liked)
                .targetType(targetType)
                .targetId(originalTargetId)
                .build();
    }

    private boolean isLikedByUser(String username, TargetType targetType, Long actualTargetId) {
        if (username == null) {
            return false;
        }

        Long userId = userService.findUserIdByUsername(username);
        return likeRepository.existsByUserIdAndTargetTypeAndTargetId(userId, targetType, actualTargetId);
    }

    private List<Long> resolveBatchTargetIds(TargetType targetType, List<Long> targetIds) {
        // REVIEW는 입력 ID가 PK라 그대로 사용한다.
        // CONTENT 배치 변환은 별도 API/리포지토리 확장 시 처리한다.
        return targetIds;
    }
}


