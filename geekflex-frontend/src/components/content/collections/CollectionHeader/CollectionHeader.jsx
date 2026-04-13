import React from "react";
import PropTypes from "prop-types";
import styles from "./CollectionHeader.module.css";
import { getPosterUrl } from "@utils/content/movieUtils";

const CollectionHeader = ({ collection, totalRuntime, isCreator, onEdit, onDelete }) => {
  if (!collection) return null;

  // 썸네일 URL 결정
  const getThumbnailUrl = () => {
    if (collection.thumbnailUrl) return collection.thumbnailUrl;

    // items 또는 contents에서 첫 번째 이미지 가져오기
    const items = collection.items || collection.contents || collection.movies;
    if (Array.isArray(items) && items.length > 0) {
      const firstItem = items[0];
      const posterPath = firstItem.posterUrl || firstItem.poster_path || firstItem.posterPath;
      if (posterPath) return getPosterUrl(posterPath);
    }
    return null;
  };

  const thumbnailUrl = getThumbnailUrl();

  // 배경 이미지 (첫 번째 아이템의 백드롭이나 포스터)
  const getBackdropUrl = () => {
    const items = collection.items || collection.contents || collection.movies;
    if (Array.isArray(items) && items.length > 0) {
      const firstItem = items[0];
      const backdropPath =
        firstItem.backdrop_path || firstItem.backdropPath || firstItem.poster_path;
      if (backdropPath) return getPosterUrl(backdropPath);
    }
    return thumbnailUrl;
  };

  const backdropUrl = getBackdropUrl();

  // 제작자 이름 및 정보
  const getCreatorName = () => {
    const creator =
      collection.creator ||
      collection.owner ||
      collection.user ||
      collection.author ||
      (collection.userId && { id: collection.userId });

    return (
      creator?.nickname ||
      creator?.username ||
      creator?.name ||
      creator?.displayName ||
      (typeof creator === "string" ? creator : "알 수 없음")
    );
  };

  // 시간 포맷팅
  const formatRuntime = (minutes) => {
    if (!minutes || minutes === 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
    return `${mins}분`;
  };

  const itemCount = Array.isArray(collection.items || collection.contents || collection.movies)
    ? (collection.items || collection.contents || collection.movies).length
    : 0;

  return (
    <div className={styles.header}>
      {backdropUrl && (
        <div className={styles.backdrop} style={{ backgroundImage: `url(${backdropUrl})` }} />
      )}

      <div className={styles.content}>
        <div className={styles.thumbnailContainer}>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={collection.title}
              className={styles.thumbnail}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div className={styles.placeholder} style={{ display: thumbnailUrl ? "none" : "flex" }}>
            <i className="fas fa-film"></i>
          </div>
        </div>

        <div className={styles.info}>
          <h1 className={styles.title}>
            <i className="fas fa-bookmark icon"></i>
            {collection.title || collection.name}
          </h1>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <i className="fas fa-user"></i>
              <span>{getCreatorName()}</span>
            </div>
            <div className={styles.metaItem}>
              <i className="fas fa-layer-group"></i>
              <span>{itemCount}개 작품</span>
            </div>
            {totalRuntime > 0 && (
              <div className={styles.metaItem}>
                <i className="fas fa-clock"></i>
                <span>{formatRuntime(totalRuntime)}</span>
              </div>
            )}
            <div className={styles.metaItem}>
              <i className={`fas ${collection.isPublic ? "fa-globe" : "fa-lock"}`}></i>
              <span>{collection.isPublic ? "공개" : "비공개"}</span>
            </div>
            {collection.createdAt && (
              <div className={styles.metaItem}>
                <i className="fas fa-calendar-alt"></i>
                <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {collection.description && <p className={styles.description}>{collection.description}</p>}

          {isCreator && (
            <div className={styles.managementPanel}>
              <div className={styles.managementLabel}>
                <i className="fas fa-sliders-h"></i>
                <span>컬렉션 관리</span>
              </div>
              <div className={styles.actions}>
                <button onClick={onEdit} className={styles.editBtn} type="button">
                  <i className="fas fa-pen"></i>
                  컬렉션 수정
                </button>
                <button onClick={onDelete} className={styles.deleteBtn} type="button">
                  <i className="fas fa-trash-alt"></i>
                  컬렉션 삭제
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CollectionHeader.propTypes = {
  collection: PropTypes.object,
  totalRuntime: PropTypes.number,
  isCreator: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default CollectionHeader;
