import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { getAccessToken } from "@utils/auth";
import "./styles/rating-modal.css";

/**
 * 평점만 매기기 모달 컴포넌트
 *
 * 기능:
 * - 드래그로 별점 선택 (0.5점 단위)
 * - SHORT 타입 리뷰 제출
 */
const RatingModal = ({ isOpen, onClose, contentId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const starContainerRef = useRef(null);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  // 별점 계산 (드래그 위치 기반)
  const calculateRating = (clientX) => {
    if (!starContainerRef.current) return 0;

    const rect = starContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));

    // 0.5점 단위로 계산 (0 ~ 5점)
    // 오른쪽 끝 근처(95% 이상)에서는 5.0을 반환
    if (percentage >= 0.95) {
      return 5.0;
    }

    // 그 외의 경우 0.5 단위로 계산
    const calculatedRating = Math.floor(percentage * 10) / 2;
    return Math.max(0, Math.min(5, calculatedRating));
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const newRating = calculateRating(e.clientX);
    setRating(newRating);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newRating = calculateRating(e.clientX);
      setRating(newRating);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 클릭 이벤트 핸들러
  const handleClick = (e) => {
    const newRating = calculateRating(e.clientX);
    setRating(newRating);
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("별점을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const accessToken = getAccessToken();

      if (!accessToken) {
        toast.error("로그인이 필요합니다.");
        setIsSubmitting(false);
        return;
      }

      const requestBody = {
        rating: rating,
        reviewType: "SHORT", // SHORT 타입으로 전송
        comment: null,
      };

      const response = await fetch(`/api/v1/reviews/${contentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || "평점 등록에 실패했습니다.";

        if (response.status === 400) {
          toast.error(errorMessage);
          setIsSubmitting(false);
          return;
        }

        if (response.status === 401 || response.status === 403) {
          toast.error("로그인이 필요합니다.");
          setIsSubmitting(false);
          return;
        }

        throw new Error(errorMessage);
      }

      const reviewData = await response.json();
      console.log("평점 등록 성공:", reviewData);

      toast.success("평점이 등록되었습니다!");

      // 모달 닫기
      onClose();

      // 리뷰 목록 업데이트를 위한 콜백 호출 (비동기 처리)
      if (onSuccess) {
        // 약간의 지연을 두어 모달이 완전히 닫힌 후 목록 업데이트
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
    } catch (err) {
      console.error("평점 등록 실패:", err);
      toast.error(err.message || "평점 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 별 렌더링 (0.5점 단위 지원)
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const starRating = i;
      const isFilled = rating >= starRating;
      const isHalfFilled = rating >= starRating - 0.5 && rating < starRating;

      stars.push(
        <div
          key={i}
          className={`rating-star ${isFilled ? "filled" : ""} ${isHalfFilled ? "half-filled" : ""}`}
        >
          <i className="fas fa-star"></i>
          {isHalfFilled && (
            <div className="rating-star-half">
              <i className="fas fa-star"></i>
            </div>
          )}
        </div>,
      );
    }
    return stars;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal__header">
          <h3 className="rating-modal__title">이 작품의 평점을 입력해주세요</h3>
        </div>

        <div className="rating-modal__content">
          {/* 별점 영역 */}
          <div
            ref={starContainerRef}
            className="rating-modal__stars"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
          >
            {renderStars()}
          </div>

          {/* 평점 숫자 표시 */}
          <div className="rating-modal__value">{rating > 0 ? rating.toFixed(1) : "0.0"}</div>

          {/* 안내 문구 */}
          <p className="rating-modal__instruction">별을 좌우로 드래그하여 평점을 선택하세요</p>
        </div>

        <div className="rating-modal__footer">
          <button
            className="rating-modal__button rating-modal__button--cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            className="rating-modal__button rating-modal__button--submit"
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
