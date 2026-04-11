import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaFolderPlus, FaShare } from "react-icons/fa";

import LoadingSpinner from "@components/ui/LoadingSpinner/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage/ErrorMessage";
import BackButton from "@components/ui/BackButton/BackButton";
import ContentDetailPoster from "@components/content/detail/ContentDetailPoster/ContentDetailPoster";
import ContentDetailInfo from "@components/content/detail/ContentDetailInfo/ContentDetailInfo";
import ContentReviewSection from "@components/content/detail/ContentReviewSection/ContentReviewSection";
import AddToCollectionModal from "@components/content/detail/AddToCollectionModal/AddToCollectionModal";

import { useAuthStore } from "@stores/authStore";
import { useContentDetailStore } from "@stores/contentDetailStore";

import styles from "./ContentDetail.module.css";

const ContentDetail = () => {
  const { id } = useParams();
  const location = useLocation();

  // URL 경로에서 콘텐츠 타입 자동 감지
  const contentType = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/tv/")) {
      return "tv";
    }
    // 기본값은 영화
    return "movie";
  }, [location.pathname]);

  // Zustand 스토어에서 상태 가져오기
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const content = useContentDetailStore((state) => state.content);
  const isLoading = useContentDetailStore((state) => state.isLoading);
  const error = useContentDetailStore((state) => state.error);
  const likeCount = useContentDetailStore((state) => state.likeCount);
  const fetchContentDetail = useContentDetailStore((state) => state.fetchContentDetail);
  const fetchLikeStatus = useContentDetailStore((state) => state.fetchLikeStatus);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id, location.key]);

  // 콘텐츠 상세 정보 가져오기
  useEffect(() => {
    if (id) {
      fetchContentDetail(id, contentType);
    }
  }, [id, contentType, fetchContentDetail]);

  // 장르 처리
  const genres = useMemo(() => {
    if (!content) return null;
    if (Array.isArray(content.genres) && content.genres.length > 0) {
      return content.genres;
    }
    if (content.genre && typeof content.genre === "string") {
      return content.genre
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0)
        .map((name, index) => ({ id: index, name }));
    }
    return content.genres || null;
  }, [content]);

  // contentId 추출
  const contentId = useMemo(() => {
    if (!content) return null;
    return content.contentId || content.id || content.content_id || null;
  }, [content]);

  // 좋아요 상태 가져오기
  useEffect(() => {
    if (isAuthenticated && content && content.tmdbId) {
      fetchLikeStatus(content.tmdbId);
    }
  }, [content, isAuthenticated, fetchLikeStatus]);

  // 공유 기능
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: content?.title || "작품 상세",
      text: content?.title || "이 작품을 확인해보세요!",
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success(`클립보드 : ${url} 복사완료!`);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("공유 실패:", error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success(`클립보드 : ${url} 복사완료!`);
      } catch (error) {
        console.error("URL 복사 실패:", error);
        toast.error("URL 복사에 실패했습니다.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner message="로딩 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className={styles.error}>
        <ErrorMessage message="콘텐츠 정보를 찾을 수 없습니다." />
      </div>
    );
  }

  const backdropPath = content?.backdropPath;
  const backdropUrl = backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null;

  return (
    <div className={styles.detailContainer}>
      {backdropUrl && (
        <div className={styles.backdrop} style={{ backgroundImage: `url(${backdropUrl})` }} />
      )}

      <div className={styles.wrapper}>
        <div className={styles.detailBackBtnWrapper}>
          <BackButton className={styles.detailBackBtn} />
        </div>

        <section className={styles.detailHero}>
          <ContentDetailPoster />

          <div className={styles.mainInfo}>
            <header className={styles.header}>
              <h1 className={styles.title}>{content.title}</h1>
              {(content.originalTitle || content.original_title) &&
                (content.originalTitle !== content.title ||
                  content.original_title !== content.title) && (
                  <p className={styles.originalTitle}>
                    {content.originalTitle || content.original_title}
                  </p>
                )}
              {content.tagline && <p className={styles.tagline}>{content.tagline}</p>}
            </header>

            <div className={styles.actions}>
              {isAuthenticated && (
                <button
                  className={styles.collectionBtn}
                  onClick={() => setIsCollectionModalOpen(true)}
                  title="컬렉션에 추가"
                >
                  <FaFolderPlus />
                  <span>컬렉션에 추가</span>
                </button>
              )}
              <button className={styles.shareBtn} onClick={handleShare} title="공유하기">
                <FaShare />
                <span>공유하기</span>
              </button>
            </div>
          </div>
        </section>

        <section className={styles.details}>
          <ContentDetailInfo
            content={content}
            contentType={contentType}
            genres={genres}
            likeCount={likeCount}
          />
        </section>

        <section className={styles.reviews}>
          <ContentReviewSection contentId={contentId} />
        </section>
      </div>

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

export default ContentDetail;
