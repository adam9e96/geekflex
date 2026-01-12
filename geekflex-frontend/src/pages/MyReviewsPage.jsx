import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "@utils/auth";
import BackButton from "@components/ui/BackButton";
import "@styles/my-page/my-page.css";

/**
 * 내가 작성한 리뷰 전체 목록 페이지 (페이지네이션)
 */
const MyReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size] = useState(10); // 페이지당 리뷰 개수

  // 내가 작성한 리뷰 목록 가져오기
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

        // 내가 작성한 리뷰 목록 조회
        const response = await fetch(`/api/v1/reviews/me?page=${currentPage}&size=${size}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || errorData.error || "리뷰 목록을 불러오는데 실패했습니다.",
          );
        }

        const data = await response.json();
        console.log("내가 작성한 리뷰 목록 응답:", data);

        // 페이지네이션 응답 처리
        if (data.content) {
          // Spring Boot Page 응답 형식
          setReviews(data.content);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else if (Array.isArray(data)) {
          // 배열 형식 응답 (페이지네이션 없음)
          setReviews(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else {
          setReviews([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } catch (err) {
        console.error("리뷰 목록 로딩 실패:", err);
        setError(err.message || "리뷰 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReviews();
  }, [currentPage, size]);

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

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="my-page-container">
        <div className="my-page-card">
          <div className="my-reviews-page-header">
            <BackButton />
            <h1 className="my-reviews-page-title">
              <i className="fas fa-star"></i> 내가 작성한 리뷰
            </h1>
          </div>
          <div className="my-reviews-container">
            <div className="my-reviews-loading">
              <p>리뷰 목록을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-page-container">
        <div className="my-page-card">
          <div className="my-reviews-page-header">
            <BackButton />
            <h1 className="my-reviews-page-title">
              <i className="fas fa-star"></i> 내가 작성한 리뷰
            </h1>
          </div>
          <div className="my-reviews-container">
            <div className="my-reviews-error">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-page-container">
      <div className="my-page-card">
        <div className="my-reviews-page-header">
          <BackButton />
          <h1 className="my-reviews-page-title">
            <i className="fas fa-star"></i> 내가 작성한 리뷰
          </h1>
        </div>
        <div className="my-reviews-container">
          {reviews.length === 0 ? (
            <div className="my-reviews-empty">
              <p>작성한 리뷰가 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 전체 리뷰 개수 표시 */}
              <div className="my-reviews-page-info">
                <p>전체 {totalElements}개의 리뷰</p>
              </div>

              {/* 리뷰 목록 */}
              <div className="my-reviews-list">
                {reviews.map((review) => (
                  <div
                    key={review.reviewId}
                    className="my-review-item"
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

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="my-reviews-pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <i className="fas fa-chevron-left"></i> 이전
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => {
                      // 현재 페이지 주변 2페이지씩만 표시
                      if (
                        pageNum === 0 ||
                        pageNum === totalPages - 1 ||
                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            className={`page-number ${pageNum === currentPage ? "active" : ""}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                        return (
                          <span key={pageNum} className="page-number-ellipsis">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    다음 <i className="fas fa-chevron-right"></i>
                  </button>

                  <span className="pagination-info">
                    {currentPage + 1} / {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReviewsPage;
