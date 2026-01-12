import React from "react";

/**
 * 정보 아이템 컴포넌트
 * @param {string} label - 라벨 텍스트
 * @param {React.ReactNode} children - 값 (텍스트 또는 커스텀 컴포넌트)
 * @param {boolean} code - 코드 스타일 적용 여부
 */
const InfoItem = ({ label, children, code = false }) => {
  return (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className={`info-value ${code ? "code" : ""}`}>{children}</span>
    </div>
  );
};

export default InfoItem;

