import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./PasswordVerification.module.css";

/**
 * 비밀번호 확인 컴포넌트
 * 마이페이지 접근 또는 회원정보 수정 전 비밀번호를 확인합니다
 * @param {Object} userData - 사용자 데이터
 * @param {Function} onVerify - 비밀번호 확인 성공 핸들러
 * @param {Function} onCancel - 취소 핸들러
 * @param {Function} verifyPassword - 비밀번호 확인 API 호출 함수
 * @param {string} purpose - 비밀번호 확인 목적 ("access" 또는 "edit", 기본값: "access")
 */
const PasswordVerification = ({
  userData,
  onVerify,
  onCancel,
  verifyPassword,
  purpose = "access",
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // 소셜 로그인 사용자 여부 확인
  const isOAuthUser = userData?.oauthProvider != null;

  // 소셜 로그인 사용자는 비밀번호 확인 없이 바로 통과
  useEffect(() => {
    if (isOAuthUser) {
      onVerify();
    }
  }, [isOAuthUser, onVerify]);

  // 목적에 따른 메시지 설정
  const subtitleMessage =
    purpose === "edit"
      ? "회원정보를 수정하기 전에 비밀번호를 확인해주세요."
      : "마이페이지에 접근하기 위해 비밀번호를 확인해주세요.";

  // 비밀번호 확인 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || password.trim().length === 0) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyPassword(password);
      onVerify();
    } catch (err) {
      setError(err.message || "비밀번호가 일치하지 않습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 소셜 로그인 사용자는 이 컴포넌트를 렌더링하지 않음
  if (isOAuthUser) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <i className="fas fa-shield-alt" aria-hidden="true"></i>
            보안 확인
          </h2>
          <p className={styles.subtitle}>{subtitleMessage}</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="verify-password" className={styles.label}>
              <i className="fas fa-lock" aria-hidden="true"></i>
              비밀번호
            </label>
            <input
              type="password"
              id="verify-password"
              className={`${styles.input} ${error ? styles.error : ""}`}
              placeholder="현재 비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? "pwd-error" : undefined}
            />
            {error && (
              <div id="pwd-error" className={styles.errorMsg} role="alert">
                {error}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.cancelBtn}`}
              onClick={onCancel}
              disabled={isVerifying}
            >
              <i className="fas fa-times" aria-hidden="true"></i>
              취소
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.submitBtn}`}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                  확인 중...
                </>
              ) : (
                <>
                  <i className="fas fa-check" aria-hidden="true"></i>
                  확인
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PasswordVerification.propTypes = {
  userData: PropTypes.shape({
    oauthProvider: PropTypes.string,
  }),
  onVerify: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  verifyPassword: PropTypes.func.isRequired,
  purpose: PropTypes.string,
};

export default PasswordVerification;
