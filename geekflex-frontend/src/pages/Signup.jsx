import React from "react";
import "@styles/auth/signup.css";
import { useSignup } from "@hooks/auth/useSignup";
import LoginPasswordField from "@components/auth/LoginPasswordField";
import ProfileImageUpload from "@components/auth/ProfileImageUpload";
import LoginSection from "@components/auth/LoginSection";

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
  } = useSignup();

  const handleCheckDuplicate = () => {
    if (checkUserIdAvailability && formData.userId) {
      checkUserIdAvailability(formData.userId);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container my-5">
        <div className="signup-card">
          {/* 회원가입 헤더 */}
          <div className="signup-header text-center mb-4">
            <div className="signup-logo mb-3">
              <h1 className="signup-logo-text">GeekFlex</h1>
              <p className="signup-subtitle text-gray-500">영화 리뷰 플랫폼</p>
            </div>
            <p className="signup-description">영화 애호가들을 위한 완벽한 플랫폼에 가입하세요</p>
          </div>

          {/* 회원가입 폼 */}
          <form className="signup-form" onSubmit={handleSubmit} encType="multipart/form-data">
            {/* 기본 정보 섹션 */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-user"></i> 기본 정보
              </h3>

              {/* 아이디 */}
              <div className="form-group">
                <label htmlFor="userId" className="form-label">
                  <i className="fas fa-id-card"></i> 아이디 <span className="required-mark">*</span>
                </label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    className={`form-input ${errors.userId ? "error" : ""} with-check-button`}
                    placeholder="영문, 숫자 4-50자"
                    value={formData.userId}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField("userId", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="duplicate-check-btn"
                    onClick={handleCheckDuplicate}
                    disabled={!formData.userId || userIdCheckStatus?.isChecking}
                  >
                    {userIdCheckStatus?.isChecking ? (
                      <span className="checking-text">
                        <i className="fas fa-spinner fa-spin"></i> 검사 중...
                      </span>
                    ) : (
                      <span className="check-text">중복검사</span>
                    )}
                  </button>
                </div>
                {userIdCheckStatus?.isChecked && (
                  <div
                    className={`duplicate-check-result ${
                      userIdCheckStatus.available ? "available" : "unavailable"
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
                {errors.userId && <div className="form-error">{errors.userId}</div>}
              </div>

              {/* 닉네임 */}
              <div className="form-group">
                <label htmlFor="nickname" className="form-label">
                  <i className="fas fa-user-circle"></i> 닉네임 <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  className={`form-input ${errors.nickname ? "error" : ""}`}
                  placeholder="표시될 이름"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField("nickname", e.target.value)}
                  required
                />
                {errors.nickname && <div className="form-error">{errors.nickname}</div>}
              </div>

              {/* 이메일 */}
              <div className="form-group">
                <label htmlFor="userEmail" className="form-label">
                  <i className="fas fa-envelope"></i> 이메일 <span className="required-mark">*</span>
                </label>
                <input
                  type="email"
                  id="userEmail"
                  name="userEmail"
                  className={`form-input ${errors.userEmail ? "error" : ""}`}
                  placeholder="이메일 주소"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField("userEmail", e.target.value)}
                  required
                />
                {errors.userEmail && <div className="form-error">{errors.userEmail}</div>}
              </div>

              {/* 생년월일 */}
              <div className="form-group">
                <label htmlFor="birthDate" className="form-label">
                  <i className="fas fa-birthday-cake"></i> 생년월일 <span className="required-mark">*</span>
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  className={`form-input date-input ${errors.birthDate ? "error" : ""}`}
                  placeholder="생년월일을 선택하세요"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField("birthDate", e.target.value)}
                  required
                />
                <div className="form-hint">만 14세 이상만 가입 가능합니다.</div>
                {errors.birthDate && <div className="form-error">{errors.birthDate}</div>}
              </div>

              {/* 비밀번호 */}
              <LoginPasswordField
                id="password"
                name="password"
                label={
                  <>
                    비밀번호 <span className="required-mark">*</span>
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

              {/* 비밀번호 확인 */}
              <LoginPasswordField
                id="confirmPassword"
                name="confirmPassword"
                label={
                  <>
                    비밀번호 확인 <span className="required-mark">*</span>
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
            </div>

            {/* 프로필 정보 */}
            <div className="form-section mt-4">
              <h3 className="section-title">
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
              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  <i className="fas fa-quote-left"></i> 자기소개 <span className="optional-mark">(선택)</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className={`form-textarea ${errors.bio ? "error" : ""}`}
                  placeholder="자신을 소개해주세요 (최대 300자)"
                  maxLength="300"
                  value={formData.bio}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField("bio", e.target.value)}
                />
                <div className="char-counter">
                  <span style={{ color: bioCharCount > 300 ? "var(--color-error)" : "var(--text-muted)" }}>
                    {bioCharCount}
                  </span>
                  /300
                </div>
                {errors.bio && <div className="form-error">{errors.bio}</div>}
              </div>
            </div>

            {/* 약관 */}
            <div className="form-section mt-4">
              <h3 className="section-title">
                <i className="fas fa-shield-alt"></i> 권한 및 약관
              </h3>

              {/* 이용약관 */}
              <div className="form-group checkbox-row">
                <input
                  type="checkbox"
                  id="termsAgreement"
                  name="termsAgreement"
                  className="chk-input"
                  checked={formData.termsAgreement}
                  onChange={handleTermsChange}
                />
                <label htmlFor="termsAgreement" className="checkbox-container">
                  <span className="checkmark" aria-hidden="true"></span>
                  <span className="checkbox-text">
                    <a href="#" className="terms-link">
                      이용약관
                    </a>{" "}
                    및
                    <a href="#" className="terms-link">
                      개인정보처리방침
                    </a>
                    에 동의합니다 <span className="required-mark">*</span>
                  </span>
                </label>
                {errors.termsAgreement && <div className="form-error">{errors.termsAgreement}</div>}
              </div>

              {/* 선택적 약관 */}
              <div className="form-group checkbox-row">
                <input
                  type="checkbox"
                  id="marketingAgreement"
                  name="marketingAgreement"
                  className="chk-input"
                  checked={formData.marketingAgreement}
                  onChange={handleInputChange}
                />
                <label htmlFor="marketingAgreement" className="checkbox-container">
                  <span className="checkmark" aria-hidden="true"></span>
                  <span className="checkbox-text">마케팅 정보 수신에 동의합니다 (선택)</span>
                </label>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className={`signup-btn w-100 mt-3 ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="btn-loading">
                  <div className="spinner"></div>
                  가입 중...
                </div>
              ) : (
                <span className="btn-text">회원가입</span>
              )}
            </button>

            {errors.submit && (
              <div className="form-error text-danger text-center mt-2">{errors.submit}</div>
            )}
          </form>

          <LoginSection />
        </div>
      </div>
    </div>
  );
};

export default Signup;
