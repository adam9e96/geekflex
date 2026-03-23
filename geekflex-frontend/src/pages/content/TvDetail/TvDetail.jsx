import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaFolderPlus, FaShare } from "react-icons/fa";

import LoadingSpinner from "@components/ui/LoadingSpinner/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage/ErrorMessage";
import BackButton from "@components/ui/BackButton/BackButton";
import ContentDetailPoster from "@components/content/detail/ContentDetailPoster/ContentDetailPoster";
import TvDetailInfo from "@components/content/detail/TvDetailInfo/TvDetailInfo";
import ContentReviewSection from "@components/content/detail/ContentReviewSection/ContentReviewSection";
import AddToCollectionModal from "@components/content/detail/AddToCollectionModal/AddToCollectionModal";

import { useAuthStore } from "@stores/authStore";
import { useContentDetailStore } from "@stores/contentDetailStore";

import styles from "./TvDetail.module.css";

const TvDetail = () => {
  const { id } = useParams();

  // Zustand 스토어에서 상태 가져오기
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

  const handleReviewSuccess = () => {
    setReviewRefreshTrigger((prev) => prev + 1);
  };

  // 공유 기능
  const handleShare = async () => {
    const url = window.location.href;
    const title = content?.name || content?.title || "작품 상세";
    const shareData = {
      title: title,
      text: title,
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

  const title = content.name || content.title;
  const originalName = content.originalName || content.original_name;
  const posterPath = content?.posterUrl || content?.poster_path || content?.posterPath;
  const backdropPath = content?.backdropUrl || content?.backdrop_url || content?.backdropPath;
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
          <ContentDetailPoster
            posterUrl={posterPath}
            title={title}
            isAuthenticated={isAuthenticated}
            likeCount={likeCount}
          />

          <div className={styles.mainInfo}>
            <header className={styles.header}>
              <h1 className={styles.title}>{title}</h1>
              {originalName && originalName !== title && (
                <p className={styles.originalTitle}>{originalName}</p>
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
          <TvDetailInfo
            content={content}
            onReviewSuccess={handleReviewSuccess}
            genres={genres}
            likeCount={likeCount}
          />
        </section>

        <section className={styles.reviews}>
          <ContentReviewSection
            tmdbId={id}
            contentId={contentId}
            isLoggedIn={isAuthenticated}
            refreshTrigger={reviewRefreshTrigger}
          />
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

export default TvDetail;
