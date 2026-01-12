import React from "react";

/**
 * 정보 섹션 래퍼 컴포넌트
 * @param {string} title - 섹션 제목
 * @param {string} icon - 아이콘 클래스명 (FontAwesome, 선택사항)
 * @param {React.ReactNode} children - 섹션 내용
 */
const InfoSection = ({ title, icon, children }) => {
  return (
    <div className="info-section">
      <h3 className="section-title">
        {icon && <i className={icon}></i>}
        {title}
      </h3>
      <div className="info-grid">{children}</div>
    </div>
  );
};

export default InfoSection;

