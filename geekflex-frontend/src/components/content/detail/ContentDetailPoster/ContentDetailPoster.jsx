import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { getPosterUrl } from "@utils/content/movieUtils";
import { useContentDetailStore } from "@stores/contentDetailStore";
import { useAuthStore } from "@stores/authStore";
import styles from "./ContentDetailPoster.module.css";

/**
 * 콘텐츠 상세 페이지 포스터 컴포넌트
 */
const ContentDetailPoster = () => {
  const { content, likeCount, isLiked, toggleLike } = useContentDetailStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!content) return null;

  const { title, tmdbId: contentId } = content;
  const posterUrl = content.posterPath || content.posterUrl;

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      return;
    }

    if (contentId) {
      toggleLike(contentId);
    }
  };

  return (
    <div className={styles.poster}>
      <div className={styles.wrapper}>
        <img
          src={getPosterUrl(posterUrl)}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750'%3E%3Crect fill='%23ddd' width='500' height='750'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
          }}
        />
        <button
          className={`${styles.favoriteBtn} ${isLiked ? styles.active : ""}`}
          onClick={handleFavoriteToggle}
          disabled={!isAuthenticated}
          aria-label={
            isAuthenticated ? (isLiked ? "찜하기 해제" : "찜하기") : "로그인이 필요합니다"
          }
          title={isAuthenticated ? (isLiked ? "찜하기 해제" : "찜하기") : "로그인이 필요합니다"}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          {likeCount !== undefined && likeCount !== null && (
            <span className={styles.favoriteCount}>{likeCount.toLocaleString()}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContentDetailPoster;
