import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "@components/ui/LoadingSpinner/LoadingSpinner";
import EmptyState from "@components/ui/EmptyState/EmptyState.jsx";
import SectionHeader from "@components/ui/SectionHeader/SectionHeader.jsx";
import ContentCard from "@components/home/ContentCard.jsx";
import { buildApiUrl } from "@services/apiClient";
import styles from "../MoviesCategoryPage/MoviesCategoryPage.module.css";

/**
 * TV 카테고리 페이지 컴포넌트
 * URL 파라미터로 카테고리를 받아서 해당 엔드포인트로 데이터를 가져옵니다.
 *
 * 지원하는 카테고리:
 * - popular: 인기 드라마
 * - on-the-air: 방영 중
 * - top-rated: 최고 평점
 * - airing-today: 오늘 방영
 */
const TvCategoryPage = () => {
  const { category } = useParams();
  const [tvShows, setTvShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryConfig = {
    popular: {
      title: "인기 드라마",
      icon: "fas fa-fire",
      endpoint: "/api/v1/tv/popular",
    },
    "on-the-air": {
      title: "방영 중",
      icon: "fas fa-play-circle",
      endpoint: "/api/v1/tv/on-the-air",
    },
    "top-rated": {
      title: "최고 평점 드라마",
      icon: "fas fa-star",
      endpoint: "/api/v1/tv/top-rated",
    },
    "airing-today": {
      title: "오늘 방영",
      icon: "fas fa-calendar-alt",
      endpoint: "/api/v1/tv/airing-today",
    },
  };

  const config = categoryConfig[category] || categoryConfig.popular;

  useEffect(() => {
    if (!category) return;

    const fetchTvShows = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(buildApiUrl(config.endpoint), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`드라마 데이터를 불러오는데 실패했습니다: ${response.status}`);
        }

        const data = await response.json();
        setTvShows(data);
      } catch (error) {
        console.error(`${config.title} 데이터 로딩 실패:`, error);
        setError(error.message || "드라마 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTvShows();
  }, [category, config.endpoint, config.title]);

  return (
    <div className={styles.pageContainer}>
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeader title={config.title} icon={config.icon} />

          {isLoading ? (
            <LoadingSpinner message="로딩 중..." className={styles.loading} />
          ) : error ? (
            <EmptyState message={`${config.title} 정보를 로드하는데 실패했습니다.`} />
          ) : (
            <div className={styles.grid}>
              {tvShows.map((tv) => (
                <ContentCard key={tv.id} content={tv} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TvCategoryPage;
