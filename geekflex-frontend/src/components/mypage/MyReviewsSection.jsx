import React, { useState, useEffect } from "react";
import InfoSection from "./InfoSection";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "@utils/auth";

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
    const fetchMyReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const accessToken = getAccessToken();
        if (!accessToken) {
          setError("로그인이 필요합니다.");
          setIsLoading(false);
          return;
        }

        // 리뷰 목록과 개수를 동시에 가져오기
        const [reviewsResponse, countResponse] = await Promise.all([
          fetch(`/api/v1/reviews/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          }),
          fetch(`/api/v1/reviews/me/count`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          }),
        ]);

        // 리뷰 목록 처리
        if (!reviewsResponse.ok) {
          const errorData = await reviewsResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message || errorData.error || "리뷰 목록을 불러오는데 실패했습니다.",
          );
        }

        const reviewsData = await reviewsResponse.json();
        console.log("내가 작성한 리뷰 목록 응답:", reviewsData);

        // 배열 형태로 직접 반환
        const reviewsArray = Array.isArray(reviewsData) ? reviewsData : [];
        setReviews(reviewsArray);

        // 리뷰 개수 처리
        if (countResponse.ok) {
          const countData = await countResponse.json();
          console.log("내가 작성한 리뷰 개수 응답:", countData);
          setReviewCount(countData.reviewCount || 0);
        } else {
          // 개수 조회 실패해도 목록은 표시
          console.warn("리뷰 개수 조회 실패");
        }
      } catch (err) {
        console.error("리뷰 목록 로딩 실패:", err);
        setError(err.message || "리뷰 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReviews();
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
  }; // handleReviewClick

  // 제목에 개수 포함
  const sectionTitle = reviewCount > 0 ? `내가 작성한 리뷰 (${reviewCount})` : "내가 작성한 리뷰";

  if (isLoading) {
    return (
      <InfoSection title="내가 작성한 리뷰" icon="fas fa-star">
        <div className="my-reviews-container">
          <div className="my-reviews-loading">
            <p>리뷰 목록을 불러오는 중...</p>
          </div>
        </div>
      </InfoSection>
    );
  }

  if (error) {
    return (
      <InfoSection title={sectionTitle} icon="fas fa-star">
        <div className="my-reviews-container">
          <div className="my-reviews-error">
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
      <div className="my-reviews-container">
        {reviews.length === 0 ? (
          <div className="my-reviews-empty">
            <p>작성한 리뷰가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 리뷰 목록 - 가로 스크롤 */}
            <div className="my-reviews-list my-reviews-list--horizontal">
              {displayedReviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="my-review-item my-review-item--horizontal"
                  onClick={() => handleReviewClick(review)}
                >
                  <div className="my-review-item__header">
                    <h4 className="my-review-item__title">{review.title || "제목 없음"}</h4>
                    <span className="my-review-item__type">
                      {getReviewTypeLabel(review.reviewType)}
                    </span>
                  </div>
                  <div className="my-review-item__rating">
                    <i className="fas fa-star"></i>
                    <span>{review.rating}</span>
                  </div>
                  {review.comment && <p className="my-review-item__comment">{review.comment}</p>}
                  {review.genre && (
                    <div className="my-review-item__genre">
                      <i className="fas fa-tag"></i>
                      <span>{review.genre}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* 더보기 버튼 */}
            {hasMoreReviews && (
              <div className="my-reviews-more">
                <button className="my-reviews-more-btn" onClick={() => navigate("/mypage/reviews")}>
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
