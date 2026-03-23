import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { getAccessToken } from "@utils/auth";
import useCollection from "@hooks/content/useCollection";
import styles from "./AddToCollectionModal.module.css";

/**
 * 컬렉션에 작품 추가 모달 컴포넌트
 */
const AddToCollectionModal = ({ isOpen, onClose, contentId }) => {
  const { collections, isLoading } = useCollection();
  const [addingCollectionIds, setAddingCollectionIds] = useState(new Set());
  const [successCollectionIds, setSuccessCollectionIds] = useState(new Set());
  const [errorMessages, setErrorMessages] = useState({});

  useEffect(() => {
    if (isOpen) {
      setAddingCollectionIds(new Set());
      setSuccessCollectionIds(new Set());
      setErrorMessages({});
    }
  }, [isOpen]);

  const handleAddToCollection = async (collectionId) => {
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

        toast.success(successMessage);

        setSuccessCollectionIds((prev) => new Set(prev).add(collectionId));
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>컬렉션에 추가</h2>
          <button className={styles.close} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.body}>
          {isLoading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              <p>컬렉션 목록을 불러오는 중...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className={styles.empty}>
              <i className="fas fa-folder-open"></i>
              <p>컬렉션이 없습니다.</p>
              <p className={styles.emptyHint}>먼저 컬렉션을 만들어주세요.</p>
            </div>
          ) : (
            <div className={styles.list}>
              {collections.map((collection) => {
                const isAdding = addingCollectionIds.has(collection.id);
                const isSuccess = successCollectionIds.has(collection.id);
                const errorMessage = errorMessages[collection.id];

                return (
                  <div key={collection.id} className={styles.item}>
                    <div className={styles.itemIcon}>
                      <i className="fas fa-bookmark"></i>
                    </div>
                    <div className={styles.itemInfo}>
                      <h3>{collection.title || collection.name}</h3>
                      {collection.description && (
                        <p className={styles.itemDescription}>{collection.description}</p>
                      )}
                      <div className={styles.itemMeta}>
                        {(collection.itemCount !== undefined ||
                          collection.contentCount !== undefined) && (
                          <span className={styles.itemCount}>
                            작품 {collection.itemCount || collection.contentCount || 0}개
                          </span>
                        )}
                        {collection.isPublic !== undefined && (
                          <span className={styles.itemVisibility}>
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
                        <div className={styles.itemError}>
                          <i className="fas fa-exclamation-circle"></i>
                          <span>{errorMessage}</span>
                        </div>
                      )}
                    </div>
                    <button
                      className={`${styles.itemAddBtn} ${isSuccess ? styles.success : ""}`}
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
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.closeBtn} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

AddToCollectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  contentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default AddToCollectionModal;
