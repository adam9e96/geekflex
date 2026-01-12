import React from "react";
import "./styles/ui.css";

/**
 * 공통 로딩 스피너 컴포넌트
 */
const LoadingSpinner = ({ message = "로딩 중...", className = "" }) => {
  return (
    <div className={`loading-spinner ${className}`}>
      <i className="fas fa-spinner fa-spin"></i>
      {message && <span>{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
