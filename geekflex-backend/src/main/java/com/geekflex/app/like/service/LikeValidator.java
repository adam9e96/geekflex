package com.geekflex.app.like.service;

import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.repository.ContentRepository;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Like 검증 및 ID 해석 서비스
 * <p>
 * 좋아요 대상의 유효성 검증과 TargetType별 실제 DB ID 해석을 담당합니다.
 * - 입력값 검증
 * - tmdbId → contentId 변환 (CONTENT 타입)
 * - reviewId 존재 여부 검증 (REVIEW 타입)
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class LikeValidator {

    private final ContentRepository contentRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 타겟 인자 유효성 검증
     *
     * @param targetType 타겟 타입
     * @param targetId   타겟 ID
     * @throws IllegalArgumentException 유효하지 않은 값인 경우
     */
    public void validateTargetArguments(TargetType targetType, Long targetId) {
        if (targetType == null) {
            throw new IllegalArgumentException("유효하지 않은 타겟 타입입니다.");
        }
        if (targetId == null || targetId <= 0) {
            throw new IllegalArgumentException("유효하지 않은 타겟 ID입니다.");
        }
    }

    /**
     * TargetType에 따라 실제 DB ID를 해석합니다.
     * <p>
     * CONTENT 타입: tmdbId → contentId 변환
     * REVIEW 타입: reviewId 존재 여부 검증 후 반환
     * 기타 타입: 입력값 그대로 반환
     *
     * @param targetType 타겟 타입
     * @param targetId   프론트에서 전달된 타겟 ID
     * @return 실제 DB에서 사용할 ID
     */
    public Long resolveTargetId(TargetType targetType, Long targetId) {
        if (TargetType.CONTENT.equals(targetType)) {
            return resolveContentIdByTmdbId(targetId);
        }
        if (TargetType.REVIEW.equals(targetType)) {
            return resolveReviewId(targetId);
        }
        return targetId;
    }

    /**
     * 배치 ID 해석
     * <p>
     * REVIEW는 입력 ID가 PK라 그대로 사용합니다.
     * CONTENT 배치 변환은 별도 API/리포지토리 확장 시 처리합니다.
     */
    public List<Long> resolveBatchTargetIds(TargetType targetType, List<Long> targetIds) {
        return targetIds;
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
}
