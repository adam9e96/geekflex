import React from "react";

/**
 * 프로필 이미지 업로드 컴포넌트
 */
const ProfileImageUpload = ({
  fileInputRef,
  previewImage,
  previewImageRef,
  error,
  onChange,
  onRemove,
}) => {
  return (
    <div className="form-group">
      <label htmlFor="profileImage" className="form-label">
        <i className="fas fa-camera"></i> 프로필 이미지 <span className="optional-mark">(선택)</span>
      </label>
      <div className="file-upload-container">
        <input
          type="file"
          id="profileImage"
          name="profile"
          ref={fileInputRef}
          className="file-input"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={onChange}
        />
        <label htmlFor="profileImage" className="file-upload-label">
          <i className="fas fa-cloud-upload-alt"></i>
          <span className="file-upload-text">이미지 선택</span>
        </label>
        {previewImage && (
          <div className="file-preview" style={{ display: "block" }}>
            <img ref={previewImageRef} src={previewImage} alt="프로필 미리보기" />
            <button type="button" className="remove-image" onClick={onRemove}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className="form-error" id="profileImageError">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;

