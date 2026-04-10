package com.geekflex.app.like.service;

import com.geekflex.app.like.dto.LikeCountResponse;
import com.geekflex.app.like.dto.LikeStatusResponse;
import com.geekflex.app.like.dto.LikeToggleResponse;
import com.geekflex.app.like.entity.Like;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.like.repository.LikeRepository;
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
    private final LikeValidator likeValidator;
    private final UserService userService;

    @Transactional
    public LikeToggleResponse toggleLike(String username, TargetType targetType, Long targetId) {
        likeValidator.validateTargetArguments(targetType, targetId);

        Long actualTargetId = likeValidator.resolveTargetId(targetType, targetId);
        Long userId = userService.findUserIdByUsername(username);

        if (isAlreadyLiked(userId, targetType, actualTargetId)) {
            removeLike(userId, targetType, actualTargetId);
            return LikeToggleResponse.of(false, targetType, targetId);
        }

        saveLike(userId, targetType, actualTargetId);
        return LikeToggleResponse.of(true, targetType, targetId);
    }

    @Transactional(readOnly = true)
    public LikeStatusResponse getLikeStatus(String username, TargetType targetType, Long targetId) {
        likeValidator.validateTargetArguments(targetType, targetId);

        Long actualTargetId = likeValidator.resolveTargetId(targetType, targetId);
        boolean liked = isLikedByUser(username, targetType, actualTargetId);

        return LikeStatusResponse.of(liked);
    }

    @Transactional(readOnly = true)
    public LikeCountResponse countLikes(TargetType targetType, Long targetId) {
        likeValidator.validateTargetArguments(targetType, targetId);

        Long actualTargetId = likeValidator.resolveTargetId(targetType, targetId);
        long count = likeRepository.countByTargetTypeAndTargetId(targetType, actualTargetId);

        return LikeCountResponse.of(count);
    }

    @Transactional(readOnly = true)
    public List<Long> getLikeStatuses(String username, TargetType targetType, List<Long> targetIds) {
        if (username == null || targetIds == null || targetIds.isEmpty()) {
            return Collections.emptyList();
        }

        Long userId = userService.findUserIdByUsername(username);
        List<Long> actualTargetIds = likeValidator.resolveBatchTargetIds(targetType, targetIds);
        List<Like> likes = likeRepository.findByUserIdAndTargetTypeAndTargetIdIn(userId, targetType, actualTargetIds);

        return likes.stream()
                .map(Like::getTargetId)
                .toList();
    }

    private boolean isAlreadyLiked(Long userId, TargetType targetType, Long actualTargetId) {
        return likeRepository.existsByUserIdAndTargetTypeAndTargetId(userId, targetType, actualTargetId);
    }

    private void removeLike(Long userId, TargetType targetType, Long actualTargetId) {
        likeRepository.deleteByUserIdAndTargetTypeAndTargetId(userId, targetType, actualTargetId);
        log.info("좋아요 취소됨: userId={}, type={}, targetId={}", userId, targetType, actualTargetId);
    }

    /** 좋아요 저장 (동시성 중복 시에도 정상 처리) */
    private void saveLike(Long userId, TargetType targetType, Long actualTargetId) {
        try {
            Like like = Like.builder()
                    .userId(userId)
                    .targetType(targetType)
                    .targetId(actualTargetId)
                    .build();

            likeRepository.save(like);
            log.info("좋아요 추가됨: userId={}, type={}, targetId={}", userId, targetType, actualTargetId);
        } catch (DataIntegrityViolationException e) {
            log.warn("동시성 중복 좋아요 감지: userId={}, type={}, targetId={}", userId, targetType, actualTargetId);
        }
    }

    private boolean isLikedByUser(String username, TargetType targetType, Long actualTargetId) {
        if (username == null) {
            return false;
        }

        Long userId = userService.findUserIdByUsername(username);
        return likeRepository.existsByUserIdAndTargetTypeAndTargetId(userId, targetType, actualTargetId);
    }
}


