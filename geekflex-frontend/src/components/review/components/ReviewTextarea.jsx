import React, { useRef, useEffect } from "react";

/**
 * 리뷰 내용 입력 텍스트에어리어 컴포넌트
 * 자동 높이 조절 기능 포함
 * 
 * @param {string} value - 텍스트 값
 * @param {Function} onChange - 변경 핸들러
 * @param {string} placeholder - 플레이스홀더 텍스트
 * @param {number} minLength - 최소 길이
 * @param {number} maxLength - 최대 길이
 */
const ReviewTextarea = ({ value, onChange, placeholder, minLength, maxLength }) => {
  const textareaRef = useRef(null);

  // 텍스트 변경 시 높이 자동 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className="review-textarea"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      minLength={minLength}
      maxLength={maxLength}
      rows={8}
    />
  );
};

export default ReviewTextarea;

