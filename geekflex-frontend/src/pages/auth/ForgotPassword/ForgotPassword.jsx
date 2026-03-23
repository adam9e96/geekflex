import React from "react";
import { useForgotPassword } from "@hooks/auth/useForgotPassword";
import ForgotPasswordHeader from "@components/auth/ForgotPasswordHeader/ForgotPasswordHeader";
import { ForgotPasswordForm } from "@components/auth/ForgotPasswordForm/ForgotPasswordForm";
import styles from "./ForgotPassword.module.css";

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
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
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
