import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaFolderPlus, FaShare } from "react-icons/fa";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import BackButton from "@components/ui/BackButton";
import ContentDetailPoster from "@components/content/detail/ContentDetailPoster";
import TvDetailInfo from "@components/content/detail/TvDetailInfo";
import ContentReviewSection from "@components/content/detail/ContentReviewSection";
import AddToCollectionModal from "@components/content/detail/AddToCollectionModal";

import { useAuthStore } from "@stores/authStore";
import { useContentDetailStore } from "@stores/contentDetailStore";

// CSS는 컴포넌트 import 이후에 로드하여 Tailwind가 나중에 적용되도록 함
import "@components/content/detail/styles/content-detail.css";
import "@components/content/detail/styles/review-section.css";

/**
 * TV 상세 페이지 컴포넌트
 *
 * 입력: URL 파라미터로부터 콘텐츠 ID (id)
 * 처리:
 *  1. URL에서 콘텐츠 ID를 추출
 *  2. useContentDetailStore를 사용하여 TV 콘텐츠 데이터를 가져옴
 *  3. 로딩/에러 상태에 따라 적절한 UI를 표시
 *  4. 데이터가 있으면 포스터와 정보를 표시
 * 반환: TV 콘텐츠 상세 페이지 JSX 요소
 */
const TvDetail = () => {
  const { id } = useParams(); // URL 파라미터에서 콘텐츠 ID 추출

  // Zustand 스토어에서 상태 가져오기 (개별적으로 선택하여 무한 루프 방지)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const content = useContentDetailStore((state) => state.content);
  const isLoading = useContentDetailStore((state) => state.isLoading);
  const error = useContentDetailStore((state) => state.error);
  const likeCount = useContentDetailStore((state) => state.likeCount);
  const fetchContentDetail = useContentDetailStore((state) => state.fetchContentDetail);

  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  // TV 콘텐츠 상세 정보 가져오기
  useEffect(() => {
    if (id) {
      fetchContentDetail(id, "tv");
    }
  }, [id, fetchContentDetail]);

  // 장르 처리: TV API는 genre(문자열, 쉼표 구분) 또는 genres(배열)로 올 수 있음
  const genres = useMemo(() => {
    if (!content) return null;
    // genres 배열이 있으면 그대로 사용
    if (Array.isArray(content.genres) && content.genres.length > 0) {
      return content.genres;
    }
    // genre 문자열이 있으면 파싱해서 배열로 변환 (TV의 경우)
    if (content.genre && typeof content.genre === "string") {
      return content.genre
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0)
        .map((name, index) => ({ id: index, name }));
    }
    // 기본값: content.genres 그대로 사용 (없으면 null)
    return content.genres || null;
  }, [content]);

  // contentId 추출: 여러 필드명 확인 (contentId, id, content_id)
  const contentId = useMemo(() => {
    if (!content) return null;
    return content.contentId || content.id || content.content_id || null;
  }, [content]);

  const handleReviewSuccess = () => {
    // 리뷰 등록 성공 시 리뷰 목록 새로고침
    setReviewRefreshTrigger((prev) => prev + 1);
  };

  /**
   * 공유 기능 - URL 복사
   */
  const handleShare = async () => {
    const url = window.location.href;
    const title = content?.name || content?.title || "작품 상세";

    // Web Share API 지원 여부 확인
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: title,
          url: url,
        });
        // Web Share API 사용 시에도 토스트 표시
        toast.success(`클립보드 : ${url} 복사완료!`);
      } catch (error) {
        // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
        if (error.name !== "AbortError") {
          console.error("공유 실패:", error);
        }
      }
    } else {
      // Web Share API를 지원하지 않는 경우 클립보드에 복사
      try {
        await navigator.clipboard.writeText(url);
        toast.success(`클립보드 : ${url} 복사완료!`);
      } catch (error) {
        console.error("URL 복사 실패:", error);
        // 폴백: 텍스트 영역을 사용한 복사
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          toast.success(`클립보드 : ${url} 복사완료!`);
        } catch (err) {
          console.error("URL 복사 실패:", err);
          toast.error("URL 복사에 실패했습니다.");
        }
        document.body.removeChild(textArea);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="로딩 중..." className="content-detail-loading" />;
  }

  if (error) {
    return <ErrorMessage message={error} className="content-detail-error" />;
  }

  if (!content) {
    return (
      <ErrorMessage message="콘텐츠 정보를 찾을 수 없습니다." className="content-detail-error" />
    );
  }

  // TV는 name 필드 사용, 영화는 title 필드 사용
  const title = content.name || content.title;
  const originalName = content.originalName || content.original_name;

  // 백엔드 API 응답 필드명: posterUrl, backdropUrl (camelCase 우선, snake_case fallback)
  const posterPath = content?.posterUrl || content?.poster_path || content?.posterPath;
  const backdropPath = content?.backdropUrl || content?.backdrop_url || content?.backdropPath;
  const backdropUrl = backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null;

  return (
    <div className="content-detail relative rounded-3xl! mb-10! ">
      {/* 백드롭 이미지 배경 */}
      {backdropUrl && (
        <div
          className="rounded-none content-detail__backdrop"
          style={{
            backgroundImage: `url(${backdropUrl})`,
          }}
        />
      )}

      {/* 메인 콘텐츠 영역 */}
      <div className="content-detail__wrapper">
        <BackButton className="content-detail__back-btn" />

        {/* 상단 정보 섹션 (포스터 + 기본 정보) */}
        <section className="grid gap-10 items-start mb-10 content-detail__hero md:gap-6 lg:gap-8">
          <ContentDetailPoster
            posterUrl={posterPath}
            title={title}
            isAuthenticated={isAuthenticated}
            likeCount={likeCount}
          />

          <div className="content-detail__main-info">
            <header className="content-detail__header">
              <h1 className="content-detail__title">{title}</h1>
              {originalName && originalName !== title && (
                <p className="content-detail__original-title">{originalName}</p>
              )}
              {content.tagline && <p className="content-detail__tagline">{content.tagline}</p>}
            </header>

            <div className="flex flex-wrap gap-6 content-detail__actions">
              {isAuthenticated && (
                <button
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-primary via-primary to-primary-dark text-black border-primary shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed content-detail__action-btn--collection"
                  onClick={() => setIsCollectionModalOpen(true)}
                  title="컬렉션에 추가"
                >
                  <FaFolderPlus />
                  <span>컬렉션에 추가</span>
                </button>
              )}
              <button
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] hover:border-primary hover:text-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed content-detail__action-btn--share"
                onClick={handleShare}
                title="공유하기"
              >
                <FaShare />
                <span>공유하기</span>
              </button>
            </div>
          </div>
        </section>

        {/* 상세 정보 섹션 */}
        <section className="content-detail__details mb-10!">
          <TvDetailInfo
            content={content}
            onReviewSuccess={handleReviewSuccess}
            genres={genres}
            likeCount={likeCount}
          />
        </section>

        {/* 리뷰 섹션 - contentId가 없어도 리뷰 작성 폼은 표시 */}
        <section className="content-detail__reviews">
          <ContentReviewSection
            tmdbId={id}
            contentId={contentId}
            isLoggedIn={isAuthenticated}
            refreshTrigger={reviewRefreshTrigger}
          />
        </section>
      </div>

      {/* 컬렉션 추가 모달 */}
      {isAuthenticated && contentId && (
        <AddToCollectionModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          contentId={contentId}
        />
      )}
    </div>
  );
};

export default TvDetail;
