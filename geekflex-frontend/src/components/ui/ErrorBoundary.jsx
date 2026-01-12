import React from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import "../../styles/ui/error-boundary.css";

/**
 * React Error Boundary 컴포넌트
 * - 컴포넌트 트리에서 발생하는 JavaScript 에러를 캐치
 * - 에러 UI 표시 및 로깅
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더에서 에러 UI를 표시하기 위해 상태 업데이트
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // 개발 환경에서만 상세 에러 정보 표시
    if (import.meta.env.DEV) {
      console.error("Error details:", {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        stack: error.stack,
      });
    }

    // 프로덕션 환경에서는 에러 리포팅 서비스로 전송 가능
    // 예: Sentry, LogRocket 등
    if (import.meta.env.PROD) {
      // 에러 리포팅 로직 추가 가능
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 에러 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // 기본 에러 UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1 className="error-boundary__title">오류가 발생했습니다</h1>
            <p className="error-boundary__message">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary__details">
                <summary>에러 상세 정보 (개발 모드)</summary>
                <pre className="error-boundary__stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-boundary__actions">
              <button
                onClick={this.handleReset}
                className="error-boundary__button error-boundary__button--primary"
              >
                <i className="fas fa-redo"></i> 다시 시도
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="error-boundary__button error-boundary__button--secondary"
              >
                <i className="fas fa-home"></i> 홈으로 이동
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC로 사용할 수 있는 Error Boundary 래퍼
 */
export const withErrorBoundary = (Component, fallback) => {
  return (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
