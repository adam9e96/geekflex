import React from "react";
import { Link } from "react-router-dom";
import styles from "./LoginSection.module.css";

/**
 * 로그인 링크 섹션 컴포넌트
 */
const LoginSection = () => {
  return (
    <div className={styles.loginSection}>
      <p className={styles.text}>
        이미 계정이 있으신가요?
        <Link to="/login" className={styles.link}>
          로그인
        </Link>
      </p>
    </div>
  );
};

export default LoginSection;
