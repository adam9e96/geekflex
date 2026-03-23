import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserDetail } from "@hooks/user/useUserDetail";
import { getProfileImageUrl } from "@utils/imageUtils";
import LoadingSpinner from "@components/ui/LoadingSpinner/LoadingSpinner";
import BackButton from "@components/ui/BackButton/BackButton";
import SectionHeader from "@components/ui/SectionHeader/SectionHeader.jsx";
import styles from "./UserDetailPage.module.css";

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
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <BackButton />
          <div className={styles.loading}>
            <LoadingSpinner message="유저 정보를 불러오는 중..." />
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error || !userData) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <BackButton />
          <div className={styles.error}>
            <i className="fas fa-exclamation-circle"></i>
            <p>{error || "유저 정보를 불러올 수 없습니다."}</p>
          </div>
        </div>
      </div>
    );
  }

  // 프로필 이미지 URL
  const profileImageUrl = userData.profileImage ? getProfileImageUrl(userData.profileImage) : null;

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
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <BackButton />

        {/* 유저 프로필 섹션 */}
        <div className={styles.profile}>
          <div className={styles.profileImageWrapper}>
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={userData.nickname}
                className={styles.profileImage}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={styles.profilePlaceholder}
              style={{ display: profileImageUrl ? "none" : "flex" }}
            >
              {userData.nickname ? (
                <span>{userData.nickname.charAt(0).toUpperCase()}</span>
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.nickname}>{userData.nickname}</h1>
            {userData.bio && <p className={styles.bio}>{userData.bio}</p>}
            <div className={styles.meta}>
              {userData.joinedAt && (
                <span className={styles.metaItem}>
                  <i className="fas fa-calendar"></i>
                  가입일: {formatDate(userData.joinedAt)}
                </span>
              )}
              {userData.activityScore !== undefined && (
                <span className={styles.metaItem}>
                  <i className="fas fa-fire"></i>
                  활동 점수: {userData.activityScore}
                </span>
              )}
            </div>
            {userData.reviewStats && (
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>리뷰 수</span>
                  <span className={styles.statValue}>{userData.reviewStats.totalReviews || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>평균 평점</span>
                  <span className={styles.statValue}>
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
          <div className={styles.section}>
            <SectionHeader title={`리뷰 (${userData.reviews.length})`} icon="fas fa-star" />
            <div className={styles.reviews}>
              {userData.reviews.map((review) => (
                <div
                  key={review.reviewId}
                  className={styles.reviewItem}
                  onClick={() => handleReviewClick(review)}
                >
                  {review.posterUrl && (
                    <div className={styles.poster}>
                      <img
                        src={`https://image.tmdb.org/t/p/w200${review.posterUrl}`}
                        alt={review.title}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className={styles.content}>
                    <div className={styles.itemHeader}>
                      <h4 className={styles.itemTitle}>{review.title}</h4>
                      <span className={styles.itemType}>
                        {getReviewTypeLabel(review.reviewType)}
                      </span>
                    </div>
                    <div className={styles.rating}>
                      <i className="fas fa-star"></i>
                      <span>{review.rating}</span>
                    </div>
                    {review.comment && <p className={styles.comment}>{review.comment}</p>}
                    {review.genre && (
                      <div className={styles.genre}>
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
          <div className={styles.section}>
            <SectionHeader
              title={`컬렉션 (${userData.collections.length})`}
              icon="fas fa-bookmark"
            />
            <div className={styles.collections}>
              {userData.collections.map((collection) => (
                <div
                  key={collection.id}
                  className={styles.collectionItem}
                  onClick={() => handleCollectionClick(collection.id)}
                >
                  <div className={styles.content}>
                    <div className={styles.itemHeader}>
                      <h4 className={styles.itemTitle}>
                        <i className="fas fa-bookmark"></i>
                        {collection.title}
                      </h4>
                    </div>
                    {collection.description && (
                      <p className={styles.description}>{collection.description}</p>
                    )}
                    <div className={styles.collectionMeta}>
                      <span className={styles.metaItem}>
                        <i className="fas fa-film"></i>
                        {collection.itemCount || 0}개 작품
                      </span>
                      <span className={styles.metaItem}>
                        <i className="fas fa-eye"></i>
                        {collection.viewCount || 0}회 조회
                      </span>
                      {collection.likeCount !== undefined && (
                        <span className={styles.metaItem}>
                          <i className="fas fa-heart"></i>
                          {collection.likeCount || 0}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 리뷰와 컬렉션이 모두 없는 경우 */}
        {(!userData.reviews || userData.reviews.length === 0) &&
          (!userData.collections || userData.collections.length === 0) && (
            <div className={styles.empty}>
              <i className="fas fa-inbox"></i>
              <p>아직 작성한 리뷰나 컬렉션이 없습니다.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default UserDetailPage;
