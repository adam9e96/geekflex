import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaStarHalf, FaPaperPlane, FaCircleExclamation   } from "react-icons/fa6";
import { getAccessToken } from "@utils/auth";
import ReviewList from "@components/review/components/ReviewList";

/**
 * 콘텐츠 리뷰 섹션 컴포넌트
 *
 * 로그인 여부에 따라:
 * - 비로그인: 로그인 유도 박스 표시
 * - 로그인: 별점 + 한줄평 입력 폼 표시
 * 
 * @param {number} tmdbId - TMDB ID (리뷰 작성 API용)
 * @param {number} contentId - Content ID (리뷰 목록 조회용)
 * @param {boolean} isLoggedIn - 로그인 여부
 * @param {number} refreshTrigger - 리뷰 목록 새로고침 트리거
 */
const ContentReviewSection = ({ tmdbId, contentId, isLoggedIn = false, refreshTrigger = 0 }) => {
  const [rating, setRating] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0); // 내부 리뷰 작성 시 새로고침 트리거
  const starContainerRef = useRef(null);

  // 별점 계산 (드래그 위치 기반)
  const calculateRating = (clientX) => {
    if (!starContainerRef.current) return 0;

    const container = starContainerRef.current;
    const stars = container.querySelectorAll('.star');
    
    if (stars.length === 0) return 0;

    // 컨테이너의 위치를 기준으로 계산 (스크롤 위치 고려)
    const containerRect = container.getBoundingClientRect();
    const startX = containerRect.left;
    const endX = containerRect.right;
    const totalWidth = endX - startX;
    
    if (totalWidth <= 0) return 0;
    
    // 마우스 위치를 컨테이너 기준으로 변환
    const x = clientX - startX;
    const percentage = Math.max(0, Math.min(1, x / totalWidth));
    
    // 0.5점 단위로 계산 (0 ~ 5점)
    // 오른쪽 끝 근처(95% 이상)에서는 5.0을 반환
    if (percentage >= 0.95) {
      return 5.0;
    }
    
    // 그 외의 경우 0.5 단위로 계산
    const calculatedRating = Math.floor(percentage * 10) / 2;
    return Math.max(0, Math.min(5, calculatedRating));
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const newRating = calculateRating(e.clientX);
    setRating(newRating);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newRating = calculateRating(e.clientX);
      setRating(newRating);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 클릭 이벤트 핸들러
  const handleClick = (e) => {
    const newRating = calculateRating(e.clientX);
    setRating(newRating);
  };

  // 별 렌더링 (0.5점 단위 지원)
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const starRating = i;
      const isFilled = rating >= starRating;
      const isHalfFilled = rating >= starRating - 0.5 && rating < starRating;

      stars.push(
        <div
          key={i}
          className={`star ${isFilled ? "active" : ""} ${isHalfFilled ? "half-filled" : ""}`}
        >
          {isHalfFilled ? <FaStarHalf /> : <FaStar />}
        </div>
      );
    }
    return stars;
  };

  // 리뷰 제출 (평점 + 한줄평)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setSubmitError("별점을 선택해주세요.");
      return;
    }

    // 한줄평 필수 검증
    if (!comment || !comment.trim()) {
      setSubmitError("한줄평을 작성해주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // POST /api/v1/reviews/{tmdbId} 요청
      const accessToken = getAccessToken();

      if (!accessToken) {
        setSubmitError("로그인이 필요합니다.");
        setIsSubmitting(false);
        return;
      }

      const requestBody = {
        rating: rating,
        reviewType: "BASIC", // 평점+한줄평은 BASIC 타입
        comment: comment.trim(),
      };

      if (!tmdbId) {
        setSubmitError("TMDB ID를 찾을 수 없습니다.");
        setIsSubmitting(false);
        return;
      }

      console.log("베이직 리뷰 작성 요청:", {
        url: `/api/v1/reviews/${tmdbId}`,
        body: requestBody,
      });

      const response = await fetch(`/api/v1/reviews/${tmdbId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || "리뷰 등록에 실패했습니다.";

        // 이미 리뷰가 존재하는 경우
        if (response.status === 400) {
          setSubmitError(errorMessage);
          return;
        }

        // 인증 오류
        if (response.status === 401 || response.status === 403) {
          setSubmitError("로그인이 필요합니다.");
          return;
        }

        throw new Error(errorMessage);
      }

      const reviewData = await response.json();
      console.log("베이직 리뷰 작성 성공:", reviewData);

      // 성공 후 초기화
      setRating(0);
      setComment("");
      setSubmitError("");

      // 리뷰 목록 새로고침
      setInternalRefreshTrigger((prev) => prev + 1);

      // 성공 메시지 (선택사항)
      // alert("리뷰가 등록되었습니다!");
    } catch (err) {
      setSubmitError(err.message || "리뷰 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
      console.error("베이직 리뷰 등록 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-section bg-red-300 pt-10! mt-2!">
      <h2 className="review-section__title">
        <FaStar />
        리뷰 작성
      </h2>

      {/* 리뷰 작성 폼 - 로그인 여부에 따라 다르게 표시 */}
      {!isLoggedIn ? (
        <div className="review-login-required">
          <i className="fas fa-lock"></i>
          <p>리뷰를 작성하려면 로그인이 필요합니다</p>
          <Link to="/login" className="review-login-btn">
            <i className="fas fa-sign-in-alt"></i>
            로그인하기
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="review-form ">
          {/* 별점 선택 */}
          <div className="review-form__rating gap-2 flex flex-col">
            <label className="text-lg font-bold">별점</label>
            <div className="star-rating">
              <div
                ref={starContainerRef}
                className="star-rating__stars p-2 gap-2 flex items-center justify-start"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
                style={{ cursor: isDragging ? "grabbing" : "grab", userSelect: "none" }}
              >
                {renderStars()}
              </div>
              <span className="rating-text flex items-center min-w-30 whitespace-nowrap text-lg font-bold">
                {rating > 0 ? `${rating.toFixed(1)}점` : "별점을 선택하세요"}
              </span>
            </div>
          </div>

          {/* 한줄평 입력 (필수) */}
          <div className="review-form__comment">
            <label htmlFor="comment" className="text-lg font-bold">
              한줄평 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="이 작품에 대한 생각을 한줄로 남겨주세요 (최대 200자, 필수)"
              maxLength={200}
              rows={3}
              required
              className=" m-2 p-2 border rounded-md"
            />
            <div className="char-count">{comment.length} / 200</div>
          </div>

          {/* 에러 메시지 */}
          {submitError && (
            <div className="review-form__error">
              <FaCircleExclamation className="text-red-500" />
              {submitError}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="review-submit-btn"
            disabled={isSubmitting || rating === 0 || !comment || !comment.trim()}
          >
            {isSubmitting ? (
              <>
                <FaSpinner />
                등록 중...
              </>
            ) : (
              <>
                <FaPaperPlane />
                <span className="text-lg font-bold">리뷰 등록</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* 리뷰 목록 - 로그인 여부와 관계없이 항상 표시 */}
      <ReviewList
        contentId={contentId}
        onRefresh={refreshTrigger || internalRefreshTrigger}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
};

export default ContentReviewSection;

