import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserDetail } from "@hooks/user/useUserDetail";
import { getProfileImageUrl } from "@utils/imageUtils";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import BackButton from "@components/ui/BackButton";
import MovieCard from "@components/home/MovieCard";
import SectionHeader from "@components/home/SectionHeader";
import "@styles/user-detail/user-detail.css";

/**
 * 유저 상세 페이지 컴포넌트
 * GET /api/v1/users/{publicId} 요청으로 유저 정보, 리뷰, 컬렉션을 표시
 */
const UserDetailPage = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const { userData, isLoading, error } = useUserDetail(publicId);

  // 리뷰 타입 라벨 변환
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

  // 리뷰 클릭 핸들러
  const handleReviewClick = (review) => {
    const tmdbId = review.tmdbId;
    if (!tmdbId) {
      console.error("TMDB ID를 찾을 수 없습니다:", review);
      return;
    }
    navigate(`/movie/${tmdbId}`);
  };

  // 컬렉션 클릭 핸들러
  const handleCollectionClick = (collectionId) => {
    navigate(`/collection/${collectionId}`);
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="user-detail-page">
        <div className="user-detail-container">
          <BackButton />
          <LoadingSpinner message="유저 정보를 불러오는 중..." />
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error || !userData) {
    return (
      <div className="user-detail-page">
        <div className="user-detail-container">
          <BackButton />
          <div className="user-detail-error">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error || "유저 정보를 불러올 수 없습니다."}</p>
          </div>
        </div>
      </div>
    );
  }

  // 프로필 이미지 URL
  const profileImageUrl = userData.profileImage
    ? getProfileImageUrl(userData.profileImage)
    : null;

  // 가입일 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="user-detail-page">
      <div className="user-detail-container">
        <BackButton />

        {/* 유저 프로필 섹션 */}
        <div className="user-detail-profile">
          <div className="user-detail-profile__image">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={userData.nickname}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="user-detail-profile__image-placeholder"
              style={{ display: profileImageUrl ? "none" : "flex" }}
            >
              {userData.nickname ? (
                <span>{userData.nickname.charAt(0).toUpperCase()}</span>
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
          </div>
          <div className="user-detail-profile__info">
            <h1 className="user-detail-profile__nickname">{userData.nickname}</h1>
            {userData.bio && <p className="user-detail-profile__bio">{userData.bio}</p>}
            <div className="user-detail-profile__meta">
              {userData.joinedAt && (
                <span className="user-detail-profile__joined">
                  <i className="fas fa-calendar"></i>
                  가입일: {formatDate(userData.joinedAt)}
                </span>
              )}
              {userData.activityScore !== undefined && (
                <span className="user-detail-profile__score">
                  <i className="fas fa-fire"></i>
                  활동 점수: {userData.activityScore}
                </span>
              )}
            </div>
            {userData.reviewStats && (
              <div className="user-detail-profile__stats">
                <div className="user-detail-profile__stat-item">
                  <span className="stat-label">리뷰 수</span>
                  <span className="stat-value">{userData.reviewStats.totalReviews || 0}</span>
                </div>
                <div className="user-detail-profile__stat-item">
                  <span className="stat-label">평균 평점</span>
                  <span className="stat-value">
                    {userData.reviewStats.averageRating
                      ? userData.reviewStats.averageRating.toFixed(1)
                      : "0.0"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 리뷰 섹션 */}
        {userData.reviews && userData.reviews.length > 0 && (
          <div className="user-detail-section">
            <SectionHeader
              title={`리뷰 (${userData.reviews.length})`}
              icon="fas fa-star"
            />
            <div className="user-detail-reviews">
              {userData.reviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="user-detail-review-item"
                  onClick={() => handleReviewClick(review)}
                >
                  {review.posterUrl && (
                    <div className="user-detail-review-item__poster">
                      <img
                        src={`https://image.tmdb.org/t/p/w200${review.posterUrl}`}
                        alt={review.title}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="user-detail-review-item__content">
                    <div className="user-detail-review-item__header">
                      <h4 className="user-detail-review-item__title">{review.title}</h4>
                      <span className="user-detail-review-item__type">
                        {getReviewTypeLabel(review.reviewType)}
                      </span>
                    </div>
                    <div className="user-detail-review-item__rating">
                      <i className="fas fa-star"></i>
                      <span>{review.rating}</span>
                    </div>
                    {review.comment && (
                      <p className="user-detail-review-item__comment">{review.comment}</p>
                    )}
                    {review.genre && (
                      <div className="user-detail-review-item__genre">
                        <i className="fas fa-tag"></i>
                        <span>{review.genre}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 컬렉션 섹션 */}
        {userData.collections && userData.collections.length > 0 && (
          <div className="user-detail-section">
            <SectionHeader
              title={`컬렉션 (${userData.collections.length})`}
              icon="fas fa-bookmark"
            />
            <div className="user-detail-collections">
              {userData.collections.map((collection) => (
                <div
                  key={collection.id}
                  className="user-detail-collection-item"
                  onClick={() => handleCollectionClick(collection.id)}
                >
                  <div className="user-detail-collection-item__header">
                    <h4 className="user-detail-collection-item__title">
                      <i className="fas fa-bookmark"></i>
                      {collection.title}
                    </h4>
                  </div>
                  {collection.description && (
                    <p className="user-detail-collection-item__description">
                      {collection.description}
                    </p>
                  )}
                  <div className="user-detail-collection-item__meta">
                    <span className="user-detail-collection-item__count">
                      <i className="fas fa-film"></i>
                      {collection.itemCount || 0}개 작품
                    </span>
                    <span className="user-detail-collection-item__views">
                      <i className="fas fa-eye"></i>
                      {collection.viewCount || 0}회 조회
                    </span>
                    {collection.likeCount !== undefined && (
                      <span className="user-detail-collection-item__likes">
                        <i className="fas fa-heart"></i>
                        {collection.likeCount || 0}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 리뷰와 컬렉션이 모두 없는 경우 */}
        {(!userData.reviews || userData.reviews.length === 0) &&
          (!userData.collections || userData.collections.length === 0) && (
            <div className="user-detail-empty">
              <i className="fas fa-inbox"></i>
              <p>아직 작성한 리뷰나 컬렉션이 없습니다.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default UserDetailPage;

