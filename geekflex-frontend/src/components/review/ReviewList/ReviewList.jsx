import React, { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaComments, FaCommentSlash } from "react-icons/fa";
import { FaCircleExclamation } from "react-icons/fa6";

import { useLike } from "@hooks/review/useLike";
import { useReviewStore } from "@stores/reviewStore";
import { useAuthStore } from "@stores/authStore";
import ProfilePopup from "@components/review/ProfilePopup/ProfilePopup.jsx";
import ReviewItem from "@components/review/ReviewItem/ReviewItem.jsx";
import styles from "./ReviewList.module.css";

/**
 * 리뷰 목록 컴포넌트
 * @param {number} contentId - 콘텐츠 ID
 */
const ReviewList = ({ contentId }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Zustand Store 상태 및 액션
  const {
    reviews,
    isLoading,
    error,
    editing,
    currentUserPublicId,
    fetchReviews,
    fetchCurrentUserPublicId,
    startEdit,
    cancelEdit,
    updateReview,
    deleteReview,
  } = useReviewStore();

  // 좋아요 기능 훅
  const {
    likedReviews,
    processingLikes,
    checkLikesStatus,
    handleLikeToggle,
    initializeLikesFromReviews,
  } = useLike(isAuthenticated, contentId);

  // 현재 사용자 publicId 가져오기
  useEffect(() => {
    fetchCurrentUserPublicId(isAuthenticated);
  }, [isAuthenticated, fetchCurrentUserPublicId]);

  // 리뷰 목록 가져오기 및 좋아요 상태 초기화
  const loadReviews = useCallback(async () => {
    const loadedReviews = await fetchReviews(contentId);
    initializeLikesFromReviews(loadedReviews);

    // 로그인한 경우 좋아요 상태 확인
    if (isAuthenticated && loadedReviews.length > 0) {
      checkLikesStatus(loadedReviews.map((r) => r.id)).catch((err) => {
        console.error("좋아요 상태 확인 실패 (무시됨):", err);
      });
    }
  }, [contentId, fetchReviews, initializeLikesFromReviews, isAuthenticated, checkLikesStatus]);

  // 초기 로드 및 새로고침 트리거 시 실행
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // 리뷰 수정 핸들러
  const handleEditClick = (review) => {
    // 상세 리뷰(DETAILED)는 별도 페이지로 이동
    if (review.reviewType === "DETAILED") {
      navigate(`/movie/${contentId}/review/${review.id}/edit`);
      return;
    }
    // BASIC/SHORT 리뷰는 인라인 수정 시작
    startEdit(review);
  };

  // 리뷰 수정 제출
  const handleEditSubmit = async (reviewId) => {
    if (editing.rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    try {
      const updateData = {
        rating: editing.rating,
        reviewType: editing.reviewType || "BASIC",
      };

      if (editing.reviewType === "BASIC") {
        updateData.comment = editing.comment.trim();
      }

      await updateReview(reviewId, updateData);
      toast.success("리뷰가 수정되었습니다.");
      cancelEdit();
      loadReviews(); // 목록 갱신
    } catch (err) {
      console.error("리뷰 수정 실패:", err);
      toast.error(err.message || "리뷰 수정 중 오류가 발생했습니다.");
    }
  };

  // 리뷰 삭제 핸들러
  const handleDeleteClick = async (reviewId) => {
    const result = await Swal.fire({
      title: "리뷰 삭제",
      text: "정말 이 리뷰를 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
      background: "#252525",
      color: "#ffffff",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteReview(reviewId);
      Swal.fire({
        title: "삭제됨",
        text: "리뷰가 삭제되었습니다.",
        icon: "success",
        confirmButtonColor: "#16a34a",
        background: "#252525",
        color: "#ffffff",
      });
      loadReviews(); // 목록 갱신
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      Swal.fire({
        title: "오류 발생",
        text: err.message || "리뷰 삭제 중 오류가 발생했습니다.",
        icon: "error",
        confirmButtonColor: "#dc2626",
        background: "#252525",
        color: "#ffffff",
      });
    }
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>리뷰를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FaCircleExclamation />
        {error}
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FaComments />
          리뷰 ({reviews.length})
        </h3>
      </div>

      {reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <FaCommentSlash />
          <p>아직 등록된 리뷰가 없습니다.</p>
        </div>
      ) : (
        <div className={styles.listContent}>
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              isAuthenticated={isAuthenticated}
              currentUserPublicId={currentUserPublicId}
              likedReviews={likedReviews}
              processingLikes={processingLikes}
              onLikeToggle={handleLikeToggle}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onEditSubmit={handleEditSubmit}
              onReplyClick={() => {}} // 임시 비활성화
            />
          ))}
        </div>
      )}

      <ProfilePopup />
    </div>
  );
};

ReviewList.propTypes = {
  contentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ReviewList;
