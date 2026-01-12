import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAccessToken } from "@utils/auth";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import NoImage from "@components/home/NoImage";
import SectionHeader from "@components/home/SectionHeader";
import MovieCard from "@components/home/MovieCard";
import AddContentToCollectionModal from "@components/content/collections/AddContentToCollectionModal";
import useCollectionDetail from "@hooks/content/useCollectionDetail";
import { useAuthStore } from "@stores/authStore";
import { getPosterUrl } from "@utils/content/movieUtils";
import "@styles/home/home.css";
import "@components/content/collections/styles/collection-detail-page.css";

/**
 * 컬렉션 상세 페이지 컴포넌트
 * 특정 컬렉션에 포함된 작품 목록을 보여줍니다.
 */
const CollectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { collection, contents, isLoading, error, isExample, refetch } = useCollectionDetail(id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isCreator, setIsCreator] = useState(false);

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      if (!isAuthenticated) {
        setCurrentUserId(null);
        setIsCreator(false);
        return;
      }

      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          setCurrentUserId(null);
          setIsCreator(false);
          return;
        }

        const response = await fetch("/api/v1/users/me/summary", {
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

  // 컬렉션 제작자 확인
  useEffect(() => {
    if (!collection || !currentUserId) {
      setIsCreator(false);
      return;
    }

    // 제작자 정보 추출 (다양한 필드명 지원)
    const creator =
      collection.creator ||
      collection.owner ||
      collection.user ||
      collection.author ||
      (collection.userId && { id: collection.userId });

    // 제작자 ID 추출
    const creatorId =
      creator?.id ||
      creator?.userId ||
      (typeof creator === "string" ? creator : null) ||
      collection.userId;

    // 현재 사용자가 제작자인지 확인
    setIsCreator(creatorId === currentUserId || String(creatorId) === String(currentUserId));
  }, [collection, currentUserId]);

  // 작품 누적 시간 계산 (contents가 배열인지 확인)
  const totalRuntime = Array.isArray(contents)
    ? contents.reduce((sum, content) => {
        const runtime = content.runtime || 0;
        return sum + runtime;
      }, 0)
    : 0;

  // 시간 포맷팅 (시간과 분으로 변환)
  const formatRuntime = (minutes) => {
    if (!minutes || minutes === 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
    return `${mins}분`;
  };

  // 썸네일 URL 결정: thumbnailUrl이 없으면 첫 번째 작품의 포스터 사용
  const thumbnailUrl = useMemo(() => {
    if (collection?.thumbnailUrl) {
      return collection.thumbnailUrl;
    }
    // 첫 번째 작품의 포스터 이미지 사용
    if (Array.isArray(contents) && contents.length > 0) {
      const firstContent = contents[0];
      const posterPath = firstContent.posterUrl || firstContent.poster_path || firstContent.posterPath;
      if (posterPath) {
        return getPosterUrl(posterPath);
      }
    }
    return null;
  }, [collection?.thumbnailUrl, contents]);

  return (
    <div className="home-page collection-detail-page">
      <section className="home-popular">
        <div className="home-popular__container">
          {/* 뒤로가기 버튼 */}
          <button className="collection-detail__back-btn" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
            컬렉션 목록으로
          </button>

          {isLoading ? (
            <LoadingSpinner message="로딩 중..." className="home-loading" />
          ) : error ? (
            <NoImage message="컬렉션 정보를 로드하는데 실패했습니다." />
          ) : !collection ? (
            <NoImage message="컬렉션을 찾을 수 없습니다." />
          ) : (
            <>
              {/* 예시 컬렉션 알림 */}
              {isExample && (
                <div className="collection-detail__example-badge">
                  <i className="fas fa-lightbulb"></i>
                  <span>예시 컬렉션입니다</span>
                </div>
              )}

              {/* 컬렉션 헤더 */}
              <div className="collection-detail__header">
                {thumbnailUrl && (
                  <div className="collection-detail__thumbnail">
                    <img
                      src={thumbnailUrl}
                      alt={collection.title || collection.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        const placeholder = e.target.nextElementSibling;
                        if (placeholder) {
                          placeholder.style.display = "flex";
                        }
                      }}
                    />
                    <div
                      className="collection-detail__thumbnail-placeholder"
                      style={{ display: "none" }}
                    >
                      <i className="fas fa-images"></i>
                    </div>
                  </div>
                )}
                {!thumbnailUrl && (
                  <div className="collection-detail__thumbnail">
                    <div className="collection-detail__thumbnail-placeholder">
                      <i className="fas fa-images"></i>
                    </div>
                  </div>
                )}
                <div className="collection-detail__info">
                  <h1 className="collection-detail__title">
                    <i className="fas fa-bookmark"></i>
                    {collection.title || collection.name}
                  </h1>
                  {collection.description && (
                    <p className="collection-detail__description">{collection.description}</p>
                  )}
                  <div className="collection-detail__meta">
                    {/* 컬렉션 제작자 */}
                    {(() => {
                      // 제작자 정보 추출 (다양한 필드명 지원)
                      const creator =
                        collection.creator ||
                        collection.owner ||
                        collection.user ||
                        collection.author ||
                        (collection.userId && { id: collection.userId });

                      // 제작자 이름 추출
                      const creatorName =
                        creator?.nickname ||
                        creator?.username ||
                        creator?.name ||
                        creator?.displayName ||
                        (typeof creator === "string" ? creator : null);

                      // 제작자 정보가 있으면 표시
                      if (creatorName) {
                        return (
                          <span className="collection-detail__creator">
                            <i className="fas fa-user"></i>
                            제작자: {creatorName}
                          </span>
                        );
                      }
                      return null;
                    })()}
                    <span className="collection-detail__count">
                      <i className="fas fa-film"></i>
                      {Array.isArray(contents) ? contents.length : 0}개 작품
                      {totalRuntime > 0 && ` · 총 ${formatRuntime(totalRuntime)}`}
                    </span>
                    {collection.createdAt && (
                      <span className="collection-detail__date">
                        <i className="fas fa-calendar"></i>
                        생성일: {new Date(collection.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 작품 추가 버튼 (제작자만 표시) */}
              {isCreator && (
                <div className="collection-detail__add-content-section">
                  <button
                    className="collection-detail__add-content-btn"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <i className="fas fa-plus"></i>
                    작품 추가
                  </button>
                </div>
              )}

              {/* 작품 목록 */}
              <SectionHeader title="포함된 작품" icon="fas fa-list" />

              {!Array.isArray(contents) || contents.length === 0 ? (
                <div className="collection-empty">
                  <i className="fas fa-inbox"></i>
                  <p>이 컬렉션에 포함된 작품이 없습니다.</p>
                </div>
              ) : (
                <div className="home-popular__grid">
                  {contents.map((content) => (
                    <MovieCard
                      key={content.id || content.tmdbId || content.contentId}
                      movie={content}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 작품 추가 모달 */}
      {isCreator && (
        <AddContentToCollectionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddSuccess={() => {
            // 컬렉션 상세 정보 비동기로 새로고침 (페이지 리로드 없이)
            refetch();
          }}
          collectionId={id}
        />
      )}
    </div>
  );
};

export default CollectionDetailPage;
