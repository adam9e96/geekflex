import React from "react";
import PropTypes from "prop-types";
import { FaUser, FaHeart, FaRegHeart, FaEdit, FaTrash, FaReply } from "react-icons/fa";
import { isResourceOwner } from "@utils/authUtils";
import { getProfileImageUrl } from "@utils/imageUtils";
import { useReviewStore } from "@stores/reviewStore";
import { useProfileStore } from "@stores/profileStore";
import StarRating from "@components/review/StarRating/StarRating.jsx";
import ReviewEditForm from "@components/review/ReviewEditForm/ReviewEditForm";
import styles from "./ReviewItem.module.css";

// 날짜 포맷팅 함수 (유틸로 분리하면 더 좋음)
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getReviewTypeLabel = (reviewType) => {
  switch (reviewType) {
    case "BASIC":
      return "기본 리뷰";
    case "SHORT":
      return "짧은 리뷰";
    case "DETAILED":
      return "상세 리뷰";
    default:
      return reviewType;
  }
};

/**
 * 개별 리뷰 아이템 컴포넌트
 */
const ReviewItem = ({
  review,
  isAuthenticated,
  currentUserPublicId,
  likedReviews,
  processingLikes,
  onLikeToggle,
  onEditClick,
  onDeleteClick,
  onEditSubmit,
  // onReplyClick,
  // onReplySubmit,
  // replyState
}) => {
  const user = review.user || {};
  const nickname = user.nickname;
  const { editing } = useReviewStore();
  const { openProfilePopup } = useProfileStore();

  const isOwner = isAuthenticated && isResourceOwner(currentUserPublicId, user);
  const isEditing = editing.reviewId === review.id;

  const profileImageUrl = user.profileImage ? getProfileImageUrl(user.profileImage) : null;

  return (
    <div className={styles.reviewCard}>
      <div className={styles.cardHeader}>
        <div className={styles.userSection}>
          {/* 프로필 이미지 */}
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={nickname}
              className={styles.profileImg}
              onClick={() => openProfilePopup(user.publicId, user)}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          {/* 프로필 이미지 없을 때 fallback */}
          <div
            className={styles.profilePlaceholder}
            style={{ display: profileImageUrl ? "none" : "flex" }}
            onClick={() => openProfilePopup(user.publicId, user)}
          >
            <FaUser />
          </div>

          <div className={styles.userInfo}>
            <span className={styles.nickname} onClick={() => openProfilePopup(user.publicId, user)}>
              {nickname}
            </span>
            <span className={styles.typeBadge}>{getReviewTypeLabel(review.reviewType)}</span>
          </div>
        </div>

        <div className={styles.metaSection}>
          <div className={styles.actionsMeta}>
            <div className={styles.rating}>
              <StarRating rating={review.rating} readonly sizeClass="text-sm" />
              <span className={styles.ratingScore}>{review.rating}</span>
            </div>
          </div>

          <div className={styles.actionsMeta}>
            {isAuthenticated && (
              <button
                className={`${styles.likeBtn} ${
                  likedReviews.has(review.id) ? styles.liked : styles.notLiked
                }`}
                onClick={() => onLikeToggle(review.id)}
                disabled={processingLikes.has(review.id)}
                title={likedReviews.has(review.id) ? "좋아요 취소" : "좋아요"}
              >
                {likedReviews.has(review.id) ? <FaHeart /> : <FaRegHeart />}
              </button>
            )}
            <span className={styles.date}>{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 수정 중일 때는 폼 표시, 아닐 때는 내용 표시 */}
      {isEditing ? (
        <ReviewEditForm onSubmit={onEditSubmit} />
      ) : (
        <>
          {review.reviewType === "BASIC" && review.comment && (
            <div className={styles.commentBox}>
              <p className={styles.commentText}>{review.comment}</p>
            </div>
          )}

          {/* owner actions */}
          {isOwner && (
            <div className={styles.ownerActions}>
              <button
                onClick={() => onEditClick(review)}
                className={`${styles.actionBtn} ${styles.btnEdit}`}
              >
                <FaEdit /> 수정
              </button>
              <button
                onClick={() => onDeleteClick(review.id)}
                className={`${styles.actionBtn} ${styles.btnDelete}`}
              >
                <FaTrash /> 삭제
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

ReviewItem.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.number.isRequired,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string,
    reviewType: PropTypes.string,
    createdAt: PropTypes.string,
    user: PropTypes.shape({
      publicId: PropTypes.string,
      nickname: PropTypes.string,
      profileImage: PropTypes.string,
    }),
  }).isRequired,
  isAuthenticated: PropTypes.bool,
  currentUserPublicId: PropTypes.string,
  likedReviews: PropTypes.instanceOf(Set),
  processingLikes: PropTypes.instanceOf(Set),
  onLikeToggle: PropTypes.func,
  onEditClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onEditSubmit: PropTypes.func,
};

export default ReviewItem;
