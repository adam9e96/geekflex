import React, { memo } from "react";

/**
 * 이미지 없음 또는 에러 상태를 표시하는 컴포넌트
 * @param {Object} props
 * @param {string} props.message - 표시할 메시지 (기본값: "정보를 로드하는데 실패했습니다.")
 * @param {string} props.className - 추가 CSS 클래스명
 */
const NoImage = memo(({ message = "정보를 로드하는데 실패했습니다.", className = "" }) => {
  return (
    <div className={`no-image ${className}`}>
      <div className="no-image__content">
        <i className="fas fa-exclamation-triangle no-image__icon"></i>
        <p className="no-image__message">{message}</p>
      </div>
    </div>
  );
});

NoImage.displayName = "NoImage";

export default NoImage;
