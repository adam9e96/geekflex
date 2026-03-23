import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import styles from "./LoginPasswordField.module.css";

/**
 * 로그인 폼 비밀번호 입력 필드 컴포넌트 (표시/숨기기 토글 포함)
 */
const LoginPasswordField = forwardRef(
  (
    {
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
    },
    ref,
  ) => {
    return (
      <div className={styles.group}>
        <label htmlFor={id} className={styles.label}>
          <i className="fas fa-lock"></i>
          {label}
        </label>
        <div className={styles.passwordInputContainer}>
          <input
            ref={ref}
            type={isVisible ? "text" : "password"}
            id={id}
            name={name}
            className={`${styles.input} ${error ? styles.error : ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            required={required}
          />
          <button
            type="button"
            className={styles.toggle}
            id="passwordToggle"
            onClick={onToggleVisibility}
            aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            <i className={`fas ${isVisible ? "fa-eye-slash" : "fa-eye"}`}></i>
          </button>
        </div>
        {error && (
          <div className={styles.errorMsg} id={`${id}Error`}>
            {error}
          </div>
        )}
      </div>
    );
  },
);
LoginPasswordField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  error: PropTypes.string,
  isVisible: PropTypes.bool,
  onToggleVisibility: PropTypes.func,
  required: PropTypes.bool,
};
LoginPasswordField.displayName = "LoginPasswordField";

export default LoginPasswordField;
