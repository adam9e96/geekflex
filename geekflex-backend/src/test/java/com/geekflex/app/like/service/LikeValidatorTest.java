package com.geekflex.app.like.service;

import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.repository.ContentRepository;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LikeValidatorTest {

    @Mock
    private ContentRepository contentRepository;

    @Mock
    private ReviewRepository reviewRepository;

    private LikeValidator likeValidator;

    @BeforeEach
    void setUp() {
        likeValidator = new LikeValidator(contentRepository, reviewRepository);
    }

    @Test
    @DisplayName("타겟 타입과 ID가 유효하면 입력 검증을 통과한다")
    void validateTargetArguments_passesWhenArgumentsAreValid() {
        // 정상 입력이면 예외 없이 통과해야 한다.
        assertThatCode(() -> likeValidator.validateTargetArguments(TargetType.CONTENT, 1L))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("타겟 타입이 null이면 입력 검증에서 예외가 발생한다")
    void validateTargetArguments_throwsWhenTargetTypeIsNull() {
        // 타입이 없으면 잘못된 요청으로 처리해야 한다.
        assertThatThrownBy(() -> likeValidator.validateTargetArguments(null, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("유효하지 않은 타겟 타입입니다.");
    }

    @Test
    @DisplayName("타겟 ID가 null 이하이면 입력 검증에서 예외가 발생한다")
    void validateTargetArguments_throwsWhenTargetIdIsInvalid() {
        // 0 이하 또는 null ID는 허용하지 않는다.
        assertThatThrownBy(() -> likeValidator.validateTargetArguments(TargetType.REVIEW, 0L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("유효하지 않은 타겟 ID입니다.");
    }

    @Test
    @DisplayName("CONTENT 타입이면 tmdbId를 실제 contentId로 변환한다")
    void resolveTargetId_returnsContentIdWhenTargetTypeIsContent() {
        // CONTENT 좋아요는 프론트의 tmdbId를 DB PK로 해석해야 한다.
        when(contentRepository.findByTmdbId(100L))
                .thenReturn(Optional.of(Content.builder().id(10L).tmdbId(100L).build()));

        Long resolvedId = likeValidator.resolveTargetId(TargetType.CONTENT, 100L);

        assertThat(resolvedId).isEqualTo(10L);
    }

    @Test
    @DisplayName("CONTENT 타입에서 콘텐츠를 찾지 못하면 예외가 발생한다")
    void resolveTargetId_throwsWhenContentDoesNotExist() {
        // tmdbId와 매핑되는 콘텐츠가 없으면 좋아요 대상을 만들 수 없다.
        when(contentRepository.findByTmdbId(100L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> likeValidator.resolveTargetId(TargetType.CONTENT, 100L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("해당 콘텐츠를 찾을 수 없습니다.");
    }

    @Test
    @DisplayName("REVIEW 타입이면 리뷰 존재 여부를 검증하고 reviewId를 반환한다")
    void resolveTargetId_returnsReviewIdWhenTargetTypeIsReview() {
        // REVIEW 좋아요는 review PK를 그대로 사용하되 존재 여부를 검증해야 한다.
        when(reviewRepository.findById(20L))
                .thenReturn(Optional.of(Review.builder()
                        .id(20L)
                        .userId(1L)
                        .contentId(100L)
                        .reviewType(ReviewType.BASIC)
                        .rating(4.5)
                        .build()));

        Long resolvedId = likeValidator.resolveTargetId(TargetType.REVIEW, 20L);

        assertThat(resolvedId).isEqualTo(20L);
    }

    @Test
    @DisplayName("REVIEW 타입에서 리뷰를 찾지 못하면 예외가 발생한다")
    void resolveTargetId_throwsWhenReviewDoesNotExist() {
        // 존재하지 않는 리뷰에는 좋아요를 남길 수 없다.
        when(reviewRepository.findById(20L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> likeValidator.resolveTargetId(TargetType.REVIEW, 20L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("해당 리뷰를 찾을 수 없습니다.");
    }

    @Test
    @DisplayName("CONTENT와 REVIEW 외 타입은 입력 ID를 그대로 반환한다")
    void resolveTargetId_returnsOriginalTargetIdForOtherTypes() {
        // 현재 지원하지 않는 타입은 별도 변환 없이 그대로 사용한다.
        Long resolvedId = likeValidator.resolveTargetId(TargetType.COLLECTION, 30L);

        assertThat(resolvedId).isEqualTo(30L);
    }

    @Test
    @DisplayName("배치 ID 해석은 전달받은 목록을 그대로 반환한다")
    void resolveBatchTargetIds_returnsOriginalIds() {
        // 현재 구현은 배치 변환 로직이 없어 원본 목록을 유지한다.
        List<Long> targetIds = List.of(1L, 2L, 3L);

        List<Long> resolvedIds = likeValidator.resolveBatchTargetIds(TargetType.CONTENT, targetIds);

        assertThat(resolvedIds).containsExactly(1L, 2L, 3L);
    }
}
