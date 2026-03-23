import React from "react";
import PropTypes from "prop-types";
import styles from "./ProfileImageUpload.module.css";

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
    <div className={styles.group}>
      <label htmlFor="profileImage" className={styles.label}>
        <i className="fas fa-camera"></i> 프로필 이미지{" "}
        <span className={styles.optionalMark}>(선택)</span>
      </label>
      <div className={styles.fileUploadContainer}>
        <input
          type="file"
          id="profileImage"
          name="profile"
          ref={fileInputRef}
          className={styles.fileInput}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={onChange}
        />
        <label htmlFor="profileImage" className={styles.fileUploadLabel}>
          <i className="fas fa-cloud-upload-alt"></i>
          <span className={styles.fileUploadText}>이미지 선택</span>
        </label>
        {previewImage && (
          <div className={styles.preview}>
            <img ref={previewImageRef} src={previewImage} alt="프로필 미리보기" />
            <button type="button" className={styles.removeBtn} onClick={onRemove}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className={styles.errorMsg} id="profileImageError">
          {error}
        </div>
      )}
    </div>
  );
};

ProfileImageUpload.propTypes = {
  fileInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  previewImage: PropTypes.string,
  previewImageRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default ProfileImageUpload;
