import React from "react";
import { Link } from "react-router-dom";
import { useLogin } from "@hooks/auth/useLogin";
import styles from "@styles/auth/Login.module.css";

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
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          {/* 헤더 */}
          <div className={styles.loginHeader}>
            <div className={styles.loginLogo}>
              <h1 className={styles.loginLogoText}>GeekFlex</h1>
              <p className={styles.loginSubtitle}>작품 리뷰 플랫폼</p>
            </div>
          </div>

          {/* 로그인 폼 */}
          <form className={styles.loginForm} id="loginForm" onSubmit={handleSubmit}>
            {/* 아이디/이메일 입력 */}
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>
                <i className="fas fa-user"></i>
                아이디 혹은 이메일
              </label>
              <input
                ref={usernameInputRef}
                type="text"
                id="username"
                name="username"
                className={`${styles.formInput} ${errors.username ? styles.error : ""}`}
                placeholder="아이디 또는 이메일을 입력하세요"
                value={formData.username}
                onChange={handleInputChange}
                onBlur={(e) => validateField("username", e.target.value)}
                onKeyDown={handleKeyDown}
                required
              />
              {errors.username && (
                <div className={styles.formError} id="usernameError">
                  {errors.username}
                </div>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                <i className="fas fa-lock"></i>
                비밀번호
              </label>
              <div className={styles.passwordInputContainer}>
                <input
                  ref={passwordInputRef}
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`${styles.formInput} ${errors.password ? styles.error : ""}`}
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
                <div className={styles.formError} id="passwordError">
                  {errors.password}
                </div>
              )}
            </div>

            {/* 폼 옵션 */}
            <div className={styles.formOptions}>
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
              <a href="#" className={styles.forgotPassword} id="forgotPassword" onClick={handleForgotPassword}>
                비밀번호 찾기
              </a>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className={`${styles.loginBtn} ${isSubmitting ? styles.loading : ""}`}
              id="loginBtn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className={styles.btnLoading}>
                  <div className={styles.spinner}></div>
                  로그인 중...
                </div>
              ) : (
                <span className={styles.btnText}>로그인</span>
              )}
            </button>

            {/* 서버 에러 메시지 */}
            {serverError && (
              <div className={styles.formError} style={{ display: "block" }}>
                {serverError}
              </div>
            )}

            {/* 로그아웃 메시지 */}
            {logoutMessage && (
              <div className={styles.formSuccess} style={{ display: "block" }}>
                {logoutMessage}
              </div>
            )}

            {/* 클라이언트 에러 메시지 */}
            {errors.submit && (
              <div className={styles.formError} id="loginError">
                {errors.submit}
              </div>
            )}
          </form>

          {/* 소셜 로그인 */}
          <div className={styles.socialLogin}>
            <div className={styles.divider}>
              <span>또는</span>
            </div>

            <div className={styles.socialButtons}>
              <button
                className={`${styles.socialBtn} ${styles.googleBtn}`}
                id="googleLogin"
                type="button"
                onClick={handleGoogleLogin}
              >
                <i className="fab fa-google"></i>
                Google로 로그인
              </button>
              <button
                className={`${styles.socialBtn} ${styles.kakaoBtn}`}
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
            <div className={styles.signupLink}>
              <p>
                계정이 없으신가요?{" "}
                <Link to="/signup" className={styles.signupLinkText}>
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
