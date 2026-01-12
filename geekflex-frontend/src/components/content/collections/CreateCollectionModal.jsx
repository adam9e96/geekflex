import React, { useState, useEffect } from "react";
import useCreateCollection from "@hooks/content/useCreateCollection";
import "./styles/CreateCollectionModal.css";

/**
 * 컬렉션 생성 모달 컴포넌트
 *
 * 입력: isOpen (모달 열림 상태), onClose (모달 닫기 함수), onSuccess (생성 성공 콜백)
 * 처리: 컬렉션 생성 폼을 표시하고, 생성 요청 처리
 * 반환: 컬렉션 생성 모달 JSX 요소
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

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        isPublic: true,
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

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
   * 컬렉션 생성 핸들러
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 제목 검증
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

      setSuccess(true);

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess(createdCollection);
      }

      // 1.5초 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      // 에러는 createCollection에서 이미 설정됨
      setError(err.message || "컬렉션 생성에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-collection-modal-overlay" onClick={onClose}>
      <div className="create-collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-collection-modal__header">
          <h2>새 컬렉션 만들기</h2>
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
            {(error || createError) && (
              <div className="create-collection-modal__error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error || createError}</span>
              </div>
            )}

            {/* 성공 메시지 */}
            {success && (
              <div className="create-collection-modal__success">
                <i className="fas fa-check-circle"></i>
                <span>컬렉션이 생성되었습니다!</span>
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

export default CreateCollectionModal;

