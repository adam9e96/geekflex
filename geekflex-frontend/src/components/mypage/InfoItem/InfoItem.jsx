import React from "react";
import PropTypes from "prop-types";
import styles from "./InfoItem.module.css";

/**
 * 정보 아이템 컴포넌트
 * @param {string} label - 라벨 텍스트
 * @param {React.ReactNode} children - 값 (텍스트 또는 커스텀 컴포넌트)
 * @param {boolean} code - 코드 스타일 적용 여부
 */
const InfoItem = ({ label, children, code = false }) => {
  return (
    <div className={styles.infoItem}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${code ? styles.code : ""}`}>{children}</span>
    </div>
  );
};

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
  code: PropTypes.bool,
};

export default InfoItem;
