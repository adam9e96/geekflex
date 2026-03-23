import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styles from "./CollectionCard.module.css";
import { getPosterUrl } from "@utils/content/movieUtils";

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
const CollectionCard = ({ collection, isOwner, onEdit, onDelete }) => {
  const thumbnailUrl = useMemo(() => getCollectionThumbnail(collection), [collection]);

  return (
    <div className={styles.collectionCardWrapper}>
      <Link to={`/collections/${collection.id}`} className={styles.collectionCard}>
        <div className={styles.collectionCardImage}>
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
              <div className={styles.collectionCardPlaceholder} style={{ display: "none" }}>
                <i className="fas fa-images"></i>
              </div>
            </>
          ) : (
            <div className={styles.collectionCardPlaceholder}>
              <i className="fas fa-images"></i>
            </div>
          )}
          <div className={styles.collectionCardOverlay}>
            <div className={styles.collectionCardCount}>
              <i className="fas fa-film"></i>
              <span>{collection.itemCount || collection.contentCount || 0}개 작품</span>
            </div>
            {collection.viewCount !== undefined && (
              <div className={styles.collectionCardViews}>
                <i className="fas fa-eye"></i>
                <span>{collection.viewCount}</span>
              </div>
            )}
          </div>
        </div>
        <div className={styles.collectionCardInfo}>
          <h3 className={styles.collectionCardTitle}>{collection.title || collection.name}</h3>
          {collection.description && (
            <p className={styles.collectionCardDescription}>
              {collection.description.length > 100
                ? `${collection.description.substring(0, 100)}...`
                : collection.description}
            </p>
          )}
          <div className={styles.collectionCardMeta}>
            {collection.author && (
              <span className={styles.collectionCardAuthor}>
                <i className="fas fa-user"></i>
                {collection.author.nickname || collection.author.username || "작성자"}
              </span>
            )}
            {collection.createdAt && (
              <span className={styles.collectionCardDate}>
                <i className="fas fa-calendar"></i>
                {new Date(collection.createdAt).toLocaleDateString("ko-KR")}
              </span>
            )}
          </div>
        </div>
      </Link>
      {isOwner && (
        <div className={styles.collectionCardActions}>
          <button
            className={styles.collectionCardEditBtn}
            onClick={(e) => {
              e.preventDefault();
              onEdit(e, collection);
            }}
            title="수정"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className={styles.collectionCardDeleteBtn}
            onClick={(e) => {
              e.preventDefault();
              onDelete(e, collection);
            }}
            title="삭제"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
};

CollectionCard.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    itemCount: PropTypes.number,
    contentCount: PropTypes.number,
    viewCount: PropTypes.number,
    createdAt: PropTypes.string,
    firstItem: PropTypes.object,
    firstContent: PropTypes.object,
    items: PropTypes.array,
    contents: PropTypes.array,
    movies: PropTypes.array,
    author: PropTypes.shape({
      nickname: PropTypes.string,
      username: PropTypes.string,
    }),
  }).isRequired,
  isOwner: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

CollectionCard.defaultProps = {
  isOwner: false,
};

export default CollectionCard;
