import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { getAccessToken } from "@utils/auth";
import { useMovieSearch } from "@hooks/content/useMovieSearch";
import { useTvSearch } from "@hooks/content/useTvSearch";
import "./styles/AddContentToCollectionModal.css";

/**
 * 컬렉션에 작품 추가 모달 컴포넌트
 * 검색을 통해 영화나 TV 작품을 찾아 컬렉션에 추가할 수 있다.
 *
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Function} onClose - 모달 닫기 함수
 * @param {Function} onAddSuccess - 작품 추가 성공 시 콜백 (컬렉션 목록 새로고침용)
 * @param {string} collectionId - 컬렉션 ID
 */
const AddContentToCollectionModal = ({ isOpen, onClose, onAddSuccess, collectionId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("movie"); // "movie" or "tv"
  const [addingContentIds, setAddingContentIds] = useState(new Set());

  // 검색 훅 사용
  const { movieResults, isMovieSearchLoading, movieSearchError, searchMovies } = useMovieSearch();

  const { tvResults, isTvSearchLoading, tvSearchError, searchTv } = useTvSearch();

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setActiveTab("movie");
      setAddingContentIds(new Set());
    }
  }, [isOpen]);

  // 검색 실행 (디바운싱)
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
    }, 500); // 500ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab, isOpen, searchMovies, searchTv]); // 검색 쿼리, 탭, 모달 열림 상태, 검색 함수가 변경될때마다 업데이트

  // 현재 탭의 검색 결과 가져오기
  const currentResults = activeTab === "movie" ? movieResults : tvResults;
  const isLoading = activeTab === "movie" ? isMovieSearchLoading : isTvSearchLoading;
  const searchError = activeTab === "movie" ? movieSearchError : tvSearchError;

  /**
   * 작품을 컬렉션에 추가
   */
  const handleAddContent = useCallback(
    async (content) => {
      // contentId (PK) 또는 id 확인
      let contentId = content.contentId || content.id;
      const tmdbId = content.tmdbId;

      // contentId가 없으면 tmdbId로 작품을 먼저 저장해야 함
      if (!contentId && !tmdbId) {
        toast.error("작품 ID를 찾을 수 없습니다.");
        return;
      }

      // 추가 중인지 확인하기 위한 키 (contentId가 있으면 contentId, 없으면 tmdbId 사용)
      const addingKey = contentId || tmdbId;

      // 이미 추가 중인 경우 무시
      if (addingContentIds.has(addingKey)) {
        return;
      }

      setAddingContentIds((prev) => new Set(prev).add(addingKey));

      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          throw new Error("로그인이 필요합니다.");
        }

        // contentId가 없으면 tmdbId로 작품을 먼저 저장
        if (!contentId && tmdbId) {
          // content 객체에 contentType이 있으면 우선 사용, 없으면 activeTab 사용
          const contentTypeFromContent = content.contentType; // "MOVIE" or "TV"
          let contentType;
          
          if (contentTypeFromContent === "MOVIE" || contentTypeFromContent === "movie") {
            contentType = "movies";
          } else if (contentTypeFromContent === "TV" || contentTypeFromContent === "tv") {
            contentType = "tv";
          } else {
            // contentType이 없으면 activeTab 사용
            contentType = activeTab === "movie" ? "movies" : "tv";
          }
          
          const saveUrl = `/api/v1/${contentType}/${tmdbId}`;

          console.log("작품 저장 요청:", {
            saveUrl,
            contentTypeFromContent,
            activeTab,
            finalContentType: contentType,
          });

          const saveResponse = await fetch(saveUrl, {
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
          console.log("작품 저장 응답:", saveResult);

          // 저장된 작품의 id를 contentId로 사용
          if (saveResult.data && saveResult.data.id) {
            contentId = saveResult.data.id;
          } else {
            throw new Error("저장된 작품의 ID를 찾을 수 없습니다.");
          }
        }

        // 컬렉션에 작품 추가
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

          // 성공 콜백 호출 (컬렉션 목록 새로고침)
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
    <div className="add-content-to-collection-modal-overlay" onClick={onClose}>
      <div className="add-content-to-collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-content-to-collection-modal__header">
          <h2>작품 추가</h2>
          <button className="add-content-to-collection-modal__close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="add-content-to-collection-modal__body">
          {/* 검색 입력 */}
          <div className="add-content-to-collection-modal__search">
            <div className="add-content-to-collection-modal__search-input-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                className="add-content-to-collection-modal__search-input"
                placeholder="영화 또는 드라마 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  className="add-content-to-collection-modal__search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* 탭 전환 */}
          <div className="add-content-to-collection-modal__tabs">
            <button
              className={`add-content-to-collection-modal__tab ${
                activeTab === "movie" ? "active" : ""
              }`}
              onClick={() => setActiveTab("movie")}
            >
              <i className="fas fa-film"></i>
              영화
            </button>
            <button
              className={`add-content-to-collection-modal__tab ${
                activeTab === "tv" ? "active" : ""
              }`}
              onClick={() => setActiveTab("tv")}
            >
              <i className="fas fa-tv"></i>
              드라마
            </button>
          </div>

          {/* 검색 결과 */}
          <div className="add-content-to-collection-modal__results">
            {!searchQuery ? (
              <div className="add-content-to-collection-modal__empty">
                <i className="fas fa-search"></i>
                <p>검색어를 입력해주세요</p>
              </div>
            ) : isLoading ? (
              <div className="add-content-to-collection-modal__loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>검색 중...</p>
              </div>
            ) : searchError ? (
              <div className="add-content-to-collection-modal__error">
                <i className="fas fa-exclamation-circle"></i>
                <p>{searchError}</p>
              </div>
            ) : currentResults.length === 0 ? (
              <div className="add-content-to-collection-modal__empty">
                <i className="fas fa-inbox"></i>
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className="add-content-to-collection-modal__results-list">
                {currentResults.map((content) => {
                  const contentId = content.contentId || content.id;
                  const addingKey = contentId || content.tmdbId;
                  const isAdding = addingContentIds.has(addingKey);

                  return (
                    <div
                      key={addingKey || content.tmdbId}
                      className="add-content-to-collection-modal__result-item"
                    >
                      <div className="add-content-to-collection-modal__result-poster">
                        {content.poster ? (
                          <img src={content.poster} alt={content.title} />
                        ) : (
                          <div className="add-content-to-collection-modal__result-poster-placeholder">
                            <i className="fas fa-image"></i>
                          </div>
                        )}
                      </div>
                      <div className="add-content-to-collection-modal__result-info">
                        <h3>{content.title}</h3>
                        {content.originalTitle && content.originalTitle !== content.title && (
                          <p className="add-content-to-collection-modal__result-original">
                            {content.originalTitle}
                          </p>
                        )}
                        {content.year && (
                          <span className="add-content-to-collection-modal__result-year">
                            {content.year}
                          </span>
                        )}
                        {content.rating && (
                          <span className="add-content-to-collection-modal__result-rating">
                            <i className="fas fa-star"></i>
                            {content.rating}
                          </span>
                        )}
                      </div>
                      <button
                        className="add-content-to-collection-modal__result-add-btn"
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

        <div className="add-content-to-collection-modal__footer">
          <button className="add-content-to-collection-modal__close-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContentToCollectionModal;
