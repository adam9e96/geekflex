import React from "react";
import PropTypes from "prop-types";
import styles from "./InfoSection.module.css";

/**
 * 정보 섹션 래퍼 컴포넌트
 * @param {string} title - 섹션 제목
 * @param {string} icon - 아이콘 클래스명 (FontAwesome, 선택사항)
 * @param {React.ReactNode} children - 섹션 내용
 */
const InfoSection = ({ title, icon, children }) => {
  return (
    <div className={styles.section}>
      <h3 className={styles.title}>
        {icon && <i className={icon}></i>}
        {title}
      </h3>
      <div className={styles.grid}>{children}</div>
    </div>
  );
};

InfoSection.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  children: PropTypes.node,
};

export default InfoSection;
