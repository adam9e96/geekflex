import React, { useState, useEffect } from "react";
import styles from "./MyReviewsSection.module.css";
import InfoSection from "../InfoSection/InfoSection";
import { useNavigate } from "react-router-dom";
import * as reviewService from "@services/reviewService";

/**
 * 내가 작성한 리뷰 목록 섹션 컴포넌트
 */
const MyReviewsSection = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 내가 작성한 리뷰 목록 및 개수 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 리뷰 목록과 개수를 동시에 가져오기
        const [reviewsData, countData] = await Promise.all([
          reviewService.fetchMyReviews(),
          reviewService.fetchMyReviewsCount().catch((err) => {
            console.warn("리뷰 개수 조회 실패", err);
            return { reviewCount: 0 };
          }),
        ]);

        // 배열 형태로 직접 반환
        const reviewsArray = Array.isArray(reviewsData) ? reviewsData : [];
        setReviews(reviewsArray);
        setReviewCount(countData.reviewCount || 0);
      } catch (err) {
        console.error("리뷰 목록 로딩 실패:", err);
        setError(err.message || "리뷰 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

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
    // tmdbId 사용 (콘텐츠 상세 페이지는 tmdbId로 접근)
    const tmdbId = review.tmdbId;
    if (!tmdbId) {
      console.error("TMDB ID를 찾을 수 없습니다:", review);
      return;
    }

    // 상세 리뷰는 수정 페이지로, 나머지는 콘텐츠 상세 페이지로 이동
    if (review.reviewType === "DETAILED") {
      navigate(`/movie/${tmdbId}/review/${review.reviewId}/edit`);
    } else {
      navigate(`/movie/${tmdbId}`);
    }
  };

  // 제목에 개수 포함
  const sectionTitle = reviewCount > 0 ? `내가 작성한 리뷰 (${reviewCount})` : "내가 작성한 리뷰";

  if (isLoading) {
    return (
      <InfoSection title="내가 작성한 리뷰" icon="fas fa-star">
        <div className={styles.container}>
          <div className={styles.loading}>
            <p>리뷰 목록을 불러오는 중...</p>
          </div>
        </div>
      </InfoSection>
    );
  }

  if (error) {
    return (
      <InfoSection title={sectionTitle} icon="fas fa-star">
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        </div>
      </InfoSection>
    );
  }

  // 표시할 리뷰 개수 제한 (5개)
  const displayedReviews = reviews.slice(0, 5);
  const hasMoreReviews = reviews.length > 5;

  return (
    <InfoSection title={sectionTitle} icon="fas fa-star">
      <div className={styles.container}>
        {reviews.length === 0 ? (
          <div className={styles.empty}>
            <p>작성한 리뷰가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 리뷰 목록 - 가로 스크롤 */}
            <div className={styles.listHorizontal}>
              {displayedReviews.map((review) => (
                <div
                  key={review.reviewId}
                  className={styles.itemHorizontal}
                  onClick={() => handleReviewClick(review)}
                >
                  <div className={styles.itemHeader}>
                    <h4 className={styles.itemTitle}>{review.title || "제목 없음"}</h4>
                    <span className={styles.itemType}>{getReviewTypeLabel(review.reviewType)}</span>
                  </div>
                  <div className={styles.itemRating}>
                    <i className="fas fa-star"></i>
                    <span>{review.rating}</span>
                  </div>
                  {review.comment && <p className={styles.itemComment}>{review.comment}</p>}
                  {review.genre && (
                    <div className={styles.itemGenre}>
                      <i className="fas fa-tag"></i>
                      <span>{review.genre}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* 더보기 버튼 */}
            {hasMoreReviews && (
              <div className={styles.more}>
                <button className={styles.moreBtn} onClick={() => navigate("/mypage/reviews")}>
                  더보기 <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </InfoSection>
  );
};

export default MyReviewsSection;
