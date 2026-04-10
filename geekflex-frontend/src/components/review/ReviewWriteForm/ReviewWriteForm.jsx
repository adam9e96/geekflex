import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaPaperPlane, FaSpinner, FaCircleExclamation } from "react-icons/fa6";
import { FaLock, FaSignInAlt } from "react-icons/fa";

import { useReviewStore } from "@stores/reviewStore";
import { useAuthStore } from "@stores/authStore";
import StarRating from "@components/review/StarRating/StarRating.jsx";
import styles from "./ReviewWriteForm.module.css";

/**
 * 리뷰 작성 폼 컴포넌트
 *
 * @param {Object} props
 * @param {number|string} props.tmdbId - TMDB ID
 * @param {number|string} props.contentId - Content ID (Store 갱신용)
 * @reviewed 2026-01-23 - 검토 완료
 */
const ReviewWriteForm = ({ contentId }) => {
  // 로컬 상태 관리 (폼 입력)
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const { fetchReviews, createReview } = useReviewStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contentId || !rating || !comment.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Store Action 호출
      await createReview(contentId, {
        rating,
        comment,
      });

      // 성공 시 초기화
      setRating(0);
      setComment("");

      // 리뷰 목록 갱신
      await fetchReviews(contentId);
    } catch (error) {
      console.error("리뷰 제출 에러:", error);
      setSubmitError(error.message || "리뷰 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 비로그인 상태 UI
  if (!isLoggedIn) {
    return (
      <div className={styles.loginPrompt}>
        <FaLock className={styles.lockIcon} />
        <p className={styles.loginText}>리뷰를 작성하려면 로그인이 필요합니다</p>
        <Link to="/login" className={styles.loginButton}>
          <FaSignInAlt />
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 별점 선택 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>별점</label>
          <div className={styles.ratingContainer}>
            <StarRating rating={rating} onRatingChange={setRating} />
            <span className={styles.ratingText}>{rating > 0 ? `${rating}점` : ""}</span>
          </div>
        </div>

        {/* 한줄평 입력 */}
        <div className={styles.formGroup}>
          <label htmlFor="comment" className={styles.label}>
            한줄평 <span className={styles.required}>*</span>
          </label>
          <div className={styles.textareaWrapper}>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              placeholder="이 작품에 대한 생각을 한줄로 남겨주세요 (최대 200자, 필수)"
              maxLength={200}
              rows={3}
              required
              className={styles.textarea}
            />
            <div className={styles.charCount}>{comment.length} / 200</div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {submitError && (
          <div className={styles.errorMessage}>
            <FaCircleExclamation className="shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className={styles.submitWrapper}>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                <span>등록 중...</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="text-lg" />
                <span>리뷰 등록</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

ReviewWriteForm.propTypes = {
  contentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ReviewWriteForm;
