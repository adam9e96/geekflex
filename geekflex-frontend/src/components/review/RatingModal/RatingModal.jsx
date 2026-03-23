import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { useReviewStore } from "@stores/reviewStore";
import StarRating from "@components/review/StarRating/StarRating.jsx";
import styles from "./RatingModal.module.css";

/**
 * 평점만 매기기 모달 컴포넌트
 *
 * 기능:
 * - 드래그로 별점 선택 (0.5점 단위)
 * - SHORT 타입 리뷰 제출
 */
const RatingModal = () => {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createReview, fetchReviews, ratingModal, closeRatingModal } = useReviewStore();

  const { isOpen, contentId, dbId, onSuccess } = ratingModal;

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setRating(0);
    }
  }, [isOpen]);

  // 제출 핸들러
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("별점을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        rating: rating,
        reviewType: "SHORT", // SHORT 타입으로 전송
        comment: null,
      };

      const reviewData = await createReview(contentId, requestBody);

      console.log("평점 등록 성공:", reviewData);
      toast.success("평점이 등록되었습니다!");

      // 모달 닫기
      closeRatingModal();

      // 리뷰 목록 업데이트 (Store 사용)
      if (dbId) {
        await fetchReviews(dbId);
      }

      // 기존 콜백 지원
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
    } catch (err) {
      console.error("평점 등록 실패:", err);

      if (err.status === 401 || err.status === 403 || err.message === "로그인이 필요합니다.") {
        toast.error("로그인이 필요합니다.");
      } else {
        toast.error(err.message || "평점 등록 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.overlay} onClick={closeRatingModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>이 작품의 평점을 입력해주세요</h3>
        </div>

        <div className={styles.content}>
          {/* 별점 영역 - StarRating 컴포넌트 사용 */}
          <div className={styles.stars}>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              sizeClass="text-4xl" // 모달에서는 크게 표시
            />
          </div>

          {/* 평점 숫자 표시 */}
          <div className={styles.value}>{rating > 0 ? rating.toFixed(1) : "0.0"}</div>

          {/* 안내 문구 */}
          <p className={styles.instruction}>별을 좌우로 드래그하여 평점을 선택하세요</p>
        </div>

        <div className={styles.footer}>
          <button
            className={`${styles.button} ${styles.buttonCancel}`}
            onClick={closeRatingModal}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            className={`${styles.button} ${styles.buttonSubmit}`}
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "등록 중..." : "완료"}
          </button>
        </div>
      </div>
    </div>
  );

  // React Portal을 사용하여 body에 직접 렌더링
  return createPortal(modalContent, document.body);
};

export default RatingModal;
