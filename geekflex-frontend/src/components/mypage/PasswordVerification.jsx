import React, { useState } from "react";

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
  React.useEffect(() => {
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
    <div className="pwd-verify">
      <div className="pwd-verify__card">
        <header className="pwd-verify__header">
          <h2 className="pwd-verify__title">
            <i className="fas fa-shield-alt" aria-hidden="true"></i>
            보안 확인
          </h2>
          <p className="pwd-verify__subtitle">{subtitleMessage}</p>
        </header>

        <form className="pwd-verify__form" onSubmit={handleSubmit}>
          <div className="pwd-verify__field">
            <label htmlFor="verify-password" className="pwd-verify__label">
              <i className="fas fa-lock" aria-hidden="true"></i>
              비밀번호
            </label>
            <input
              type="password"
              id="verify-password"
              className={`pwd-verify__input ${error ? "pwd-verify__input--error" : ""}`}
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
              <div id="pwd-error" className="pwd-verify__error" role="alert">
                {error}
              </div>
            )}
          </div>

          <div className="pwd-verify__actions">
            <button
              type="button"
              className="pwd-verify__btn pwd-verify__btn--cancel"
              onClick={onCancel}
              disabled={isVerifying}
            >
              <i className="fas fa-times" aria-hidden="true"></i>
              취소
            </button>
            <button
              type="submit"
              className="pwd-verify__btn pwd-verify__btn--submit"
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

export default PasswordVerification;
