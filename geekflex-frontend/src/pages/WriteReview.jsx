import React, { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import useContentDetail from "@hooks/content/useContentDetail";
import StarRating from "@components/review/components/StarRating";
import { getAccessToken } from "@utils/auth";
import { getPosterUrl } from "@utils/content/movieUtils";
import "@styles/review/review.css";

/**
 * 상세 리뷰 작성 페이지 컴포넌트
 * 영화 또는 TV에 대한 상세 리뷰를 작성할 수 있는 페이지
 */
const WriteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL 경로에서 콘텐츠 타입 감지 (/movie/ 또는 /tv/)
  const contentType = location.pathname.includes("/tv/") ? "tv" : "movie";
  
  const { content, isLoading, error } = useContentDetail(id, contentType);
  const fileInputRef = useRef(null);

  // 폼 상태
  const [watchedDate, setWatchedDate] = useState("");
  const [rating, setRating] = useState(0);
  const [recommendedPoints, setRecommendedPoints] = useState({
    story: false,
    visualEffects: false,
    actionOst: false,
    acting: false,
  });
  const [hasEndingCredits, setHasEndingCredits] = useState(false);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // 콘텐츠 정보 로딩 중
  if (isLoading) {
    return <LoadingSpinner message="콘텐츠 정보를 불러오는 중..." className="review-loading" />;
  }

  // 에러 발생
  if (error) {
    return <ErrorMessage message={error} className="review-error" />;
  }

  // 콘텐츠 정보 없음
  if (!content) {
    return <ErrorMessage message="콘텐츠 정보를 찾을 수 없습니다." className="review-error" />;
  }

  // 강추 포인트 체크박스 핸들러
  const handleRecommendedPointChange = (point) => {
    setRecommendedPoints((prev) => ({
      ...prev,
      [point]: !prev[point],
    }));
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    files.forEach((file) => {
      // 파일 타입 검사
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        setSubmitError("JPG, PNG 파일만 업로드 가능합니다.");
        return;
      }

      // 파일 크기 검사
      if (file.size > maxSize) {
        setSubmitError(`${file.name} 파일 크기가 10MB를 초과합니다.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setUploadedImages((prev) => [...prev, ...validFiles]);
      setSubmitError("");
    }
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 리뷰 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!watchedDate) {
      setSubmitError("감상한 날짜를 선택해주세요.");
      return;
    }

    if (rating === 0) {
      setSubmitError("평점을 선택해주세요.");
      return;
    }

    if (!reviewContent.trim()) {
      setSubmitError("리뷰 내용을 입력해주세요.");
      return;
    }

    if (reviewContent.length > 5000) {
      setSubmitError("리뷰 내용은 5000자 이하여야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const accessToken = getAccessToken();

      if (!accessToken) {
        setSubmitError("로그인이 필요합니다.");
        setIsSubmitting(false);
        return;
      }

      // FormData 생성
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("reviewType", "DETAILED");
      formData.append("watchedDate", watchedDate);
      formData.append("reviewContent", reviewContent);

      if (reviewTitle.trim()) {
        formData.append("reviewTitle", reviewTitle);
      }

      // 강추 포인트 배열 생성
      const points = [];
      if (recommendedPoints.story) points.push("STORY");
      if (recommendedPoints.visualEffects) points.push("VISUAL_EFFECTS");
      if (recommendedPoints.actionOst) points.push("ACTION_OST");
      if (recommendedPoints.acting) points.push("ACTING");
      if (points.length > 0) {
        formData.append("recommendedPoints", JSON.stringify(points));
      }

      formData.append("hasEndingCredits", hasEndingCredits);

      // 이미지 파일 추가
      uploadedImages.forEach((file) => {
        formData.append(`images`, file);
      });

      console.log("리뷰 작성 요청:", {
        url: `/api/v1/reviews/${id}`,
        rating,
        watchedDate,
        reviewTitle,
        reviewContent: reviewContent.substring(0, 50) + "...",
        recommendedPoints: points,
        hasEndingCredits,
        imageCount: uploadedImages.length,
      });

      const response = await fetch(`/api/v1/reviews/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || "리뷰 작성에 실패했습니다.";

        if (response.status === 400) {
          setSubmitError(errorMessage);
          setIsSubmitting(false);
          return;
        }

        if (response.status === 401 || response.status === 403) {
          setSubmitError("로그인이 필요합니다.");
          setIsSubmitting(false);
          return;
        }

        throw new Error(errorMessage);
      }

      const reviewData = await response.json();
      console.log("리뷰 작성 성공:", reviewData);

      // 성공 시 콘텐츠 상세 페이지로 이동
      navigate(`/${contentType}/${id}`, { replace: true });
    } catch (err) {
      setSubmitError(err.message || "리뷰 작성 중 오류가 발생했습니다. 다시 시도해주세요.");
      console.error("리뷰 작성 오류:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate(`/${contentType}/${id}`);
  };

  // 콘텐츠 메타 정보 포맷팅
  const formatMeta = () => {
    const parts = [];
    if (content.releaseDate || content.release_date) {
      const date = content.releaseDate || content.release_date;
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      parts.push(`${year}.${month}.${day}`);
    }
    if (content.runtime) {
      parts.push(`${content.runtime}분`);
    }
    if (content.genres && content.genres.length > 0) {
      const genreNames = content.genres.map((g) => (typeof g === "string" ? g : g.name));
      parts.push(genreNames.join(", "));
    }
    return parts.join(" · ");
  };

  return (
    <div className="review-write">
      <div className="review-write__container">
        {/* 콘텐츠 정보 카드 */}
        <div className="review-write__movie-card">
          <div className="review-write__movie-poster">
            <img
              src={getPosterUrl(content.poster_path || content.posterPath)}
              alt={content.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/500x750?text=No+Image";
              }}
            />
          </div>
          <div className="review-write__movie-info">
            <h1 className="review-write__movie-title">{content.title}</h1>
            {content.original_title && content.original_title !== content.title && (
              <p className="review-write__movie-original-title">{content.original_title}</p>
            )}
            <div className="review-write__movie-rating">
              <i className="fas fa-star"></i>
              <span>{(content.vote_average || content.voteAverage || 0).toFixed(1)} TMDB</span>
            </div>
            <p className="review-write__movie-meta">{formatMeta()}</p>
          </div>
        </div>

        {/* 상세 리뷰 폼 */}
        <div className="review-write__form-container">
          <div className="review-write__form-header">
            <h2 className="review-write__form-title">상세 리뷰</h2>
            <p className="review-write__form-subtitle">작품에 대한 깊이 있는 생각을 공유해주세요</p>
          </div>

          <form className="review-write__form" onSubmit={handleSubmit}>
            {/* 감상한 날짜 */}
            <div className="review-write__section">
              <label className="review-write__label">
                감상한 날짜 <span className="review-write__required">*</span>
              </label>
              <div className="review-write__date-input-wrapper">
                <input
                  type="date"
                  className="review-write__date-input"
                  value={watchedDate}
                  onChange={(e) => setWatchedDate(e.target.value)}
                  required
                />
                <i className="fas fa-calendar-alt review-write__date-icon"></i>
              </div>
            </div>

            {/* 평점 */}
            <div className="review-write__section">
              <label className="review-write__label">
                평점 <span className="review-write__required">*</span>
              </label>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            {/* 강추 포인트 */}
            <div className="review-write__section">
              <label className="review-write__label">
                강추 포인트 <span className="review-write__optional">(선택)</span>
              </label>
              <div className="review-write__checkbox-group">
                <label className="review-write__checkbox-label">
                  <input
                    type="checkbox"
                    checked={recommendedPoints.story}
                    onChange={() => handleRecommendedPointChange("story")}
                  />
                  <span>스토리</span>
                </label>
                <label className="review-write__checkbox-label">
                  <input
                    type="checkbox"
                    checked={recommendedPoints.visualEffects}
                    onChange={() => handleRecommendedPointChange("visualEffects")}
                  />
                  <span>시각효과</span>
                </label>
                <label className="review-write__checkbox-label">
                  <input
                    type="checkbox"
                    checked={recommendedPoints.actionOst}
                    onChange={() => handleRecommendedPointChange("actionOst")}
                  />
                  <span>액션 OST</span>
                </label>
                <label className="review-write__checkbox-label">
                  <input
                    type="checkbox"
                    checked={recommendedPoints.acting}
                    onChange={() => handleRecommendedPointChange("acting")}
                  />
                  <span>배우연기</span>
                </label>
              </div>
            </div>

            {/* 엔딩 크레딧 */}
            <div className="review-write__section">
              <label className="review-write__label">
                엔딩 크레딧 <span className="review-write__optional">(선택)</span>
              </label>
              <div className="review-write__toggle-wrapper">
                <span className="review-write__toggle-label">엔딩 크레딧이 있나요?</span>
                <label className="review-write__toggle">
                  <input
                    type="checkbox"
                    checked={hasEndingCredits}
                    onChange={(e) => setHasEndingCredits(e.target.checked)}
                  />
                  <span className="review-write__toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* 리뷰 제목 */}
            <div className="review-write__section">
              <label className="review-write__label">
                리뷰 제목 <span className="review-write__optional">(선택)</span>
              </label>
              <input
                type="text"
                className="review-write__input"
                placeholder="리뷰의 제목을 입력해주세요"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* 리뷰 내용 */}
            <div className="review-write__section">
              <label className="review-write__label">
                리뷰 내용 <span className="review-write__required">*</span>
              </label>
              <textarea
                className="review-write__textarea"
                placeholder="이 작품에 대한 깊이 있는 생각을 자유롭게 표현해주세요.&#10;&#10;- 작품의 어떤 점이 인상 깊었나요?&#10;- 연출, 연기, 스토리 등 어떤 부분이 좋았거나 아쉬웠나요?&#10;- 다른 관객들에게 이 작품을 추천하고 싶은 이유는 무엇인가요?"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                maxLength={5000}
                required
              />
              <div className="review-write__char-count">{reviewContent.length}/5,000자</div>
            </div>

            {/* 안내 문구 */}
            <div className="review-write__notice">
              <i className="fas fa-info-circle"></i>
              <span>
                ① 타인에 대한 비방, 욕설, 스포일러 등 부적절한 내용은 관리자에 의해 삭제될 수
                있습니다.
              </span>
            </div>

            {/* 사진 업로드 */}
            <div className="review-write__section">
              <label className="review-write__label">
                사진 업로드 <span className="review-write__optional">(선택)</span>
              </label>
              <div className="review-write__upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handleFileUpload}
                  className="review-write__file-input"
                />
                <div
                  className="review-write__upload-placeholder"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fas fa-arrow-up review-write__upload-icon"></i>
                  <p className="review-write__upload-text">클릭하여 사진을 업로드하세요</p>
                  <p className="review-write__upload-hint">JPG, PNG 파일 (최대 10MB)</p>
                </div>
              </div>

              {/* 업로드된 이미지 미리보기 */}
              {uploadedImages.length > 0 && (
                <div className="review-write__image-preview-list">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="review-write__image-preview">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`미리보기 ${index + 1}`}
                        className="review-write__image-preview-img"
                      />
                      <button
                        type="button"
                        className="review-write__image-remove"
                        onClick={() => handleImageRemove(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 에러 메시지 */}
            {submitError && (
              <div className="review-write__error">
                <i className="fas fa-exclamation-circle"></i>
                {submitError}
              </div>
            )}

            {/* 버튼 */}
            <div className="review-write__actions">
              <button
                type="button"
                className="review-write__btn review-write__btn--cancel"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="review-write__btn review-write__btn--submit"
                disabled={isSubmitting || !watchedDate || rating === 0 || !reviewContent.trim()}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    등록 중...
                  </>
                ) : (
                  "리뷰 등록"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;

