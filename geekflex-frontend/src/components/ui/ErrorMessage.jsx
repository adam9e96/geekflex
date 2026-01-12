import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/ui.css";

/**
 * 공통 에러 메시지 컴포넌트
 * 
 * @param {string} message - 에러 메시지
 * @param {boolean} showBackButton - 뒤로가기 버튼 표시 여부
 * @param {string} className - 추가 CSS 클래스
 * @param {string} variant - 에러 스타일 변형 ('error' | 'warning' | 'info')
 * @param {Function} onRetry - 재시도 콜백 함수 (선택)
 */
const ErrorMessage = ({
  message,
  showBackButton = true,
  className = "",
  variant = "error",
  onRetry = null,
}) => {
  const navigate = useNavigate();

  return (
    <div className={`error-message error-message--${variant} ${className}`}>
      <div className="error-message__icon">
        {variant === "error" && <i className="fas fa-exclamation-circle"></i>}
        {variant === "warning" && <i className="fas fa-exclamation-triangle"></i>}
        {variant === "info" && <i className="fas fa-info-circle"></i>}
      </div>
      <p className="error-message__text">{message}</p>
      <div className="error-message__actions">
        {onRetry && (
          <button
            onClick={onRetry}
            className="error-message__retry-btn"
            type="button"
          >
            <i className="fas fa-redo"></i> 다시 시도
          </button>
        )}
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="error-message__back-btn"
            type="button"
          >
            <i className="fas fa-arrow-left"></i> 돌아가기
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
