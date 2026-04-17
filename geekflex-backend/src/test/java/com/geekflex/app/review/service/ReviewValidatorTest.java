package com.geekflex.app.review.service;

import com.geekflex.app.review.entity.Review;
import com.geekflex.app.review.entity.ReviewType;
import com.geekflex.app.review.exception.DuplicateReviewException;
import com.geekflex.app.review.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewValidatorTest {

    @Mock
    private ReviewRepository reviewRepository;

    private ReviewValidator reviewValidator;

    @BeforeEach
    void setUp() {
        reviewValidator = new ReviewValidator(reviewRepository);
    }

    @Test
    @DisplayName("중복 리뷰가 있으면 DuplicateReviewException을 던진다")
    void validateReviewNotExists_throwsWhenDuplicateReviewExists() {
        // 이미 같은 사용자/콘텐츠 조합의 리뷰가 있으면 중복 예외가 발생해야 한다.
        when(reviewRepository.findByUserIdAndContentId(1L, 100L))
                .thenReturn(Optional.of(review(1L, 100L, ReviewType.BASIC)));

        assertThatThrownBy(() -> reviewValidator.validateReviewNotExists(1L, 100L))
                .isInstanceOf(DuplicateReviewException.class)
                .hasMessage("이미 이 작품에 대한 리뷰가 존재합니다.");
    }

    @Test
    @DisplayName("중복 리뷰가 없으면 예외 없이 통과한다")
    void validateReviewNotExists_doesNotThrowWhenReviewDoesNotExist() {
        // 저장된 리뷰가 없으면 정상적으로 통과해야 한다.
        when(reviewRepository.findByUserIdAndContentId(1L, 100L))
                .thenReturn(Optional.empty());

        assertThatCode(() -> reviewValidator.validateReviewNotExists(1L, 100L))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("리뷰 소유자가 아니면 소유권 검증에서 예외가 발생한다")
    void validateReviewOwnership_throwsWhenUserDoesNotOwnReview() {
        // 다른 사용자가 작성한 리뷰는 수정/삭제할 수 없어야 한다.
        Review review = review(1L, 100L, ReviewType.BASIC);

        assertThatThrownBy(() -> reviewValidator.validateReviewOwnership(review, 2L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("본인의 리뷰만 수정/삭제할 수 있습니다.");
    }

    @Test
    @DisplayName("리뷰 소유자이면 소유권 검증을 통과한다")
    void validateReviewOwnership_doesNotThrowWhenUserOwnsReview() {
        // 본인 리뷰에 대해서는 소유권 검증이 통과해야 한다.
        Review review = review(1L, 100L, ReviewType.BASIC);

        assertThatCode(() -> reviewValidator.validateReviewOwnership(review, 1L))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("리뷰 타입이 다르면 타입 변경 예외가 발생한다")
    void validateReviewTypeSame_throwsWhenTypesAreDifferent() {
        // 기존 리뷰 타입과 요청 타입이 다르면 타입 변경을 막아야 한다.
        assertThatThrownBy(() -> reviewValidator.validateReviewTypeSame(ReviewType.BASIC, ReviewType.SHORT))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("리뷰 타입은 변경할 수 없습니다. 타입을 변경하려면 리뷰를 삭제 후 다시 작성해주세요.");
    }

    @Test
    @DisplayName("리뷰 타입이 같으면 타입 검증을 통과한다")
    void validateReviewTypeSame_doesNotThrowWhenTypesAreSame() {
        // 리뷰 타입이 동일하면 그대로 수정 가능해야 한다.
        assertThatCode(() -> reviewValidator.validateReviewTypeSame(ReviewType.SHORT, ReviewType.SHORT))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("BASIC 리뷰에 코멘트가 없으면 예외가 발생한다")
    void validateReviewTypeConstraints_throwsWhenBasicReviewHasNoComment() {
        // BASIC 리뷰는 한 줄평이 필수다.
        assertThatThrownBy(() -> reviewValidator.validateReviewTypeConstraints(ReviewType.BASIC, " "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("BASIC 리뷰는 한 줄평(comment)이 필요합니다.");
    }

    @Test
    @DisplayName("SHORT 리뷰에 코멘트가 있으면 예외가 발생한다")
    void validateReviewTypeConstraints_throwsWhenShortReviewHasComment() {
        // SHORT 리뷰는 코멘트를 허용하지 않는다.
        assertThatThrownBy(() -> reviewValidator.validateReviewTypeConstraints(ReviewType.SHORT, "한 줄평"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("SHORT 리뷰는 한 줄평(comment)을 포함할 수 없습니다.");
    }

    @Test
    @DisplayName("DETAILED 리뷰는 아직 지원하지 않아 예외가 발생한다")
    void validateReviewTypeConstraints_throwsWhenDetailedReviewRequested() {
        // 아직 지원하지 않는 DETAILED 타입은 명시적으로 차단한다.
        assertThatThrownBy(() -> reviewValidator.validateReviewTypeConstraints(ReviewType.DETAILED, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("DETAILED 리뷰는 아직 지원되지 않습니다.");
    }

    @Test
    @DisplayName("유효한 BASIC과 SHORT 리뷰는 타입 제약 검증을 통과한다")
    void validateReviewTypeConstraints_allowsValidBasicAndShortReviews() {
        // 허용되는 입력은 예외 없이 통과해야 한다.
        assertThatCode(() -> reviewValidator.validateReviewTypeConstraints(ReviewType.BASIC, "좋았어요"))
                .doesNotThrowAnyException();

        assertThatCode(() -> reviewValidator.validateReviewTypeConstraints(ReviewType.SHORT, null))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("수정 요청 시 소유자가 아니면 예외가 발생한다")
    void validateUpdateRequest_throwsWhenOwnershipIsInvalid() {
        // 수정 요청 검증은 가장 먼저 소유권을 확인해야 한다.
        Review review = review(1L, 100L, ReviewType.BASIC);

        assertThatThrownBy(() -> reviewValidator.validateUpdateRequest(review, 2L, ReviewType.BASIC, "수정"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("본인의 리뷰만 수정/삭제할 수 있습니다.");
    }

    @Test
    @DisplayName("수정 요청 시 리뷰 타입을 바꾸면 예외가 발생한다")
    void validateUpdateRequest_throwsWhenTypeChanges() {
        // 본인 리뷰여도 타입 변경은 허용되지 않아야 한다.
        Review review = review(1L, 100L, ReviewType.BASIC);

        assertThatThrownBy(() -> reviewValidator.validateUpdateRequest(review, 1L, ReviewType.SHORT, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("리뷰 타입은 변경할 수 없습니다. 타입을 변경하려면 리뷰를 삭제 후 다시 작성해주세요.");
    }

    @Test
    @DisplayName("수정 요청 시 타입별 코멘트 규칙을 어기면 예외가 발생한다")
    void validateUpdateRequest_throwsWhenCommentViolatesTypeConstraint() {
        // 타입은 같아도 타입별 규칙을 어기면 수정이 실패해야 한다.
        Review review = review(1L, 100L, ReviewType.SHORT);

        assertThatThrownBy(() -> reviewValidator.validateUpdateRequest(review, 1L, ReviewType.SHORT, "수정 코멘트"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("SHORT 리뷰는 한 줄평(comment)을 포함할 수 없습니다.");
    }

    @Test
    @DisplayName("유효한 수정 요청이면 예외 없이 통과한다")
    void validateUpdateRequest_doesNotThrowForValidRequest() {
        // 소유권, 타입, 코멘트 제약을 모두 만족하면 수정 요청이 통과해야 한다.
        Review review = review(1L, 100L, ReviewType.BASIC);

        assertThatCode(() -> reviewValidator.validateUpdateRequest(review, 1L, ReviewType.BASIC, "수정 코멘트"))
                .doesNotThrowAnyException();
    }

    private Review review(Long userId, Long contentId, ReviewType reviewType) {
        // 테스트에서 공통으로 사용할 최소 Review 객체를 생성한다.
        return Review.builder()
                .userId(userId)
                .contentId(contentId)
                .reviewType(reviewType)
                .rating(4.5)
                .build();
    }
}
