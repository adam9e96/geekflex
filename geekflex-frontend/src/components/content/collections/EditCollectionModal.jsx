import React, { useState, useEffect } from "react";
import useUpdateCollection from "@hooks/content/useUpdateCollection";
import "./styles/CreateCollectionModal.css";

/**
 * 컬렉션 수정 모달 컴포넌트
 *
 * 입력: isOpen (모달 열림 상태), onClose (모달 닫기 함수), collection (수정할 컬렉션), onSuccess (수정 성공 콜백)
 * 처리: 컬렉션 수정 폼을 표시하고, 수정 요청 처리
 * 반환: 컬렉션 수정 모달 JSX 요소
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

  // 모달이 열릴 때마다 컬렉션 데이터로 폼 초기화
  useEffect(() => {
    if (isOpen && collection) {
      setFormData({
        title: collection.title || collection.name || "",
        description: collection.description || "",
        isPublic: collection.isPublic !== undefined ? collection.isPublic : true,
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, collection]);

  /**
   * 폼 입력 변경 핸들러
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // 입력 시 에러 메시지 초기화
    if (error) {
      setError(null);
    }
  };

  /**
   * 컬렉션 수정 핸들러
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!collection || !collection.id) {
      setError("컬렉션 정보가 없습니다.");
      return;
    }

    // 제목 검증
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

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess(updatedCollection);
      }

      // 1.5초 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      // 에러는 updateCollection에서 이미 설정됨
      setError(err.message || "컬렉션 수정에 실패했습니다.");
    }
  };

  if (!isOpen || !collection) return null;

  return (
    <div className="create-collection-modal-overlay" onClick={onClose}>
      <div className="create-collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-collection-modal__header">
          <h2>컬렉션 수정</h2>
          <button className="create-collection-modal__close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form className="create-collection-modal__form" onSubmit={handleSubmit}>
          <div className="create-collection-modal__body">
            {/* 제목 입력 */}
            <div className="create-collection-modal__field">
              <label htmlFor="title" className="create-collection-modal__label">
                제목 <span className="required">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 내가 좋아하는 액션 영화"
                className="create-collection-modal__input"
                maxLength={100}
                disabled={isLoading || success}
                required
              />
            </div>

            {/* 설명 입력 */}
            <div className="create-collection-modal__field">
              <label htmlFor="description" className="create-collection-modal__label">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="컬렉션에 대한 설명을 입력하세요 (선택사항)"
                className="create-collection-modal__textarea"
                rows={4}
                maxLength={500}
                disabled={isLoading || success}
              />
            </div>

            {/* 공개 설정 */}
            <div className="create-collection-modal__field">
              <label className="create-collection-modal__checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="create-collection-modal__checkbox"
                  disabled={isLoading || success}
                />
                <span className="create-collection-modal__checkbox-text">
                  <i className="fas fa-globe"></i>
                  공개 컬렉션으로 만들기
                </span>
                <span className="create-collection-modal__checkbox-hint">
                  다른 사용자도 이 컬렉션을 볼 수 있습니다
                </span>
              </label>
            </div>

            {/* 에러 메시지 */}
            {(error || updateError) && (
              <div className="create-collection-modal__error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error || updateError}</span>
              </div>
            )}

            {/* 성공 메시지 */}
            {success && (
              <div className="create-collection-modal__success">
                <i className="fas fa-check-circle"></i>
                <span>컬렉션이 수정되었습니다!</span>
              </div>
            )}
          </div>

          <div className="create-collection-modal__footer">
            <button
              type="button"
              className="create-collection-modal__cancel-btn"
              onClick={onClose}
              disabled={isLoading || success}
            >
              취소
            </button>
            <button
              type="submit"
              className="create-collection-modal__submit-btn"
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

export default EditCollectionModal;

