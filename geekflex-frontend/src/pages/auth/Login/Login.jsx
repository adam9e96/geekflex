import React from "react";
import { Link } from "react-router-dom";
import { useLogin } from "@hooks/auth/useLogin";
import styles from "./Login.module.css";

/**
 * 로그인 페이지 컴포넌트
 */
const Login = () => {
  const {
    formData,
    isPasswordVisible,
    isSubmitting,
    errors,
    serverError,
    logoutMessage,
    usernameInputRef,
    passwordInputRef,
    handleInputChange,
    validateField,
    togglePasswordVisibility,
    handleForgotPassword,
    handleGoogleLogin,
    handleKakaoLogin,
    handleSubmit,
    handleKeyDown,
  } = useLogin();

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* 헤더 */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <h1 className={styles.logoText}>GeekFlex</h1>
              <p className={styles.subtitle}>작품 리뷰 플랫폼</p>
            </div>
          </div>

          {/* 로그인 폼 */}
          <form className={styles.form} id="loginForm" onSubmit={handleSubmit}>
            {/* 아이디/이메일 입력 */}
            <div className={styles.group}>
              <label htmlFor="username" className={styles.label}>
                <i className="fas fa-user"></i>
                아이디 혹은 이메일
              </label>
              <input
                ref={usernameInputRef}
                type="text"
                id="username"
                name="username"
                className={`${styles.input} ${errors.username ? styles.error : ""}`}
                placeholder="아이디 또는 이메일을 입력하세요"
                value={formData.username}
                onChange={handleInputChange}
                onBlur={(e) => validateField("username", e.target.value)}
                onKeyDown={handleKeyDown}
                required
              />
              {errors.username && (
                <div className={styles.errorMsg} id="usernameError">
                  {errors.username}
                </div>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div className={styles.group}>
              <label htmlFor="password" className={styles.label}>
                <i className="fas fa-lock"></i>
                비밀번호
              </label>
              <div className={styles.passwordContainer}>
                <input
                  ref={passwordInputRef}
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`${styles.input} ${errors.password ? styles.error : ""}`}
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField("password", e.target.value)}
                  onKeyDown={handleKeyDown}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  id="passwordToggle"
                  onClick={togglePasswordVisibility}
                  aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  <i className={`fas ${isPasswordVisible ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {errors.password && (
                <div className={styles.errorMsg} id="passwordError">
                  {errors.password}
                </div>
              )}
            </div>

            {/* 폼 옵션 */}
            <div className={styles.options}>
              <label className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span className={styles.checkmark}></span>
                로그인 상태 유지
              </label>
              <a
                href="#"
                className={styles.forgotPassword}
                id="forgotPassword"
                onClick={handleForgotPassword}
              >
                비밀번호 찾기
              </a>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className={`${styles.submitBtn} ${isSubmitting ? styles.loading : ""}`}
              id="loginBtn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className={styles.loadingContent}>
                  <div className={styles.spinner}></div>
                  로그인 중...
                </div>
              ) : (
                <span>로그인</span>
              )}
            </button>

            {/* 서버 에러 메시지 */}
            {serverError && (
              <div className={styles.errorMsg} style={{ display: "block" }}>
                {serverError}
              </div>
            )}

            {/* 로그아웃 메시지 */}
            {logoutMessage && (
              <div className={styles.successMsg} style={{ display: "block" }}>
                {logoutMessage}
              </div>
            )}

            {/* 클라이언트 에러 메시지 */}
            {errors.submit && (
              <div className={styles.errorMsg} id="loginError">
                {errors.submit}
              </div>
            )}
          </form>

          {/* 소셜 로그인 */}
          <div className={styles.socialLogin}>
            <div className={styles.divider}>
              <span>또는</span>
            </div>

            <div className={styles.buttons}>
              <button
                className={`${styles.socialBtn} ${styles.google}`}
                id="googleLogin"
                type="button"
                onClick={handleGoogleLogin}
              >
                <i className="fab fa-google"></i>
                Google로 로그인
              </button>
              <button
                className={`${styles.socialBtn} ${styles.kakao}`}
                id="kakaoLogin"
                type="button"
                onClick={handleKakaoLogin}
              >
                <i className="fas fa-comment"></i>
                Kakao로 로그인
              </button>
            </div>
          </div>

          {/* 회원가입 링크 */}
          <div className={styles.signupSection}>
            <div className={styles.linkWrapper}>
              <p>
                계정이 없으신가요?{" "}
                <Link to="/signup" className={styles.linkText}>
                  회원가입하기
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
