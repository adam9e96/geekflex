import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAccessToken } from "@utils/auth";
import useCollection from "@hooks/content/useCollection";
import "./styles/AddToCollectionModal.css";

/**
 * 컬렉션에 작품 추가 모달 컴포넌트
 *
 * 입력: isOpen (모달 열림 상태), onClose (모달 닫기 함수), contentId (작품 ID)
 * 처리: 컬렉션 목록을 가져와서 표시하고, 선택한 컬렉션에 작품 추가
 * 반환: 컬렉션 선택 모달 JSX 요소
 */
const AddToCollectionModal = ({ isOpen, onClose, contentId }) => {
  const { collections, isLoading, refetch } = useCollection();
  const [addingCollectionIds, setAddingCollectionIds] = useState(new Set());
  const [successCollectionIds, setSuccessCollectionIds] = useState(new Set());
  const [errorMessages, setErrorMessages] = useState({});

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setAddingCollectionIds(new Set());
      setSuccessCollectionIds(new Set());
      setErrorMessages({});
    }
  }, [isOpen]);

  /**
   * 특정 컬렉션에 작품 추가
   */
  const handleAddToCollection = async (collectionId) => {
    // 이미 추가 중이거나 성공한 경우 무시
    if (addingCollectionIds.has(collectionId) || successCollectionIds.has(collectionId)) {
      return;
    }

    setAddingCollectionIds((prev) => new Set(prev).add(collectionId));
    setErrorMessages((prev) => {
      const newErrors = { ...prev };
      delete newErrors[collectionId];
      return newErrors;
    });

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      // POST /api/v1/collections/{collectionId}/items
      const response = await fetch(`/api/v1/collections/${collectionId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          contentId: contentId,
        }),
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        const successMessage = result.message || "작품이 컬렉션에 추가되었습니다.";
        
        // Toastify로 성공 메시지 표시
        toast.success(successMessage);
        
        setSuccessCollectionIds((prev) => new Set(prev).add(collectionId));
        // 성공 메시지 표시 후 1.5초 후 제거
        setTimeout(() => {
          setSuccessCollectionIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(collectionId);
            return newSet;
          });
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || errorData.message || "컬렉션에 추가하는데 실패했습니다.";
        setErrorMessages((prev) => ({
          ...prev,
          [collectionId]: errorMessage,
        }));
        // 에러 메시지도 toastify로 표시
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("컬렉션 추가 실패:", error);
      setErrorMessages((prev) => ({
        ...prev,
        [collectionId]: error.message || "컬렉션에 추가하는데 실패했습니다.",
      }));
    } finally {
      setAddingCollectionIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(collectionId);
        return newSet;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-to-collection-modal-overlay" onClick={onClose}>
      <div className="add-to-collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-to-collection-modal__header">
          <h2>컬렉션에 추가</h2>
          <button className="add-to-collection-modal__close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="add-to-collection-modal__body">
          {isLoading ? (
            <div className="add-to-collection-modal__loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>컬렉션 목록을 불러오는 중...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="add-to-collection-modal__empty">
              <i className="fas fa-folder-open"></i>
              <p>컬렉션이 없습니다.</p>
              <p className="add-to-collection-modal__empty-hint">먼저 컬렉션을 만들어주세요.</p>
            </div>
          ) : (
            <>
              <div className="add-to-collection-modal__list">
                {collections.map((collection) => {
                  const isAdding = addingCollectionIds.has(collection.id);
                  const isSuccess = successCollectionIds.has(collection.id);
                  const errorMessage = errorMessages[collection.id];

                  return (
                    <div key={collection.id} className="add-to-collection-modal__item">
                      <div className="add-to-collection-modal__item-icon">
                        <i className="fas fa-bookmark"></i>
                      </div>
                      <div className="add-to-collection-modal__item-info">
                        <h3>{collection.title || collection.name}</h3>
                        {collection.description && (
                          <p className="add-to-collection-modal__item-description">
                            {collection.description}
                          </p>
                        )}
                        <div className="add-to-collection-modal__item-meta">
                          {(collection.itemCount !== undefined ||
                            collection.contentCount !== undefined) && (
                            <span className="add-to-collection-modal__item-count">
                              작품 {collection.itemCount || collection.contentCount || 0}개
                            </span>
                          )}
                          {collection.isPublic !== undefined && (
                            <span className="add-to-collection-modal__item-visibility">
                              {collection.isPublic ? (
                                <>
                                  <i className="fas fa-globe"></i> 공개
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-lock"></i> 비공개
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        {errorMessage && (
                          <div className="add-to-collection-modal__item-error">
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{errorMessage}</span>
                          </div>
                        )}
                      </div>
                      <button
                        className={`add-to-collection-modal__item-add-btn ${
                          isSuccess ? "success" : ""
                        }`}
                        onClick={() => handleAddToCollection(collection.id)}
                        disabled={isAdding || isSuccess}
                      >
                        {isAdding ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>추가 중...</span>
                          </>
                        ) : isSuccess ? (
                          <>
                            <i className="fas fa-check"></i>
                            <span>추가됨</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus"></i>
                            <span>추가</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="add-to-collection-modal__footer">
          <button
            className="add-to-collection-modal__close-btn"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCollectionModal;
