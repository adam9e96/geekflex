import React from "react";
import PropTypes from "prop-types";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useReviewStore } from "@stores/reviewStore";
import StarRating from "@components/review/StarRating/StarRating.jsx";
import styles from "./ReviewEditForm.module.css";

/**
 * 리뷰 수정 폼 컴포넌트
 * @param {Object} props
 * @param {Function} props.onSubmit - 수정 완료 핸들러
 */
const ReviewEditForm = ({ onSubmit }) => {
  const { editing, updateEditRating, updateEditComment, cancelEdit } = useReviewStore();

  return (
    <div className={styles.editContainer}>
      <div className={styles.formGroup}>
        <label className={styles.label}>별점</label>
        <div className={styles.starRating}>
          <StarRating rating={editing.rating} onRatingChange={updateEditRating} />
          {/* 별점 선택 안했을 때 */}
          <span className={styles.ratingText}>
            {editing.rating > 0 ? `${editing.rating}점` : "별점을 선택해주세요."}
          </span>
        </div>
      </div>

      {/* BASIC 리뷰일 때만 한줄평 입력 필드 표시 */}
      {editing.reviewType === "BASIC" && (
        <div className={styles.formGroup}>
          <label htmlFor={`edit-comment-${editing.reviewId}`} className={styles.label}>
            한줄평 <span className={styles.required}>*</span>
          </label>
          <textarea
            id={`edit-comment-${editing.reviewId}`}
            value={editing.comment}
            onChange={(e) => updateEditComment(e.target.value)}
            placeholder="이 작품에 대한 생각을 한줄로 남겨주세요 (최대 200자, 필수)"
            maxLength={200}
            rows={3}
            required
            className={styles.textarea}
          />
          <div className={styles.charCount}>{editing.comment.length} / 200</div>
        </div>
      )}

      {/* 버튼 영역 */}
      <div className={styles.editActions}>
        <button onClick={cancelEdit} className={`${styles.actionButton} ${styles.cancelButton}`}>
          <FaTimes /> 취소
        </button>
        <button
          onClick={() => onSubmit(editing.reviewId)}
          disabled={
            editing.rating === 0 || (editing.reviewType === "BASIC" && !editing.comment.trim())
          }
          className={`${styles.actionButton} ${styles.saveButton}`}
        >
          <FaCheck /> 저장
        </button>
      </div>
    </div>
  );
};

ReviewEditForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default ReviewEditForm;
