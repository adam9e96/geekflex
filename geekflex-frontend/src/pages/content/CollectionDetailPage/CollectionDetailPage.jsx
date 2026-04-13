import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAccessToken } from "@utils/auth";
import { buildApiUrl } from "@services/apiClient";
import { collectionService } from "@services/collectionService";
import LoadingSpinner from "@components/ui/LoadingSpinner/LoadingSpinner";
import EmptyState from "@components/ui/EmptyState/EmptyState.jsx";
import AddContentToCollectionModal from "@components/content/collections/AddContentToCollectionModal/AddContentToCollectionModal";
import useCollectionDetail from "@hooks/content/useCollectionDetail";
import { useAuthStore } from "@stores/authStore";
import { useCollectionStore } from "@stores/collectionStore";
import CollectionHeader from "@components/content/collections/CollectionHeader/CollectionHeader";
import CollectionContentList from "@components/content/collections/CollectionContentList/CollectionContentList";

import styles from "./CollectionDetailPage.module.css";

/**
 * 컬렉션 상세 페이지 컴포넌트
 * 특정 컬렉션에 포함된 작품 목록을 보여줍니다.
 */
const CollectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { collection, contents, isLoading, error, isExample, refetch } = useCollectionDetail(id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { deleteCollection, openEditModal } = useCollectionStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [coverActionMessage, setCoverActionMessage] = useState("");
  const [coverActionError, setCoverActionError] = useState("");
  const [isCoverActionLoading, setIsCoverActionLoading] = useState(false);

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      if (!isAuthenticated) {
        setCurrentUserId(null);
        return;
      }

      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          setCurrentUserId(null);
          return;
        }

        const response = await fetch(buildApiUrl("/api/v1/users/me/summary"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.userId || data.id || null);
        } else {
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error("사용자 ID 가져오기 실패:", error);
        setCurrentUserId(null);
      }
    };

    fetchCurrentUserId();
  }, [isAuthenticated]);

  // 제작자 정보 추출 (다양한 필드명 지원)
  const creator =
    collection &&
    (collection.creator ||
      collection.owner ||
      collection.user ||
      collection.author ||
      (collection.userId && { id: collection.userId }));

  // 제작자 ID 추출
  const creatorId =
    creator?.id ||
    creator?.userId ||
    (typeof creator === "string" ? creator : null) ||
    collection?.userId;

  // 현재 사용자가 제작자인지 확인 (Derived State)
  const isCreator =
    collection &&
    currentUserId &&
    (creatorId === currentUserId || String(creatorId) === String(currentUserId));

  // 작품 누적 시간 계산
  const totalRuntime = Array.isArray(contents)
    ? contents.reduce((sum, content) => {
        const runtime = content.runtime || 0;
        return sum + runtime;
      }, 0)
    : 0;

  // 수정 핸들러
  const handleEdit = () => {
    if (isExample) {
      alert("예시 컬렉션은 수정할 수 없습니다.");
      return;
    }
    openEditModal(collection);
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (isExample) {
      alert("예시 컬렉션은 삭제할 수 없습니다.");
      return;
    }

    if (window.confirm("정말로 이 컬렉션을 삭제하시겠습니까?")) {
      try {
        await deleteCollection(id);
        navigate("/collections");
      } catch (error) {
        console.error("컬렉션 삭제 실패:", error);
        alert("컬렉션 삭제에 실패했습니다.");
      }
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !id) {
      return;
    }

    try {
      setIsCoverActionLoading(true);
      setCoverActionError("");
      setCoverActionMessage("");
      await collectionService.uploadCollectionCover(id, file);
      setCoverActionMessage("표지 이미지가 업로드되었습니다.");
      refetch();
    } catch (uploadError) {
      console.error("컬렉션 표지 업로드 실패:", uploadError);
      setCoverActionError(uploadError.message || "표지 업로드에 실패했습니다.");
    } finally {
      e.target.value = "";
      setIsCoverActionLoading(false);
    }
  };

  const handleSelectCoverContent = async (contentId) => {
    if (!id || !contentId) {
      return;
    }

    try {
      setIsCoverActionLoading(true);
      setCoverActionError("");
      setCoverActionMessage("");
      await collectionService.selectCollectionCoverFromContent(id, contentId);
      setCoverActionMessage("선택한 콘텐츠를 컬렉션 표지로 설정했습니다.");
      refetch();
    } catch (selectError) {
      console.error("컬렉션 표지 선택 실패:", selectError);
      setCoverActionError(selectError.message || "표지 설정에 실패했습니다.");
    } finally {
      setIsCoverActionLoading(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!id) {
      return;
    }

    try {
      setIsCoverActionLoading(true);
      setCoverActionError("");
      setCoverActionMessage("");
      await collectionService.removeCollectionCover(id);
      setCoverActionMessage("업로드한 표지를 제거했습니다. 이제 첫 번째 콘텐츠 포스터가 기본 표지로 사용됩니다.");
      refetch();
    } catch (removeError) {
      console.error("컬렉션 표지 제거 실패:", removeError);
      setCoverActionError(removeError.message || "표지 제거에 실패했습니다.");
    } finally {
      setIsCoverActionLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {isLoading ? (
        <LoadingSpinner message="로딩 중..." />
      ) : error ? (
        <EmptyState message="컬렉션 정보를 로드하는데 실패했습니다." />
      ) : !collection ? (
        <EmptyState message="컬렉션을 찾을 수 없습니다." />
      ) : (
        <>
          {/* 뒤로 가기 및 예시 배지 (헤더 위에 배치) */}
          <div className={styles.topBar}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i>
              목록으로
            </button>

            {isExample && (
              <div className={styles.exampleBadge}>
                <i className="fas fa-lightbulb"></i>
                <span>예시 컬렉션입니다</span>
              </div>
            )}
          </div>

          <CollectionHeader
            collection={collection}
            totalRuntime={totalRuntime}
            isCreator={isCreator}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* 작품 추가 버튼 (제작자만 표시) */}
          {isCreator && (
            <>
              <div className={styles.coverPanel}>
                <div className={styles.coverPanelHeader}>
                  <div>
                    <h2 className={styles.coverPanelTitle}>컬렉션 표지 관리</h2>
                    <p className={styles.coverPanelDescription}>
                      이미지를 업로드하거나, 아래 작품 중 하나를 골라 컬렉션 대표 이미지로 설정할 수 있습니다.
                    </p>
                  </div>
                  {collection.thumbnailUrl && (
                    <div className={styles.currentCoverPreview}>
                      <img src={collection.thumbnailUrl} alt={`${collection.title} 표지`} />
                    </div>
                  )}
                </div>

                <div className={styles.coverActions}>
                  <label className={styles.coverUploadBtn}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleCoverUpload}
                      disabled={isCoverActionLoading}
                    />
                    <i className="fas fa-upload"></i>
                    표지 업로드
                  </label>
                  <button
                    type="button"
                    className={styles.coverRemoveBtn}
                    onClick={handleRemoveCover}
                    disabled={isCoverActionLoading}
                  >
                    <i className="fas fa-eraser"></i>
                    표지 초기화
                  </button>
                </div>

                {coverActionMessage && (
                  <div className={styles.coverActionSuccess}>
                    <i className="fas fa-check-circle"></i>
                    <span>{coverActionMessage}</span>
                  </div>
                )}

                {coverActionError && (
                  <div className={styles.coverActionError}>
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{coverActionError}</span>
                  </div>
                )}

                {Array.isArray(contents) && contents.length > 0 && (
                  <div className={styles.coverSelectionGrid}>
                    {contents.map((content) => {
                      const imageUrl = content.posterUrl || content.backdropUrl;
                      const isSelected = String(collection.coverContentId) === String(content.id);

                      return (
                        <button
                          key={`cover-${content.id}`}
                          type="button"
                          className={`${styles.coverCandidate} ${isSelected ? styles.coverCandidateSelected : ""}`}
                          onClick={() => handleSelectCoverContent(content.id)}
                          disabled={isCoverActionLoading}
                        >
                          <div className={styles.coverCandidateImage}>
                            {imageUrl ? (
                              <img src={imageUrl} alt={content.title} />
                            ) : (
                              <div className={styles.coverCandidatePlaceholder}>
                                <i className="fas fa-film"></i>
                              </div>
                            )}
                          </div>
                          <span className={styles.coverCandidateTitle}>{content.title}</span>
                          <span className={styles.coverCandidateAction}>
                            {isSelected ? "현재 표지" : "이 작품으로 표지 설정"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={styles.addContentSection}>
                <button className={styles.addContentBtn} onClick={() => setIsAddModalOpen(true)}>
                  <i className="fas fa-plus"></i>새 작품 추가
                </button>
              </div>
            </>
          )}

          <CollectionContentList contents={contents} />
        </>
      )}

      {/* 작품 추가 모달 */}
      {isCreator && (
        <AddContentToCollectionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddSuccess={() => {
            refetch();
          }}
          collectionId={id}
        />
      )}
    </div>
  );
};

export default CollectionDetailPage;
