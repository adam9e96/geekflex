import React from "react";

/**
 * 별점 선택 컴포넌트
 * 
 * @param {number} rating - 현재 선택된 별점 (0-5)
 * @param {Function} onRatingChange - 별점 변경 핸들러
 */
const StarRating = ({ rating = 0, onRatingChange }) => {
  const handleStarClick = (value) => {
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleStarHover = () => {
    // 호버 효과는 CSS로 처리
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className={`star-rating__star ${value <= rating ? "star-rating__star--active" : ""}`}
          onClick={() => handleStarClick(value)}
          onMouseEnter={handleStarHover}
          aria-label={`${value}점`}
        >
          <i className="fas fa-star"></i>
        </button>
      ))}
      <span className="star-rating__value">{rating > 0 ? `${rating}.0` : ""}</span>
    </div>
  );
};

export default StarRating;

