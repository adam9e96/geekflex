import React from "react";
import PropTypes from "prop-types";
import styles from "./EditProfileForm.module.css";
import ProfileImageUpload from "@components/auth/ProfileImageUpload/ProfileImageUpload";
import { useEditProfile } from "@hooks/useEditProfile";

/**
 * 프로필 수정 폼 컴포넌트
 * @param {Object} userData - 현재 사용자 데이터
 * @param {Function} onSave - 저장 핸들러
 * @param {Function} onCancel - 취소 핸들러
 * @param {boolean} isSubmitting - 제출 중 여부
 */
const EditProfileForm = ({ userData, onSave, onCancel, isSubmitting }) => {
  const {
    formData,
    previewImage,
    errors,
    showPasswordChange,
    fileInputRef,
    previewImageRef,
    isOAuthUser,
    handleInputChange,
    handleRemoveImage,
    handleSubmit,
    togglePasswordChange,
  } = useEditProfile(userData, onSave);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-edit"></i> 프로필 수정
        </h3>

        <ProfileImageUpload
          fileInputRef={fileInputRef}
          previewImage={previewImage}
          previewImageRef={previewImageRef}
          error={errors.profileImage}
          onChange={handleInputChange}
          onRemove={handleRemoveImage}
        />

        <div className={styles.formGroup}>
          <label htmlFor="edit-nickname" className={styles.formLabel}>
            <i className="fas fa-user-circle"></i> 닉네임{" "}
            <span className={styles.requiredMark}>*</span>
          </label>
          <input
            type="text"
            id="edit-nickname"
            name="nickname"
            className={`${styles.formInput} ${errors.nickname ? styles.error : ""}`}
            placeholder="닉네임을 입력하세요"
            value={formData.nickname}
            onChange={handleInputChange}
            maxLength={50}
          />
          {errors.nickname && <div className={styles.formError}>{errors.nickname}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-userEmail" className={styles.formLabel}>
            <i className="fas fa-envelope"></i> 이메일{" "}
            <span className={styles.requiredMark}>*</span>
          </label>
          <input
            type="email"
            id="edit-userEmail"
            name="userEmail"
            className={`${styles.formInput} ${errors.userEmail ? styles.error : ""}`}
            placeholder="이메일을 입력하세요"
            value={formData.userEmail}
            onChange={handleInputChange}
          />
          {errors.userEmail && <div className={styles.formError}>{errors.userEmail}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-bio" className={styles.formLabel}>
            <i className="fas fa-comment"></i> 자기소개{" "}
            <span className={styles.optionalMark}>(선택)</span>
          </label>
          <textarea
            id="edit-bio"
            name="bio"
            className={`${styles.formInput} ${errors.bio ? styles.error : ""}`}
            placeholder="자기소개를 입력하세요 (최대 200자)"
            value={formData.bio}
            onChange={handleInputChange}
            maxLength={200}
            rows={4}
          />
          <div className={styles.charCount}>{formData.bio.length} / 200</div>
          {errors.bio && <div className={styles.formError}>{errors.bio}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <i className="fas fa-bell"></i> 마케팅 정보 수신 동의
          </label>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="edit-marketingAgreement"
              name="marketingAgreement"
              checked={formData.marketingAgreement}
              onChange={handleInputChange}
            />
            <label htmlFor="edit-marketingAgreement" className={styles.checkboxLabel}>
              마케팅 정보 수신에 동의합니다 (선택)
            </label>
          </div>
        </div>

        {!isOAuthUser && (
          <div className={styles.formGroup}>
            <div className={styles.passwordChangeHeader}>
              <label className={styles.formLabel}>
                <i className="fas fa-lock"></i> 비밀번호 변경
              </label>
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={togglePasswordChange}
              >
                {showPasswordChange ? "취소" : "변경하기"}
              </button>
            </div>
            {showPasswordChange && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-currentPassword" className={styles.formLabel}>
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    id="edit-currentPassword"
                    name="currentPassword"
                    className={`${styles.formInput} ${errors.currentPassword ? styles.error : ""}`}
                    placeholder="현재 비밀번호를 입력하세요"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                  {errors.currentPassword && (
                    <div className={styles.formError}>{errors.currentPassword}</div>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-newPassword" className={styles.formLabel}>
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    id="edit-newPassword"
                    name="newPassword"
                    className={`${styles.formInput} ${errors.newPassword ? styles.error : ""}`}
                    placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                  {errors.newPassword && (
                    <div className={styles.formError}>{errors.newPassword}</div>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-confirmPassword" className={styles.formLabel}>
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="edit-confirmPassword"
                    name="confirmPassword"
                    className={`${styles.formInput} ${errors.confirmPassword ? styles.error : ""}`}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {errors.confirmPassword && (
                    <div className={styles.formError}>{errors.confirmPassword}</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {isOAuthUser && (
          <div className={styles.formGroup}>
            <div className={styles.infoMessage}>
              <i className="fas fa-info-circle"></i> 소셜 로그인 사용자는 비밀번호를 변경할 수
              없습니다.
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <i className="fas fa-times"></i> 취소
          </button>
          <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> 저장 중...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i> 저장
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

EditProfileForm.propTypes = {
  userData: PropTypes.shape({
    nickname: PropTypes.string,
    userEmail: PropTypes.string,
    bio: PropTypes.string,
    marketingAgreement: PropTypes.bool,
    oauthProvider: PropTypes.string,
    profileImage: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default EditProfileForm;
