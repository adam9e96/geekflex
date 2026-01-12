import React from "react";
import styles from "@styles/auth/LoginTextField.module.css";

/**
 * 로그인 폼 텍스트 입력 필드 컴포넌트
 * 아이디, 이메일 등 텍스트 입력에 사용
 */
const LoginTextField = React.forwardRef(
  (
    {
      id,
      name,
      label,
      labelIcon,
      type = "text",
      placeholder,
      value,
      onChange,
      onBlur,
      onKeyDown,
      error,
      required = false,
    },
    ref,
  ) => {
    return (
      <div className={styles.formGroup}>
        <label htmlFor={id} className={styles.formLabel}>
          {labelIcon && <i className={labelIcon}></i>}
          {label}
        </label>
        <input
          ref={ref}
          type={type}
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
        {error && (
          <div className={styles.formError} id={`${id}Error`}>
            {error}
          </div>
        )}
      </div>
    );
  },
);

LoginTextField.displayName = "LoginTextField";

export default LoginTextField;
