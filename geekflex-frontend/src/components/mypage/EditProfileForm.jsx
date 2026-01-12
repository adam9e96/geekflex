import React, { useState, useRef, useEffect } from "react";
import ProfileImageUpload from "@components/auth/ProfileImageUpload";
import { getProfileImageUrl } from "@utils/imageUtils";

/**
 * 프로필 수정 폼 컴포넌트
 * @param {Object} userData - 현재 사용자 데이터
 * @param {Function} onSave - 저장 핸들러
 * @param {Function} onCancel - 취소 핸들러
 * @param {boolean} isSubmitting - 제출 중 여부
 */
const EditProfileForm = ({ userData, onSave, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    nickname: userData?.nickname || "",
    userEmail: userData?.userEmail || "",
    bio: userData?.bio || "",
    marketingAgreement: userData?.marketingAgreement || false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const fileInputRef = useRef(null);
  const previewImageRef = useRef(null);
  
  // 소셜 로그인 사용자 여부 확인
  const isOAuthUser = userData?.oauthProvider != null;

  // userData가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (userData) {
      setFormData({
        nickname: userData.nickname || "",
        userEmail: userData.userEmail || "",
        bio: userData.bio || "",
        marketingAgreement: userData.marketingAgreement || false,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // 기존 프로필 이미지 미리보기 설정
      if (userData.profileImage) {
        const imageUrl = getProfileImageUrl(userData.profileImage);
        setPreviewImage(imageUrl);
      } else {
        setPreviewImage(null);
      }
    }
  }, [userData]);

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      if (file) {
        // 파일 크기 검사 (5MB 제한)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          setErrors((prev) => ({
            ...prev,
            profileImage: "파일 크기는 5MB 이하여야 합니다.",
          }));
          return;
        }

        // 파일 타입 검사
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
          setErrors((prev) => ({
            ...prev,
            profileImage: "jpg, jpeg, png, webp 형식의 이미지 파일만 업로드 가능합니다.",
          }));
          return;
        }

        // 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target.result);
        };
        reader.onerror = () => {
          setErrors((prev) => ({
            ...prev,
            profileImage: "파일을 읽는 중 오류가 발생했습니다.",
          }));
        };
        reader.readAsDataURL(file);

        setFormData((prev) => ({
          ...prev,
          profileImage: file,
        }));

        // 에러 초기화
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.profileImage;
          return newErrors;
        });
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));

      // 에러 초기화
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // 에러 초기화
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
    }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.profileImage;
      return newErrors;
    });
  };

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors = {};

    // 닉네임 검증
    if (!formData.nickname || formData.nickname.trim().length === 0) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    } else if (formData.nickname.trim().length > 50) {
      newErrors.nickname = "닉네임은 50자 이하여야 합니다.";
    }

    // 이메일 검증
    if (!formData.userEmail || formData.userEmail.trim().length === 0) {
      newErrors.userEmail = "이메일을 입력해주세요.";
    } else if (!validateEmail(formData.userEmail.trim())) {
      newErrors.userEmail = "올바른 이메일 형식이 아닙니다.";
    }

    // 자기소개 검증
    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = "자기소개는 200자 이하여야 합니다.";
    }

    // 비밀번호 변경 검증 (소셜 로그인 사용자 제외)
    if (!isOAuthUser && showPasswordChange) {
      if (formData.newPassword && formData.newPassword.trim().length > 0) {
        if (!formData.currentPassword || formData.currentPassword.trim().length === 0) {
          newErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
        }
        if (formData.newPassword.length < 8) {
          newErrors.newPassword = "비밀번호는 8자 이상이어야 합니다.";
        }
        if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = "새 비밀번호가 일치하지 않습니다.";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 저장 핸들러 호출
    const updateData = {
      nickname: formData.nickname.trim(),
      userEmail: formData.userEmail.trim(),
      bio: formData.bio?.trim() || "",
      marketingAgreement: formData.marketingAgreement,
      profileImage: formData.profileImage,
    };

    // 비밀번호 변경이 있는 경우에만 추가
    if (!isOAuthUser && formData.newPassword && formData.newPassword.trim().length > 0) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword.trim();
    }

    onSave(updateData);
  };

  return (
    <form className="edit-profile-form" onSubmit={handleSubmit}>
      <div className="edit-profile-section">
        <h3 className="section-title">
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

        <div className="form-group">
          <label htmlFor="edit-nickname" className="form-label">
            <i className="fas fa-user-circle"></i> 닉네임 <span className="required-mark">*</span>
          </label>
          <input
            type="text"
            id="edit-nickname"
            name="nickname"
            className={`form-input ${errors.nickname ? "error" : ""}`}
            placeholder="닉네임을 입력하세요"
            value={formData.nickname}
            onChange={handleInputChange}
            maxLength={50}
          />
          {errors.nickname && <div className="form-error">{errors.nickname}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="edit-userEmail" className="form-label">
            <i className="fas fa-envelope"></i> 이메일 <span className="required-mark">*</span>
          </label>
          <input
            type="email"
            id="edit-userEmail"
            name="userEmail"
            className={`form-input ${errors.userEmail ? "error" : ""}`}
            placeholder="이메일을 입력하세요"
            value={formData.userEmail}
            onChange={handleInputChange}
          />
          {errors.userEmail && <div className="form-error">{errors.userEmail}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="edit-bio" className="form-label">
            <i className="fas fa-comment"></i> 자기소개 <span className="optional-mark">(선택)</span>
          </label>
          <textarea
            id="edit-bio"
            name="bio"
            className={`form-input ${errors.bio ? "error" : ""}`}
            placeholder="자기소개를 입력하세요 (최대 200자)"
            value={formData.bio}
            onChange={handleInputChange}
            maxLength={200}
            rows={4}
          />
          <div className="char-count">{formData.bio.length} / 200</div>
          {errors.bio && <div className="form-error">{errors.bio}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-bell"></i> 마케팅 정보 수신 동의
          </label>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="edit-marketingAgreement"
              name="marketingAgreement"
              checked={formData.marketingAgreement}
              onChange={handleInputChange}
            />
            <label htmlFor="edit-marketingAgreement" className="checkbox-label">
              마케팅 정보 수신에 동의합니다 (선택)
            </label>
          </div>
        </div>

        {!isOAuthUser && (
          <div className="form-group">
            <div className="password-change-header">
              <label className="form-label">
                <i className="fas fa-lock"></i> 비밀번호 변경
              </label>
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
              >
                {showPasswordChange ? "취소" : "변경하기"}
              </button>
            </div>
            {showPasswordChange && (
              <>
                <div className="form-group">
                  <label htmlFor="edit-currentPassword" className="form-label">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    id="edit-currentPassword"
                    name="currentPassword"
                    className={`form-input ${errors.currentPassword ? "error" : ""}`}
                    placeholder="현재 비밀번호를 입력하세요"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                  {errors.currentPassword && <div className="form-error">{errors.currentPassword}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-newPassword" className="form-label">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    id="edit-newPassword"
                    name="newPassword"
                    className={`form-input ${errors.newPassword ? "error" : ""}`}
                    placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                  {errors.newPassword && <div className="form-error">{errors.newPassword}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-confirmPassword" className="form-label">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="edit-confirmPassword"
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
                </div>
              </>
            )}
          </div>
        )}

        {isOAuthUser && (
          <div className="form-group">
            <div className="info-message">
              <i className="fas fa-info-circle"></i> 소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.
            </div>
          </div>
        )}

        <div className="edit-profile-actions">
          <button type="button" className="cancel-btn" onClick={onCancel} disabled={isSubmitting}>
            <i className="fas fa-times"></i> 취소
          </button>
          <button type="submit" className="save-btn" disabled={isSubmitting}>
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

export default EditProfileForm;

