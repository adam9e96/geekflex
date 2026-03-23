import React, { memo } from "react";
import PropTypes from "prop-types";
import styles from "./EmptyState.module.css";

const EmptyState = memo(({ message = "정보를 로드하는데 실패했습니다.", className = "" }) => {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      <div className={styles.content}>
        <i className={`fas fa-exclamation-triangle ${styles.icon}`}></i>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

EmptyState.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

export default EmptyState;
