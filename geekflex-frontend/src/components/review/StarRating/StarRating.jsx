import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { FaStar } from "react-icons/fa";
import { FaStarHalf } from "react-icons/fa6"; // FaStarHalf는 fa6에서 가져옴
import styles from "./StarRating.module.css";

/**
 * 별점 표시 및 선택 컴포넌트
 * (드래그 지원, 0.5점 단위)
 *
 * @param {number} rating - 현재 별점 (0-5)
 * @param {Function} onRatingChange - 별점 변경 핸들러 (없으면 읽기 전용)
 * @param {boolean} readonly - 읽기 전용 여부 (명시적)
 * @param {string} sizeClass - 별 아이콘 크기 클래스 (예: text-2xl)
 */
const StarRating = ({
  rating = 0,
  onRatingChange,
  readonly = false,
  sizeClass = "text-2xl", // 기본 크기 키움
}) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const isInteractive = !readonly && onRatingChange;

  // 별점 계산 (드래그/클릭 위치 기반)
  const calculateRating = (clientX) => {
    if (!containerRef.current) return rating;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;

    // 범위 벗어남 처리
    if (x < 0) return 0;
    if (x > width) return 5;

    const percentage = x / width;

    // 0.5점 단위로 계산
    // 오른쪽 끝 근처(95% 이상)에서는 5.0을 반환
    if (percentage >= 0.95) return 5.0;

    const calculatedRating = Math.floor(percentage * 10) / 2;
    return Math.max(0, Math.min(5, calculatedRating));
  };

  // 핸들러
  const handleMouseDown = (e) => {
    if (!isInteractive) return;
    setIsDragging(true);
    onRatingChange(calculateRating(e.clientX));
  };

  const handleMouseMove = (e) => {
    if (!isInteractive || !isDragging) return;
    onRatingChange(calculateRating(e.clientX));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e) => {
    if (!isInteractive) return;
    onRatingChange(calculateRating(e.clientX));
  };

  // 별 렌더링
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const starRating = i;
      const isFilled = rating >= starRating;
      const isHalfFilled = rating >= starRating - 0.5 && rating < starRating;

      stars.push(
        <div
          key={i}
          className={`${styles.starWrapper} ${styles[sizeClass] || ""} ${
            isFilled || isHalfFilled ? styles.filled : styles.empty
          } ${isInteractive ? styles.cursorPointer : ""}`}
        >
          {isHalfFilled ? <FaStarHalf /> : <FaStar />}
        </div>,
      );
    }
    return stars;
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isInteractive ? styles.interactive : ""}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      {renderStars()}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number,
  onRatingChange: PropTypes.func,
  readonly: PropTypes.bool,
  sizeClass: PropTypes.string,
};

export default StarRating;
