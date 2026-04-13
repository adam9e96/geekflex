import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useCreateCollection from "@hooks/content/useCreateCollection";
import { collectionService } from "@services/collectionService";
import styles from "./CreateCollectionModal.module.css";

/**
 * 컬렉션 생성 모달 컴포넌트
 */
const CreateCollectionModal = ({ isOpen, onClose, onSuccess }) => {
  const { createCollection, isLoading, error: createError } = useCreateCollection();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          isPublic: true,
        });
        setError(null);
        setSuccess(false);
        setCoverImage(null);
        setCoverPreviewUrl("");
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!coverImage) {
      setCoverPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(coverImage);
    setCoverPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverImage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) {
      setError(null);
    }
  };

  const handleCoverImageChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setCoverImage(selectedFile);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    try {
      const createdCollection = await createCollection({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        isPublic: formData.isPublic,
      });

      if (coverImage && createdCollection?.id) {
        try {
          await collectionService.uploadCollectionCover(createdCollection.id, coverImage);
        } catch (uploadError) {
          console.error("컬렉션 표지 업로드 실패:", uploadError);
          setError(
            uploadError.message ||
              "컬렉션은 생성되었지만 표지 업로드에 실패했습니다. 상세 페이지에서 다시 설정할 수 있습니다.",
          );
        }
      }

      setSuccess(true);

      if (onSuccess) {
        onSuccess(createdCollection);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "컬렉션 생성에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.createCollectionModalOverlay} onClick={onClose}>
      <div className={styles.createCollectionModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.createCollectionModalHeader}>
          <h2>새 컬렉션 만들기</h2>
          <button className={styles.createCollectionModalClose} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form className={styles.createCollectionModalForm} onSubmit={handleSubmit}>
          <div className={styles.createCollectionModalBody}>
            <div className={styles.createCollectionModalField}>
              <label htmlFor="title" className={styles.createCollectionModalLabel}>
                제목 <span className={styles.required}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 내가 좋아하는 액션 영화"
                className={styles.createCollectionModalInput}
                maxLength={100}
                disabled={isLoading || success}
                required
              />
            </div>

            <div className={styles.createCollectionModalField}>
              <label htmlFor="description" className={styles.createCollectionModalLabel}>
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="컬렉션에 대한 설명을 입력하세요 (선택사항)"
                className={styles.createCollectionModalTextarea}
                rows={4}
                maxLength={500}
                disabled={isLoading || success}
              />
            </div>

            <div className={styles.createCollectionModalField}>
              <label htmlFor="coverImage" className={styles.createCollectionModalLabel}>
                표지 이미지
              </label>
              <input
                id="coverImage"
                name="coverImage"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleCoverImageChange}
                className={styles.createCollectionModalInput}
                disabled={isLoading || success}
              />
              <p className={styles.createCollectionModalHelp}>
                선택하지 않으면 첫 번째 콘텐츠 포스터가 대표 이미지로 사용됩니다.
              </p>
              {coverPreviewUrl && (
                <div className={styles.createCollectionModalPreview}>
                  <img src={coverPreviewUrl} alt="표지 미리보기" />
                </div>
              )}
            </div>

            <div className={styles.createCollectionModalField}>
              <label className={styles.createCollectionModalCheckboxLabel}>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className={styles.createCollectionModalCheckbox}
                  disabled={isLoading || success}
                />
                <span className={styles.createCollectionModalCheckboxText}>
                  <i className="fas fa-globe"></i>
                  공개 컬렉션으로 만들기
                </span>
                <span className={styles.createCollectionModalCheckboxHint}>
                  다른 사용자도 이 컬렉션을 볼 수 있습니다
                </span>
              </label>
            </div>

            {(error || createError) && (
              <div className={styles.createCollectionModalError}>
                <i className="fas fa-exclamation-circle"></i>
                <span>{error || createError}</span>
              </div>
            )}

            {success && (
              <div className={styles.createCollectionModalSuccess}>
                <i className="fas fa-check-circle"></i>
                <span>컬렉션이 생성되었습니다!</span>
              </div>
            )}
          </div>

          <div className={styles.createCollectionModalFooter}>
            <button
              type="button"
              className={styles.createCollectionModalCancelBtn}
              onClick={onClose}
              disabled={isLoading || success}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.createCollectionModalSubmitBtn}
              disabled={isLoading || success || !formData.title.trim()}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  생성 중...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  만들기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateCollectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default CreateCollectionModal;
