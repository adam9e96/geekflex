import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCircleExclamation, FaGlobe } from "react-icons/fa6";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import SectionHeader from "@components/home/SectionHeader";
import { useCollectionStore } from "@stores/collectionStore";
import CreateCollectionModal from "@components/content/collections/CreateCollectionModal";
import EditCollectionModal from "@components/content/collections/EditCollectionModal";
import { getAccessToken } from "@utils/auth";
import { getPosterUrl } from "@utils/content/movieUtils";
import "@styles/home/home.css";
import "@components/content/collections/styles/collection-page.css";

/**
 * 작품 컬렉션 목록 페이지 컴포넌트
 * 내 컬렉션과 공개 컬렉션을 구분해서 보여줍니다.
 */
const CollectionPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!getAccessToken();

  // 컬렉션 스토어
  const isCreateModalOpen = useCollectionStore((state) => state.isCreateModalOpen);
  const isEditModalOpen = useCollectionStore((state) => state.isEditModalOpen);
  const editingCollection = useCollectionStore((state) => state.editingCollection);
  const sortBy = useCollectionStore((state) => state.sortBy);
  const myCollections = useCollectionStore((state) => state.myCollections);
  const isLoadingMy = useCollectionStore((state) => state.isLoadingMy);
  const errorMy = useCollectionStore((state) => state.errorMy);
  const publicCollections = useCollectionStore((state) => state.publicCollections);
  const isLoadingPublic = useCollectionStore((state) => state.isLoadingPublic);
  const errorPublic = useCollectionStore((state) => state.errorPublic);

  const openCreateModal = useCollectionStore((state) => state.openCreateModal);
  const closeCreateModal = useCollectionStore((state) => state.closeCreateModal);
  const openEditModal = useCollectionStore((state) => state.openEditModal);
  const closeEditModal = useCollectionStore((state) => state.closeEditModal);
  const setSortBy = useCollectionStore((state) => state.setSortBy);
  const fetchMyCollections = useCollectionStore((state) => state.fetchMyCollections);
  const fetchPublicCollections = useCollectionStore((state) => state.fetchPublicCollections);
  const deleteCollection = useCollectionStore((state) => state.deleteCollection);
  const refetchAll = useCollectionStore((state) => state.refetchAll);

  // 초기 데이터 로드
  useEffect(() => {
    if (isLoggedIn) {
      fetchMyCollections();
    }
    fetchPublicCollections();
  }, [isLoggedIn]);

  // sortBy 변경 시 공개 컬렉션 다시 로드
  useEffect(() => {
    fetchPublicCollections(sortBy, 0, 20);
  }, [sortBy]);

  /**
   * 컬렉션 생성 성공 핸들러
   */
  const handleCreateSuccess = (createdCollection) => {
    fetchMyCollections();
    if (createdCollection.id) {
      setTimeout(() => {
        navigate(`/collections/${createdCollection.id}`);
      }, 500);
    }
  };

  /**
   * 컬렉션 수정 핸들러
   */
  const handleEdit = (e, collection) => {
    e.preventDefault();
    e.stopPropagation();
    openEditModal(collection);
  };

  /**
   * 컬렉션 수정 성공 핸들러
   */
  const handleEditSuccess = () => {
    refetchAll();
  };

  /**
   * 컬렉션 삭제 핸들러
   */
  const handleDelete = async (e, collection) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("정말 이 컬렉션을 삭제하시겠습니까?\n컬렉션에 포함된 작품과 댓글도 함께 삭제됩니다.")) {
      return;
    }

    try {
      await deleteCollection(collection.id);
      alert("컬렉션이 삭제되었습니다.");
    } catch (error) {
      alert(error.message || "컬렉션 삭제에 실패했습니다.");
    }
  };

  /**
   * 컬렉션 썸네일 URL 결정 함수
   * thumbnailUrl이 없으면 첫 번째 작품의 포스터 사용
   */
  const getCollectionThumbnail = (collection) => {
    // thumbnailUrl이 있으면 사용
    if (collection.thumbnailUrl) {
      return collection.thumbnailUrl;
    }

    // 첫 번째 작품 정보 확인 (다양한 필드명 지원)
    const firstItem = 
      collection.firstItem || 
      collection.firstContent || 
      (collection.items && collection.items[0]) ||
      (collection.contents && collection.contents[0]) ||
      (collection.movies && collection.movies[0]);

    if (firstItem) {
      const posterPath = firstItem.posterUrl || firstItem.poster_path || firstItem.posterPath;
      if (posterPath) {
        return getPosterUrl(posterPath);
      }
    }

    return null;
  };

  /**
   * 컬렉션 카드 컴포넌트
   */
  const CollectionCard = ({ collection, isOwner = false }) => {
    const thumbnailUrl = useMemo(() => getCollectionThumbnail(collection), [collection]);

    return (
      <div className="collection-card-wrapper">
        <Link to={`/collections/${collection.id}`} className="collection-card">
          <div className="collection-card__image">
            {thumbnailUrl ? (
              <>
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
                  className="collection-card__placeholder"
                  style={{ display: "none" }}
                >
                  <i className="fas fa-images"></i>
                </div>
              </>
            ) : (
              <div className="collection-card__placeholder">
                <i className="fas fa-images"></i>
              </div>
            )}
          <div className="collection-card__overlay">
            <div className="collection-card__count">
              <i className="fas fa-film"></i>
              <span>{collection.itemCount || collection.contentCount || 0}개 작품</span>
            </div>
            {collection.viewCount !== undefined && (
              <div className="collection-card__views">
                <i className="fas fa-eye"></i>
                <span>{collection.viewCount}</span>
              </div>
            )}
          </div>
        </div>
        <div className="collection-card__info">
          <h3 className="collection-card__title">
            {collection.title || collection.name}
          </h3>
          {collection.description && (
            <p className="collection-card__description">
              {collection.description.length > 100
                ? `${collection.description.substring(0, 100)}...`
                : collection.description}
            </p>
          )}
          <div className="collection-card__meta">
            {collection.author && (
              <span className="collection-card__author">
                <i className="fas fa-user"></i>
                {collection.author.nickname || collection.author.username || "작성자"}
              </span>
            )}
            {collection.createdAt && (
              <span className="collection-card__date">
                <i className="fas fa-calendar"></i>
                {new Date(collection.createdAt).toLocaleDateString("ko-KR")}
              </span>
            )}
          </div>
          </div>
        </Link>
        {isOwner && (
          <div className="collection-card__actions">
            <button
              className="collection-card__edit-btn"
              onClick={(e) => handleEdit(e, collection)}
              title="수정"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              className="collection-card__delete-btn"
              onClick={(e) => handleDelete(e, collection)}
              title="삭제"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="home-page collection-page">
      <section className="home-popular">
        <div className="home-popular__container">
          <div className="collection-page__header">
            <SectionHeader title="작품 컬렉션" icon="fas fa-bookmark" />
            {isLoggedIn && (
              <button
                className="collection-page__create-btn"
                onClick={openCreateModal}
              >
                <i className="fas fa-plus"></i>
                새 컬렉션 만들기
              </button>
            )}
          </div>

          {/* 내 컬렉션 섹션 */}
          {isLoggedIn && (
            <div className="collection-section">
              <div className="collection-section__header">
                <h2 className="collection-section__title">
                  <i className="fas fa-user-circle"></i>
                  내 컬렉션
                </h2>
              </div>
              {isLoadingMy ? (
                <LoadingSpinner message="로딩 중..." className="home-loading" />
              ) : errorMy ? (
                <div className="collection-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <p>{errorMy}</p>
                  {errorMy.includes("로그인이 필요") && (
                    <Link to="/login" className="collection-error__login-link">
                      <i className="fas fa-sign-in-alt"></i>
                      로그인하러 가기
                    </Link>
                  )}
                </div>
              ) : myCollections.length > 0 ? (
                <div className="collection-grid">
                  {myCollections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} isOwner={true} />
                  ))}
                </div>
              ) : (
                <div className="collection-empty">
                  <i className="fas fa-inbox"></i>
                  <p>아직 생성된 컬렉션이 없습니다.</p>
                  <button
                    className="collection-empty__create-btn"
                    onClick={openCreateModal}
                  >
                    <i className="fas fa-plus"></i>
                    첫 컬렉션 만들기
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 공개 컬렉션 섹션 */}
          <div className="collection-section">
            <div className="collection-section__header">
              <h2 className="collection-section__title">
                <FaGlobe className="text-[var(--color-primary)]" />
                공개 컬렉션
              </h2>
              <div className="collection-section__sort">
                <button
                  className={`collection-section__sort-btn ${sortBy === "latest" ? "active" : ""}`}
                  onClick={() => setSortBy("latest")}
                >
                  최신순
                </button>
                <button
                  className={`collection-section__sort-btn ${sortBy === "views" ? "active" : ""}`}
                  onClick={() => setSortBy("views")}
                >
                  조회수순
                </button>
              </div>
            </div>
            {isLoadingPublic ? (
              <LoadingSpinner message="로딩 중..." className="home-loading" />
            ) : errorPublic ? (
              <div className="collection-error flex items-center gap-4">
                <FaCircleExclamation className="text-5xl opacity-70 shrink-0" />
                <p>{errorPublic}</p>
              </div>
            ) : publicCollections.length > 0 ? (
              <div className="collection-grid">
                {publicCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} isOwner={false} />
                ))}
              </div>
            ) : (
              <div className="collection-empty">
                <i className="fas fa-inbox"></i>
                <p>공개 컬렉션이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 컬렉션 생성 모달 */}
      {isLoggedIn && (
        <CreateCollectionModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* 컬렉션 수정 모달 */}
      {isLoggedIn && (
        <EditCollectionModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          collection={editingCollection}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default CollectionPage;
