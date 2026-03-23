import React from "react";
import styles from "./ForgotPasswordHeader.module.css";

/**
 * 비밀번호 찾기 페이지 헤더 컴포넌트
 */
const ForgotPasswordHeader = () => {
  return (
    <div className={styles.header}>
      <div className={styles.iconWrapper}>
        <i className="fas fa-key"></i>
      </div>
      <h1 className={styles.title}>비밀번호 찾기</h1>
      <p className={styles.subtitle}>가입 시 등록한 정보를 입력해주세요</p>
    </div>
  );
};

export default ForgotPasswordHeader;
