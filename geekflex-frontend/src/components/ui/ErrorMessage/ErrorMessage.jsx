import React from "react";
import PropTypes from "prop-types";
import styles from "./ErrorMessage.module.css";

/**
 * 에러 메시지 컴포넌트
 * @param {Object} props
 * @param {'error' | 'warning' | 'info'} props.type - 메시지 타입
 * @param {string} props.title - 제목
 * @param {string} props.message - 설명 메시지
 * @param {Function} [props.onRetry] - 재시도 핸들러
 * @param {Function} [props.onBack] - 뒤로가기 핸들러
 */
const ErrorMessage = ({ type = "error", title, message, onRetry, onBack }) => {
  const iconMap = {
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  return (
    <div className={`${styles.errorMessage} ${styles[type]}`}>
      <i className={`fas ${iconMap[type]} ${styles.icon}`}></i>
      <div className={styles.text}>
        {title && <h3>{title}</h3>}
        <p>{message}</p>
      </div>
      <div className={styles.actions}>
        {onBack && (
          <button onClick={onBack} className={styles.backBtn}>
            <i className="fas fa-arrow-left"></i>
            이전으로
          </button>
        )}
        {onRetry && (
          <button onClick={onRetry} className={styles.retryBtn}>
            <i className="fas fa-redo"></i>
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  type: PropTypes.oneOf(["error", "warning", "info"]),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  onBack: PropTypes.func,
};

export default ErrorMessage;
