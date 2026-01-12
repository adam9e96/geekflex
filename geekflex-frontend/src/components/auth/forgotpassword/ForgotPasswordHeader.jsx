import React from "react";

/**
 * 비밀번호 찾기 페이지 헤더 컴포넌트
 */
const ForgotPasswordHeader = () => {
  return (
    <div className="login-header text-center mb-4">
      <div className="login-header__icon mb-3">
        <i className="fas fa-key fa-3x" style={{ color: "var(--color-primary)" }}></i>
      </div>
      <h1 className="login-header__title">비밀번호 찾기</h1>
      <p className="login-header__subtitle text-gray-500">가입 시 등록한 정보를 입력해주세요</p>
    </div>
  );
};

export default ForgotPasswordHeader;


