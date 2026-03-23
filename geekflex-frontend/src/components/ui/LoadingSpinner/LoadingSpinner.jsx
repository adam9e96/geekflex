import React from "react";
import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = () => {
  return (
    <div className={styles.loadingSpinner}>
      <i className="fas fa-spinner fa-spin"></i>
      <span>로딩중...</span>
    </div>
  );
};

export default LoadingSpinner;
