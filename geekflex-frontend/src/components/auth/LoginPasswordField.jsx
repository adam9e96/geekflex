import React, { forwardRef } from "react";
import styles from "@styles/auth/LoginPasswordField.module.css";

/**
 * 로그인 폼 비밀번호 입력 필드 컴포넌트 (표시/숨기기 토글 포함)
 */
const LoginPasswordField = forwardRef(({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onKeyDown,
  error,
  isVisible,
  onToggleVisibility,
  required = false,
}, ref) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.formLabel}>
        <i className="fas fa-lock"></i>
        {label}
      </label>
      <div className={styles.passwordInputContainer}>
        <input
          ref={ref}
          type={isVisible ? "text" : "password"}
          id={id}
          name={name}
          className={`${styles.formInput} ${error ? styles.error : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          required={required}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          id="passwordToggle"
          onClick={onToggleVisibility}
          aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
        >
          <i className={`fas ${isVisible ? "fa-eye-slash" : "fa-eye"}`}></i>
        </button>
      </div>
      {error && (
        <div className={styles.formError} id={`${id}Error`}>
          {error}
        </div>
      )}
    </div>
  );
});

LoginPasswordField.displayName = "LoginPasswordField";

export default LoginPasswordField;

