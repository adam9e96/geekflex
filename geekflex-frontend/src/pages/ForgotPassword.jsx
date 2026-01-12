import React from "react";
import { useForgotPassword } from "@hooks/auth/useForgotPassword";
import ForgotPasswordHeader from "@components/auth/forgotpassword/ForgotPasswordHeader";
import { ForgotPasswordForm } from "@components/auth/ForgotPasswordForm";
import styles from "@styles/auth/Login.module.css";

/**
 * 비밀번호 찾기 페이지 컴포넌트
 * 로그인 페이지에서 접근 가능한 별도 페이지
 */
const ForgotPassword = () => {
  const {
    formData,
    isSubmitting,
    errors,
    serverError,
    successMessage,
    usernameInputRef,
    handleInputChange,
    validateField,
    handleSubmit,
    handleKeyDown,
    handleBackToLogin,
  } = useForgotPassword();

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <ForgotPasswordHeader />

          <ForgotPasswordForm
            formData={formData}
            errors={errors}
            serverError={serverError}
            successMessage={successMessage}
            isSubmitting={isSubmitting}
            usernameInputRef={usernameInputRef}
            onInputChange={handleInputChange}
            onValidateField={validateField}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            onBackToLogin={handleBackToLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

