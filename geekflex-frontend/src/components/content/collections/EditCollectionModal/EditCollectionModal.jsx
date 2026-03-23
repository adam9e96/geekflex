import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useUpdateCollection from "@hooks/content/useUpdateCollection";
import styles from "./EditCollectionModal.module.css";

/**
 * 컬렉션 수정 모달 컴포넌트
 */
const EditCollectionModal = ({ isOpen, onClose, collection, onSuccess }) => {
  const { updateCollection, isLoading, error: updateError } = useUpdateCollection();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && collection) {
      setTimeout(() => {
        setFormData({
          title: collection.title || collection.name || "",
          description: collection.description || "",
          isPublic: collection.isPublic !== undefined ? collection.isPublic : true,
        });
        setError(null);
        setSuccess(false);
      }, 0);
    }
  }, [isOpen, collection]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!collection || !collection.id) {
      setError("컬렉션 정보가 없습니다.");
      return;
    }

    if (!formData.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    try {
      const updatedCollection = await updateCollection(collection.id, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        isPublic: formData.isPublic,
      });

      setSuccess(true);

      if (onSuccess) {
        onSuccess(updatedCollection);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "컬렉션 수정에 실패했습니다.");
    }
  };

  if (!isOpen || !collection) return null;

  return (
    <div className={styles.createCollectionModalOverlay} onClick={onClose}>
      <div className={styles.createCollectionModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.createCollectionModalHeader}>
          <h2>컬렉션 수정</h2>
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

            {(error || updateError) && (
              <div className={styles.createCollectionModalError}>
                <i className="fas fa-exclamation-circle"></i>
                <span>{error || updateError}</span>
              </div>
            )}

            {success && (
              <div className={styles.createCollectionModalSuccess}>
                <i className="fas fa-check-circle"></i>
                <span>컬렉션이 수정되었습니다!</span>
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
                  수정 중...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  저장하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditCollectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  collection: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    isPublic: PropTypes.bool,
  }),
  onSuccess: PropTypes.func,
};

export default EditCollectionModal;
