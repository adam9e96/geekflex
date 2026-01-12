import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getProfileImageUrl } from "@utils/imageUtils";
import { getAccessToken } from "@utils/auth";
import { useLike } from "@hooks/review/useLike";
import ProfilePopup from "./ProfilePopup";

/**
 * 리뷰 목록 컴포넌트
 * @param {number} contentId - 콘텐츠 ID
 * @param {function} onRefresh - 리뷰 목록 새로고침 트리거
 * @param {boolean} isLoggedIn - 로그인 여부
 */
const ReviewList = ({ contentId, onRefresh, isLoggedIn = false }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); // 답변 중인 리뷰 ID
  const [replyText, setReplyText] = useState("");
  const [currentUserPublicId, setCurrentUserPublicId] = useState(null); // 현재 로그인한 사용자 publicId
  const [editingReviewId, setEditingReviewId] = useState(null); // 수정 중인 리뷰 ID
  const [editRating, setEditRating] = useState(0); // 수정 중인 별점
  const [editComment, setEditComment] = useState(""); // 수정 중인 한줄평
  const [editingReviewType, setEditingReviewType] = useState("BASIC"); // 수정 중인 리뷰 타입
  const [profilePopupOpen, setProfilePopupOpen] = useState(false); // 프로필 팝업 열림 여부
  const [selectedUserPublicId, setSelectedUserPublicId] = useState(null); // 선택된 사용자 publicId
  const [selectedUserData, setSelectedUserData] = useState(null); // 선택된 사용자 기본 데이터

  // 좋아요 기능 훅
  const {
    likedReviews,
    processingLikes,
    checkLikesStatus,
    handleLikeToggle,
    initializeLikesFromReviews,
  } = useLike(isLoggedIn, contentId);

  // 현재 사용자 publicId 가져오기
  useEffect(() => {
    const fetchCurrentUserPublicId = async () => {
      if (!isLoggedIn) {
        setCurrentUserPublicId(null);
        return;
      }

      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          setCurrentUserPublicId(null);
          return;
        }

        // 먼저 /api/v1/users/me/summary 시도
        let response = await fetch("/api/v1/users/me/summary", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("사용자 summary 응답:", data);
          // publicId 우선, 없으면 userId 사용
          if (data.publicId) {
            console.log("현재 사용자 publicId:", data.publicId);
            setCurrentUserPublicId(data.publicId);
            return;
          }
          // publicId가 없으면 /api/v1/users/me 시도
        }

        // /api/v1/users/me에서 publicId 가져오기 시도
        response = await fetch("/api/v1/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("사용자 me 응답:", data);
          // publicId 우선, 없으면 userId 사용
          const publicId = data.publicId || data.userId || null;
          console.log("현재 사용자 publicId (me):", publicId);
          setCurrentUserPublicId(publicId);
        } else {
          setCurrentUserPublicId(null);
        }
      } catch (err) {
        console.error("현재 사용자 publicId 가져오기 실패:", err);
        setCurrentUserPublicId(null);
      }
    };

    fetchCurrentUserPublicId();
  }, [isLoggedIn]);

  // 리뷰 목록 가져오기 함수
  const fetchReviews = useCallback(async () => {
    if (!contentId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("리뷰 목록 요청:", {
        url: `/api/v1/reviews/content/${contentId}`,
      });
      const response = await fetch(`/api/v1/reviews/content/${contentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`리뷰 목록을 불러오는데 실패했습니다: ${response.status}`);
      }

      const data = await response.json();
      const reviewsArray = Array.isArray(data) ? data : [];
      setReviews(reviewsArray);

      // 리뷰 데이터에서 좋아요 정보 초기화
      initializeLikesFromReviews(reviewsArray);

      // 로그인한 사용자의 경우 각 리뷰의 좋아요 상태 확인
      // 에러가 발생해도 리뷰 목록은 표시되도록 별도 처리
      if (isLoggedIn && reviewsArray.length > 0) {
        checkLikesStatus(reviewsArray.map((r) => r.id)).catch((error) => {
          console.error("좋아요 상태 확인 중 오류 발생 (무시됨):", error);
          // 에러가 발생해도 리뷰 목록은 정상적으로 표시
        });
      }
    } catch (err) {
      console.error("리뷰 목록 로딩 실패:", err);
      setError(err.message || "리뷰 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [contentId, isLoggedIn, checkLikesStatus, initializeLikesFromReviews]);

  // 리뷰 목록 가져오기
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, onRefresh]);

  // 리뷰 수정 핸들러
  const handleEdit = (review) => {
    console.log("리뷰 수정:", review.id);

    // 상세 리뷰(DETAILED)는 별도 페이지로 이동
    if (review.reviewType === "DETAILED") {
      navigate(`/movie/${contentId}/review/${review.id}/edit`);
      return;
    }

    // BASIC/SHORT 리뷰는 인라인으로 수정
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
    // 현재 리뷰의 reviewType 저장 (수정 시 사용)
    setEditingReviewType(review.reviewType || "BASIC");
  };

  // 리뷰 수정 취소
  const handleEditCancel = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
    setEditingReviewType("BASIC");
  };

  // 리뷰 수정 제출
  const handleEditSubmit = async (reviewId) => {
    if (editRating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 요청 본문 구성
      const requestBody = {
        rating: editRating,
        reviewType: editingReviewType || "BASIC",
      };

      // 리뷰 타입에 따라 comment 처리
      if (editingReviewType === "SHORT") {
        // SHORT 리뷰는 comment를 포함하지 않음
      } else if (editingReviewType === "BASIC") {
        // BASIC 리뷰는 comment 필수 (빈 문자열이어도 포함)
        requestBody.comment = editComment.trim() || "";
      }

      // PUT /api/v1/reviews/{reviewId} API 호출
      const response = await fetch(`/api/v1/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || "리뷰 수정에 실패했습니다.";
        toast.error(errorMessage);
        return;
      }

      // 수정 성공 시 목록 새로고침
      toast.success("리뷰가 수정되었습니다.");
      handleEditCancel();
      await fetchReviews();
    } catch (err) {
      console.error("리뷰 수정 실패:", err);
      toast.error("리뷰 수정 중 오류가 발생했습니다.");
    }
  };

  // 리뷰 삭제 핸들러
  const handleDelete = async (reviewId) => {
    if (!window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // DELETE /api/v1/reviews/{reviewId} API 호출
      const response = await fetch(`/api/v1/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (response.status === 204) {
        // 삭제 성공 시 목록 새로고침
        toast.success("리뷰가 삭제되었습니다.");
        await fetchReviews();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || "리뷰 삭제에 실패했습니다.";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      toast.error("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  // 답변 작성 핸들러
  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) {
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // TODO: 답변 작성 API 호출
      // POST /api/v1/reviews/{reviewId}/replies
      console.log("답변 작성:", { reviewId, replyText });

      // 임시로 로컬 상태 업데이트 (실제 API 연동 시 제거)
      alert("답변 기능은 곧 구현될 예정입니다.");

      // 답변 작성 후 초기화
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error("답변 작성 실패:", err);
      alert("답변 작성에 실패했습니다.");
    }
  };

  // 날짜 포맷팅
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

  // 리뷰 타입 한글 변환
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

  // 프로필 팝업 열기
  const handleProfileClick = (userPublicId, userData) => {
    if (userPublicId) {
      setSelectedUserPublicId(userPublicId);
      setSelectedUserData({
        nickname: userData.nickname || "사용자",
        profileImage: userData.profileImage || null,
      });
      setProfilePopupOpen(true);
    }
  };

  // 프로필 팝업 닫기
  const handleProfilePopupClose = () => {
    setProfilePopupOpen(false);
    setSelectedUserPublicId(null);
    setSelectedUserData(null);
  };

  if (isLoading) {
    return (
      <div className="review-list">
        <div className="review-list__loading">리뷰를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-list">
        <div className="review-list__error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="review-list">
      <div className="review-list__header">
        <h3 className="review-list__title">
          <i className="fas fa-comments"></i>
          리뷰 ({reviews.length})
        </h3>
      </div>

      {reviews.length === 0 ? (
        <div className="review-list__empty">
          <i className="fas fa-comment-slash"></i>
          <p>아직 등록된 리뷰가 없습니다.</p>
        </div>
      ) : (
        <div className="review-list__items">
          {reviews.map((review) => {
            // 리뷰 응답에서 user 객체 직접 사용
            const user = review.user || {};
            const nickname = user.nickname || "사용자";
            const profileImage = user.profileImage;
            const profileImageUrl = profileImage ? getProfileImageUrl(profileImage) : null;

            // 작성자 확인
            const isOwner =
              isLoggedIn &&
              currentUserPublicId &&
              user.publicId &&
              currentUserPublicId === user.publicId;

            return (
              <div
                key={review.id}
                className={`review-item review-item--${review.reviewType?.toLowerCase() || "basic"}`}
              >
                <div className="review-item__header">
                  <div className="review-item__user">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={nickname}
                        className="review-item__avatar review-item__avatar--clickable"
                        onClick={() => handleProfileClick(user.publicId, user)}
                        onError={(e) => {
                          // 이미지 로드 실패 시 placeholder 표시
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    {/* 프로필 이미지가 null이거나 로드 실패한 경우 대체 이미지 표시 */}
                    <div
                      className="review-item__avatar-placeholder review-item__avatar--clickable"
                      style={{ display: profileImageUrl ? "none" : "flex" }}
                      onClick={() => handleProfileClick(user.publicId, user)}
                    >
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="review-item__user-info">
                      <span
                        className="review-item__nickname review-item__nickname--clickable"
                        onClick={() => handleProfileClick(user.publicId, user)}
                      >
                        {nickname}
                      </span>
                      <span className="review-item__type">
                        {getReviewTypeLabel(review.reviewType)}
                      </span>
                    </div>
                  </div>
                  <div className="review-item__meta">
                    <div className="review-item__rating">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < Math.floor(review.rating) ? "active" : ""}`}
                        ></i>
                      ))}
                      <span className="review-item__rating-value">{review.rating}</span>
                    </div>
                    <div className="review-item__meta-actions">
                      {/* 좋아요 버튼 - 로그인한 경우에만 표시 */}
                      {isLoggedIn && (
                        <button
                          className={`review-item__like-btn ${likedReviews.has(review.id) ? "review-item__like-btn--active" : ""}`}
                          onClick={() => handleLikeToggle(review.id)}
                          disabled={processingLikes.has(review.id)}
                          aria-label={likedReviews.has(review.id) ? "좋아요 취소" : "좋아요"}
                          title={likedReviews.has(review.id) ? "좋아요 취소" : "좋아요"}
                        >
                          <i
                            className={
                              likedReviews.has(review.id) ? "fas fa-heart" : "far fa-heart"
                            }
                          ></i>
                        </button>
                      )}
                      <span className="review-item__date">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* 한줄평 표시 - BASIC 타입 리뷰의 경우만 */}
                {review.reviewType === "BASIC" && review.comment && (
                  <div className="review-item__comment">
                    <p className="review-item__comment-text">{review.comment}</p>
                  </div>
                )}

                {/* SHORT 타입 리뷰는 평점만 표시 (추가 내용 없음) */}

                {/* 수정/삭제 버튼 - 작성자인 경우에만 표시 */}
                {isOwner && (
                  <div className="review-item__actions">
                    {editingReviewId === review.id ? (
                      <>
                        <button className="review-item__edit-cancel-btn" onClick={handleEditCancel}>
                          <i className="fas fa-times"></i>
                          취소
                        </button>
                        <button
                          className="review-item__edit-submit-btn"
                          onClick={() => handleEditSubmit(review.id)}
                          disabled={
                            editRating === 0 ||
                            (editingReviewType === "BASIC" && !editComment.trim())
                          }
                        >
                          <i className="fas fa-check"></i>
                          저장
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="review-item__edit-btn"
                          onClick={() => handleEdit(review)}
                        >
                          <i className="fas fa-edit"></i>
                          수정
                        </button>
                        <button
                          className="review-item__delete-btn"
                          onClick={() => handleDelete(review.id)}
                        >
                          <i className="fas fa-trash"></i>
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* 답변 버튼 - 로그인한 경우에만 표시 (작성자가 아닌 경우) */}
                {isLoggedIn && !isOwner && (
                  <div className="review-item__actions">
                    <button
                      className="review-item__reply-btn"
                      onClick={() => {
                        setReplyingTo(replyingTo === review.id ? null : review.id);
                        setReplyText("");
                      }}
                    >
                      <i className="fas fa-reply"></i>
                      답변
                    </button>
                  </div>
                )}

                {/* 수정 폼 */}
                {editingReviewId === review.id && (
                  <div className="review-item__edit-form">
                    <div className="review-item__edit-rating">
                      <label>별점</label>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star ${star <= editRating ? "active" : ""}`}
                            onClick={() => setEditRating(star)}
                            aria-label={`${star}점`}
                          >
                            <i className="fas fa-star"></i>
                          </button>
                        ))}
                        <span className="rating-text">
                          {editRating > 0 ? `${editRating}점` : "별점을 선택하세요"}
                        </span>
                      </div>
                    </div>
                    {/* BASIC 리뷰일 때만 한줄평 입력 필드 표시 */}
                    {editingReviewType === "BASIC" && (
                      <div className="review-item__edit-comment">
                        <label htmlFor={`edit-comment-${review.id}`}>
                          한줄평 <span style={{ color: "var(--color-error)" }}>*</span>
                        </label>
                        <textarea
                          id={`edit-comment-${review.id}`}
                          className="review-item__edit-comment-input"
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="이 작품에 대한 생각을 한줄로 남겨주세요 (최대 200자, 필수)"
                          maxLength={200}
                          rows={3}
                          required
                        />
                        <div className="char-count">{editComment.length} / 200</div>
                      </div>
                    )}
                  </div>
                )}

                {/* 답변 입력 폼 */}
                {replyingTo === review.id && (
                  <div className="review-item__reply-form">
                    <textarea
                      className="review-item__reply-input"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="답변을 입력하세요..."
                      rows={3}
                    />
                    <div className="review-item__reply-actions">
                      <button
                        className="review-item__reply-cancel"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                      >
                        취소
                      </button>
                      <button
                        className="review-item__reply-submit"
                        onClick={() => handleReplySubmit(review.id)}
                        disabled={!replyText.trim()}
                      >
                        등록
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 프로필 팝업 */}
      <ProfilePopup
        isOpen={profilePopupOpen}
        onClose={handleProfilePopupClose}
        publicId={selectedUserPublicId}
        initialData={selectedUserData}
      />
    </div>
  );
};

export default ReviewList;
