import React from "react";
import styles from "./Signup.module.css";
import { useSignup } from "@hooks/auth/useSignup";
import LoginPasswordField from "@components/auth/LoginPasswordField/LoginPasswordField";
import ProfileImageUpload from "@components/auth/ProfileImageUpload/ProfileImageUpload";
import LoginSection from "@components/auth/LoginSection/LoginSection";

/**
 * GeekFlex 회원가입 페이지
 */
const Signup = () => {
  const {
    formData,
    isPasswordVisible,
    isConfirmPasswordVisible,
    isSubmitting,
    previewImage,
    errors,
    bioCharCount,
    fileInputRef,
    previewImageRef,
    handleInputChange,
    validateField,
    handleTermsChange,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleRemoveImage,
    handleSubmit,
    userIdCheckStatus,
    checkUserIdAvailability,
    verificationState,
    verificationCode,
    timeLeft,
    handleSendVerificationCode,
    handleVerifyEmailCode,

    setVerificationCode,
    handleDateChange,
  } = useSignup();

  const handleCheckDuplicate = () => {
    if (checkUserIdAvailability && formData.userId) {
      checkUserIdAvailability(formData.userId);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* 회원가입 헤더 */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <h1 className={styles.text}>GeekFlex</h1>
              <p className={styles.subtitle}>영화 리뷰 플랫폼</p>
            </div>
          </div>

          {/* 회원가입 폼 */}
          <form className={styles.form} onSubmit={handleSubmit} encType="multipart/form-data">
            {/* 기본 정보 섹션 */}
            <div className={styles.section}>
              <h3 className={styles.title}>
                <i className="fas fa-user"></i> 기본 정보
              </h3>

              {/* 아이디 */}
              <div className={styles.group}>
                <label htmlFor="userId" className={styles.label}>
                  <i className="fas fa-id-card"></i> 아이디{" "}
                  <span className={styles.requiredMark}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    className={`${styles.input} ${errors.userId ? styles.error : ""} ${styles.withCheckButton}`}
                    placeholder="영문, 숫자 4-50자"
                    value={formData.userId}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField("userId", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.checkBtn}
                    onClick={handleCheckDuplicate}
                    disabled={!formData.userId || userIdCheckStatus?.isChecking}
                  >
                    {userIdCheckStatus?.isChecking ? (
                      <span className={styles.checkingText}>
                        <i className="fas fa-spinner fa-spin"></i> 검사 중...
                      </span>
                    ) : (
                      <span className={styles.checkText}>중복검사</span>
                    )}
                  </button>
                </div>
                {userIdCheckStatus?.isChecked && (
                  <div
                    className={`${styles.checkResult} ${
                      userIdCheckStatus.available ? styles.available : styles.unavailable
                    }`}
                  >
                    <i
                      className={`fas ${
                        userIdCheckStatus.available ? "fa-check-circle" : "fa-times-circle"
                      }`}
                    ></i>
                    {userIdCheckStatus.message}
                  </div>
                )}
                {errors.userId && <div className={styles.errorMsg}>{errors.userId}</div>}
              </div>

              {/* 닉네임 */}
              <div className={styles.group}>
                <label htmlFor="nickname" className={styles.label}>
                  <i className="fas fa-user-circle"></i> 닉네임{" "}
                  <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  className={`${styles.input} ${errors.nickname ? styles.error : ""}`}
                  placeholder="표시될 이름"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField("nickname", e.target.value)}
                  required
                />
                {errors.nickname && <div className={styles.errorMsg}>{errors.nickname}</div>}
                {!errors.nickname && formData.nickname && (
                  <div className={`${styles.checkResult} ${styles.available}`}>
                    <i className="fas fa-check-circle"></i>
                    사용 가능한 닉네임입니다.
                  </div>
                )}
              </div>

              {/* 이메일 */}
              <div className={styles.group}>
                <label htmlFor="userEmail" className={styles.label}>
                  <i className="fas fa-envelope"></i> 이메일{" "}
                  <span className={styles.requiredMark}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="userEmail"
                    name="userEmail"
                    className={`${styles.input} ${errors.userEmail ? styles.error : ""} ${styles.withCheckButton}`}
                    placeholder="이메일 주소"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField("userEmail", e.target.value)}
                    required
                    readOnly={
                      verificationState.status === "verified" ||
                      verificationState.status === "sending" ||
                      verificationState.status === "sent"
                    }
                    disabled={verificationState.status === "verified"}
                  />
                  <button
                    type="button"
                    className={styles.checkBtn}
                    onClick={handleSendVerificationCode}
                    disabled={
                      !formData.userEmail ||
                      verificationState.status === "sending" ||
                      verificationState.status === "verified" ||
                      (verificationState.status === "sent" && timeLeft > 0)
                    }
                  >
                    {verificationState.status === "sending" ? (
                      <span className={styles.checkingText}>
                        <i className="fas fa-spinner fa-spin"></i> 전송 중...
                      </span>
                    ) : verificationState.status === "verified" ? (
                      <span className={styles.checkText}>인증됨</span>
                    ) : verificationState.status === "sent" && timeLeft > 0 ? (
                      <span className={styles.checkText}>재전송</span>
                    ) : (
                      <span className={styles.checkText}>인증번호 전송</span>
                    )}
                  </button>
                </div>
                {errors.userEmail && <div className={styles.errorMsg}>{errors.userEmail}</div>}

                {/* 인증 번호 입력 섹션 */}
                {verificationState.status === "sent" && (
                  <div className={styles.verificationSection}>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        id="verificationCode"
                        className={`${styles.input} ${errors.verificationCode ? styles.error : ""} ${styles.withCheckButton}`}
                        placeholder="인증 번호 6자리"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                      <button
                        type="button"
                        className={styles.verifyBtn}
                        onClick={handleVerifyEmailCode}
                      >
                        인증 확인
                      </button>
                    </div>
                    <div className={styles.timer}>
                      <span className="timer-text">
                        남은 시간: {Math.floor(timeLeft / 60)}:
                        {String(timeLeft % 60).padStart(2, "0")}
                      </span>
                    </div>
                    {errors.verificationCode && (
                      <div className={styles.errorMsg}>{errors.verificationCode}</div>
                    )}
                  </div>
                )}

                {verificationState.status === "verified" && (
                  <div className={styles.verifiedMessage}>
                    <i className="fas fa-check-circle"></i> 이메일 인증이 완료되었습니다.
                  </div>
                )}
              </div>

              {/* 생년월일 */}
              <div className={styles.group}>
                <label htmlFor="birthDate" className={styles.label}>
                  <i className="fas fa-birthday-cake"></i> 생년월일{" "}
                  <span className={styles.requiredMark}>*</span>
                </label>
                <div className={styles.customDatepickerWrapper}>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    onBlur={(e) => validateField("birthDate", e.target.value)}
                    className={`${styles.input} ${styles.dateInput} ${errors.birthDate ? styles.error : ""}`}
                    max={new Date().toISOString().split("T")[0]}
                    required
                    autoComplete="bday"
                  />
                  <i className={`fas fa-calendar-alt ${styles.calendarIcon}`}></i>
                </div>
                <div className={styles.hint}>만 14세 이상만 가입 가능합니다.</div>
                {errors.birthDate && <div className={styles.errorMsg}>{errors.birthDate}</div>}
              </div>

              {/* 비밀번호 */}
              <LoginPasswordField
                id="password"
                name="password"
                label={
                  <>
                    비밀번호 <span className={styles.requiredMark}>*</span>
                  </>
                }
                placeholder="8자 이상, 영문/숫자/특수문자 포함"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={(e) => validateField("password", e.target.value)}
                error={errors.password}
                isVisible={isPasswordVisible}
                onToggleVisibility={togglePasswordVisibility}
                required
              />
              {!errors.password && formData.password && (
                <div
                  className={`${styles.checkResult} ${styles.available}`}
                  style={{ marginTop: "-1rem", marginBottom: "1.5rem" }}
                >
                  <i className="fas fa-check-circle"></i>
                  사용 가능한 비밀번호입니다.
                </div>
              )}

              {/* 비밀번호 확인 */}
              <LoginPasswordField
                id="confirmPassword"
                name="confirmPassword"
                label={
                  <>
                    비밀번호 확인 <span className={styles.requiredMark}>*</span>
                  </>
                }
                placeholder="비밀번호를 다시 입력"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={(e) => validateField("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
                isVisible={isConfirmPasswordVisible}
                onToggleVisibility={toggleConfirmPasswordVisibility}
                required
              />
              {!errors.confirmPassword && formData.confirmPassword && (
                <div
                  className={`${styles.checkResult} ${styles.available}`}
                  style={{ marginTop: "-1rem" }}
                >
                  <i className="fas fa-check-circle"></i>
                  비밀번호가 일치합니다.
                </div>
              )}
            </div>

            {/* 프로필 정보 */}
            <div className={`${styles.section} mt-4`}>
              <h3 className={styles.title}>
                <i className="fas fa-id-badge"></i> 프로필 정보
              </h3>

              <ProfileImageUpload
                fileInputRef={fileInputRef}
                previewImage={previewImage}
                previewImageRef={previewImageRef}
                error={errors.profileImage}
                onChange={handleInputChange}
                onRemove={handleRemoveImage}
              />

              {/* 자기소개 */}
              <div className={styles.group}>
                <label htmlFor="bio" className={styles.label}>
                  <i className="fas fa-quote-left"></i> 자기소개{" "}
                  <span className={styles.optionalMark}>(선택)</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className={`${styles.textarea} ${errors.bio ? styles.error : ""}`}
                  placeholder="자신을 소개해주세요 (최대 300자)"
                  maxLength="300"
                  value={formData.bio}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField("bio", e.target.value)}
                />
                <div className={styles.charCounter}>
                  <span
                    style={{
                      color: bioCharCount > 300 ? "var(--color-error)" : "var(--text-muted)",
                    }}
                  >
                    {bioCharCount}
                  </span>
                  /300
                </div>
                {errors.bio && <div className={styles.errorMsg}>{errors.bio}</div>}
              </div>
            </div>

            {/* 약관 */}
            <div className={`${styles.section} mt-4`}>
              <h3 className={styles.title}>
                <i className="fas fa-shield-alt"></i> 권한 및 약관
              </h3>

              {/* 이용약관 */}
              {/* 이용약관 */}
              <div className={styles.group}>
                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="termsAgreement"
                    name="termsAgreement"
                    className={styles.chkInput}
                    checked={formData.termsAgreement}
                    onChange={handleTermsChange}
                  />
                  <label htmlFor="termsAgreement" className={styles.checkboxContainer}>
                    <span className={styles.checkmark} aria-hidden="true"></span>
                    <span className={styles.text}>
                      <a href="#" className={styles.link}>
                        이용약관
                      </a>{" "}
                      및
                      <a href="#" className={styles.link}>
                        개인정보처리방침
                      </a>
                      에 동의합니다 <span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                </div>
                {errors.termsAgreement && (
                  <div className={styles.errorMsg} style={{ marginTop: "0.5rem" }}>
                    {errors.termsAgreement}
                  </div>
                )}
              </div>

              {/* 선택적 약관 */}
              <div className={`${styles.group} ${styles.checkboxRow}`}>
                <input
                  type="checkbox"
                  id="marketingAgreement"
                  name="marketingAgreement"
                  className={styles.chkInput}
                  checked={formData.marketingAgreement}
                  onChange={handleInputChange}
                />
                <label htmlFor="marketingAgreement" className={styles.checkboxContainer}>
                  <span className={styles.checkmark} aria-hidden="true"></span>
                  <span className={styles.text}>마케팅 정보 수신에 동의합니다 (선택)</span>
                </label>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className={`${styles.submitBtn} ${isSubmitting ? styles.loading : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className={styles.loadingContent}>
                  <div className={styles.spinner}></div>
                  가입 중...
                </div>
              ) : (
                <span className={styles.btnText}>회원가입</span>
              )}
            </button>

            {errors.submit && <div className={styles.errorMsg}>{errors.submit}</div>}
          </form>

          <LoginSection />
        </div>
      </div>
    </div>
  );
};

export default Signup;





