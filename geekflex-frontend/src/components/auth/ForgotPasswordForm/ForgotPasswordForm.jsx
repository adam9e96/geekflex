import React from "react";
import PropTypes from "prop-types";
import LoginTextField from "../LoginTextField/LoginTextField";
import styles from "./ForgotPasswordForm.module.css";

/**
 * 비밀번호 찾기 폼 컴포넌트
 */
export const ForgotPasswordForm = ({
  formData,
  errors,
  serverError,
  successMessage,
  isSubmitting,
  usernameInputRef,
  onInputChange,
  onValidateField,
  onSubmit,
  onKeyDown,
  onBackToLogin,
}) => {
  return (
    <form className={styles.form} id="forgotPasswordForm" onSubmit={onSubmit}>
      <div className={styles.info}>
        <p className={styles.text}>
          가입 시 등록한 아이디와 이메일을 입력하시면
          <br />
          비밀번호 재설정 링크를 이메일로 보내드립니다.
        </p>
      </div>

      <LoginTextField
        ref={usernameInputRef}
        id="username"
        name="username"
        label="아이디"
        labelIcon="fas fa-user"
        placeholder="아이디를 입력하세요"
        value={formData.username}
        onChange={onInputChange}
        onBlur={(e) => onValidateField("username", e.target.value)}
        onKeyDown={onKeyDown}
        error={errors.username}
        required
      />

      <LoginTextField
        id="email"
        name="email"
        type="email"
        label="이메일"
        labelIcon="fas fa-envelope"
        placeholder="이메일을 입력하세요"
        value={formData.email}
        onChange={onInputChange}
        onBlur={(e) => onValidateField("email", e.target.value)}
        onKeyDown={onKeyDown}
        error={errors.email}
        required
      />

      <button
        type="submit"
        className={styles.submitBtn}
        id="forgotPasswordBtn"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            전송 중...
          </div>
        ) : (
          <span className={styles.btnText}>비밀번호 재설정 링크 전송</span>
        )}
      </button>

      {/* 성공 메시지 */}
      {successMessage && (
        <div className={styles.successMsg} style={{ display: "block" }}>
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      {/* 서버 에러 메시지 */}
      {serverError && (
        <div className={styles.errorMsg} style={{ display: "block" }}>
          {serverError}
        </div>
      )}

      {/* 로그인으로 돌아가기 */}
      <div className={styles.backToLogin}>
        <button type="button" className={styles.backButton} onClick={onBackToLogin}>
          <i className="fas fa-arrow-left"></i>
          로그인 페이지로 돌아가기
        </button>
      </div>
    </form>
  );
};

ForgotPasswordForm.propTypes = {
  formData: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  errors: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  serverError: PropTypes.string,
  successMessage: PropTypes.string,
  isSubmitting: PropTypes.bool.isRequired,
  usernameInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  onInputChange: PropTypes.func.isRequired,
  onValidateField: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onBackToLogin: PropTypes.func.isRequired,
};

export default ForgotPasswordForm;
