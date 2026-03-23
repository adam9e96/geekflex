import React from "react";
import PropTypes from "prop-types";
import styles from "./LoginTextField.module.css";

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
      <div className={styles.group}>
        <label htmlFor={id} className={styles.label}>
          {labelIcon && <i className={labelIcon}></i>}
          {label}
        </label>
        <input
          ref={ref}
          type={type}
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
        {error && (
          <div className={styles.errorMsg} id={`${id}Error`}>
            {error}
          </div>
        )}
      </div>
    );
  },
);
LoginTextField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  labelIcon: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
};
LoginTextField.displayName = "LoginTextField";

export default LoginTextField;
