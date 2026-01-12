import React, { memo } from "react";

/**
 * 섹션 헤더 컴포넌트
 */
const SectionHeader = memo(({ title, icon, moreLink, moreText = "더보기" }) => {
  return (
    <div className="home-popular__header">
      <h2 className="home-popular__title">
        {icon && <i className={icon}></i>}
        {title}
      </h2>
      {moreLink && (
        <a href={moreLink} className="home-popular__more">
          {moreText} <i className="fas fa-chevron-right"></i>
        </a>
      )}
    </div>
  );
});

SectionHeader.displayName = "SectionHeader";

export default SectionHeader;

