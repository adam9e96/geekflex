import React from "react";
import { Link } from "react-router-dom";

/**
 * 로그인 링크 섹션 컴포넌트
 */
const LoginSection = () => {
  return (
    <div className="login-link text-center mt-4">
      <p>
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="login-link-text text-[var(--color-primary)]">
          로그인
        </Link>
      </p>
    </div>
  );
};

export default LoginSection;

