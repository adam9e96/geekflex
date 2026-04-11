import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { getAccessToken } from "@utils/auth";
import { useMovieSearch } from "@hooks/content/useMovieSearch";
import { useTvSearch } from "@hooks/content/useTvSearch";
import { buildApiUrl } from "@services/apiClient";
import styles from "./AddContentToCollectionModal.module.css";

/**
 * 컬렉션에 작품 추가 모달 컴포넌트
 */
const AddContentToCollectionModal = ({ isOpen, onClose, onAddSuccess, collectionId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("movie"); // "movie" or "tv"
  const [addingContentIds, setAddingContentIds] = useState(new Set());

  // 검색 훅 사용
  const { movieResults, isMovieSearchLoading, movieSearchError, searchMovies } = useMovieSearch();
  const { tvResults, isTvSearchLoading, tvSearchError, searchTv } = useTvSearch();

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setActiveTab("movie");
      setAddingContentIds(new Set());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (activeTab === "movie") {
        searchMovies(searchQuery);
      } else {
        searchTv(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab, isOpen, searchMovies, searchTv]);

  const currentResults = activeTab === "movie" ? movieResults : tvResults;
  const isLoading = activeTab === "movie" ? isMovieSearchLoading : isTvSearchLoading;
  const searchError = activeTab === "movie" ? movieSearchError : tvSearchError;

  const handleAddContent = useCallback(
    async (content) => {
      let contentId = content.contentId || content.id;
      const tmdbId = content.tmdbId;

      if (!contentId && !tmdbId) {
        toast.error("작품 ID를 찾을 수 없습니다.");
        return;
      }

      const addingKey = contentId || tmdbId;

      if (addingContentIds.has(addingKey)) {
        return;
      }

      setAddingContentIds((prev) => new Set(prev).add(addingKey));

      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          throw new Error("로그인이 필요합니다.");
        }

        if (!contentId && tmdbId) {
          const contentTypeFromContent = content.contentType;
          let contentType;

          if (contentTypeFromContent === "MOVIE" || contentTypeFromContent === "movie") {
            contentType = "movies";
          } else if (contentTypeFromContent === "TV" || contentTypeFromContent === "tv") {
            contentType = "tv";
          } else {
            contentType = activeTab === "movie" ? "movies" : "tv";
          }

          const saveUrl = `/api/v1/${contentType}/${tmdbId}`;

          const saveResponse = await fetch(buildApiUrl(saveUrl), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json().catch(() => ({}));
            const errorMessage =
              errorData.error || errorData.message || "작품 저장에 실패했습니다.";
            throw new Error(errorMessage);
          }

          const saveResult = await saveResponse.json();
          if (saveResult.data && saveResult.data.id) {
            contentId = saveResult.data.id;
          } else {
            throw new Error("저장된 작품의 ID를 찾을 수 없습니다.");
          }
        }

        const response = await fetch(buildApiUrl(`/api/v1/collections/${collectionId}/items`), {
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

          if (onAddSuccess) {
            onAddSuccess();
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || errorData.message || "컬렉션에 추가하는데 실패했습니다.";
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error("컬렉션 추가 실패:", error);
        toast.error(error.message || "컬렉션에 추가하는데 실패했습니다.");
      } finally {
        setAddingContentIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(addingKey);
          return newSet;
        });
      }
    },
    [collectionId, addingContentIds, onAddSuccess, activeTab],
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>작품 추가</h2>
          <button className={styles.close} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.search}>
            <div className={styles.searchInputWrapper}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="영화 또는 드라마 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button className={styles.searchClear} onClick={() => setSearchQuery("")}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "movie" ? styles.active : ""}`}
              onClick={() => setActiveTab("movie")}
            >
              <i className="fas fa-film"></i>
              영화
            </button>
            <button
              className={`${styles.tab} ${activeTab === "tv" ? styles.active : ""}`}
              onClick={() => setActiveTab("tv")}
            >
              <i className="fas fa-tv"></i>
              드라마
            </button>
          </div>

          <div className={styles.results}>
            {!searchQuery ? (
              <div className={styles.empty}>
                <i className="fas fa-search"></i>
                <p>검색어를 입력해주세요</p>
              </div>
            ) : isLoading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i>
                <p>검색 중...</p>
              </div>
            ) : searchError ? (
              <div className={styles.error}>
                <i className="fas fa-exclamation-circle"></i>
                <p>{searchError}</p>
              </div>
            ) : currentResults.length === 0 ? (
              <div className={styles.empty}>
                <i className="fas fa-inbox"></i>
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className={styles.resultsList}>
                {currentResults.map((content) => {
                  const contentId = content.contentId || content.id;
                  const addingKey = contentId || content.tmdbId;
                  const isAdding = addingContentIds.has(addingKey);

                  return (
                    <div key={addingKey || content.tmdbId} className={styles.resultItem}>
                      <div className={styles.resultPoster}>
                        {content.poster ? (
                          <img src={content.poster} alt={content.title} />
                        ) : (
                          <div className={styles.resultPosterPlaceholder}>
                            <i className="fas fa-image"></i>
                          </div>
                        )}
                      </div>
                      <div className={styles.resultInfo}>
                        <h3>{content.title}</h3>
                        {content.originalTitle && content.originalTitle !== content.title && (
                          <p className={styles.resultOriginal}>{content.originalTitle}</p>
                        )}
                        {content.year && <span className={styles.resultYear}>{content.year}</span>}
                        {content.rating && (
                          <span className={styles.resultRating}>
                            <i className="fas fa-star"></i>
                            {content.rating}
                          </span>
                        )}
                      </div>
                      <button
                        className={styles.resultAddBtn}
                        onClick={() => handleAddContent(content)}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>추가 중...</span>
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

AddContentToCollectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddSuccess: PropTypes.func,
  collectionId: PropTypes.string.isRequired,
};

export default AddContentToCollectionModal;
