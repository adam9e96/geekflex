import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCircleExclamation, FaGlobe } from "react-icons/fa6";
import LoadingSpinner from "@components/ui/LoadingSpinner/LoadingSpinner";
import SectionHeader from "@components/ui/SectionHeader/SectionHeader.jsx";
import { useCollectionStore } from "@stores/collectionStore";
import CreateCollectionModal from "@components/content/collections/CreateCollectionModal/CreateCollectionModal";
import EditCollectionModal from "@components/content/collections/EditCollectionModal/EditCollectionModal";
import CollectionCard from "@components/content/collections/CollectionCard";
import { getAccessToken } from "@utils/auth";
import styles from "./CollectionPage.module.css";

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
  }, [isLoggedIn, fetchMyCollections, fetchPublicCollections]);

  // sortBy 변경 시 공개 컬렉션 다시 로드
  useEffect(() => {
    fetchPublicCollections(sortBy, 0, 20);
  }, [sortBy, fetchPublicCollections]);

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

    if (
      !window.confirm(
        "정말 이 컬렉션을 삭제하시겠습니까?\n컬렉션에 포함된 작품과 댓글도 함께 삭제됩니다.",
      )
    ) {
      return;
    }

    try {
      await deleteCollection(collection.id);
      alert("컬렉션이 삭제되었습니다.");
    } catch (error) {
      alert(error.message || "컬렉션 삭제에 실패했습니다.");
    }
  };

  return (
    <div className={`${styles.pageContainer} ${styles.collectionPage}`}>
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <div className={styles.collectionPageHeader}>
            <SectionHeader title="작품 컬렉션" icon="fas fa-bookmark" />
            {isLoggedIn && (
              <button className={styles.collectionPageCreateBtn} onClick={openCreateModal}>
                <i className="fas fa-plus"></i>새 컬렉션 만들기
              </button>
            )}
          </div>

          {/* 내 컬렉션 섹션 */}
          {isLoggedIn && (
            <div className={styles.collectionSection}>
              <div className={styles.collectionSectionHeader}>
                <h2 className={styles.collectionSectionTitle}>
                  <i className="fas fa-user-circle"></i>내 컬렉션
                </h2>
              </div>
              {isLoadingMy ? (
                <LoadingSpinner message="로딩 중..." className={styles.loading} />
              ) : errorMy ? (
                <div className={styles.collectionError}>
                  <i className="fas fa-exclamation-circle"></i>
                  <p>{errorMy}</p>
                  {errorMy.includes("로그인이 필요") && (
                    <Link to="/login" className={styles.collectionErrorLoginLink}>
                      <i className="fas fa-sign-in-alt"></i>
                      로그인하러 가기
                    </Link>
                  )}
                </div>
              ) : myCollections.length > 0 ? (
                <div className={styles.collectionGrid}>
                  {myCollections.map((collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      isOwner={true}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.collectionEmpty}>
                  <i className="fas fa-inbox"></i>
                  <p>아직 생성된 컬렉션이 없습니다.</p>
                  <button className={styles.collectionEmptyCreateBtn} onClick={openCreateModal}>
                    <i className="fas fa-plus"></i>첫 컬렉션 만들기
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 공개 컬렉션 섹션 */}
          <div className={styles.collectionSection}>
            <div className={styles.collectionSectionHeader}>
              <h2 className={styles.collectionSectionTitle}>
                <FaGlobe className={styles.globeIcon} />
                공개 컬렉션
              </h2>
              <div className={styles.collectionSectionSort}>
                <button
                  className={`${styles.collectionSectionSortBtn} ${sortBy === "latest" ? styles.active : ""}`}
                  onClick={() => setSortBy("latest")}
                >
                  최신순
                </button>
                <button
                  className={`${styles.collectionSectionSortBtn} ${sortBy === "views" ? styles.active : ""}`}
                  onClick={() => setSortBy("views")}
                >
                  조회수순
                </button>
              </div>
            </div>
            {isLoadingPublic ? (
              <LoadingSpinner message="로딩 중..." className={styles.loading} />
            ) : errorPublic ? (
              <div className={`${styles.collectionError} ${styles.collectionErrorFlex}`}>
                <FaCircleExclamation className={styles.exclamationIcon} />
                <p>{errorPublic}</p>
              </div>
            ) : publicCollections.length > 0 ? (
              <div className={styles.collectionGrid}>
                {publicCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    isOwner={false}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.collectionEmpty}>
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
