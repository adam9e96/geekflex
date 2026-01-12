import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import NoImage from "@components/home/NoImage";
import SectionHeader from "@components/home/SectionHeader";
import MovieCard from "@components/home/MovieCard";
import "@styles/home/home.css";

/**
 * 영화 카테고리 페이지 컴포넌트
 * URL 파라미터로 카테고리를 받아서 해당 엔드포인트로 데이터를 가져옵니다.
 *
 * 지원하는 카테고리:
 * - popular: 인기있는 작품
 * - upcoming: 개봉예정 작품
 * - top_rated: 최고 평점 영화
 * - now-playing: 현재 상영작품
 */
const MoviesCategoryPage = () => {
  const { category } = useParams();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 카테고리별 설정
  const categoryConfig = {
    popular: {
      title: "인기있는 작품",
      icon: "fas fa-fire",
      endpoint: "/api/v1/movies/popular",
    },
    upcoming: {
      title: "개봉예정 작품",
      icon: "fas fa-calendar-alt",
      endpoint: "/api/v1/movies/upcoming",
    },
    top_rated: {
      title: "최고 평점 영화",
      icon: "fas fa-star",
      endpoint: "/api/v1/movies/top_rated",
    },
    "now-playing": {
      title: "현재 상영작품",
      icon: "fas fa-play-circle",
      endpoint: "/api/v1/movies/now-playing",
    },
  };

  const config = categoryConfig[category] || categoryConfig.popular;

  // 영화 데이터 가져오기
  useEffect(() => {
    if (!category) return;

    console.log(`${config.title} 데이터 로딩 시작`);
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 카테고리별 엔드포인트로 요청
        const response = await fetch(config.endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        // 응답 결과 false인 경우 예외 발생
        if (!response.ok) {
          throw new Error(`영화 데이터를 불러오는데 실패했습니다: ${response.status}`);
        }

        // 응답 결과 json 으로 파싱
        const data = await response.json();
        // console.log(`📦 ${category} 응답 데이터:`, data);
        // console.log("🖼️ 첫 번째 영화 포스터:", data[0]?.posterPath || data[0]?.posterUrl);
        setMovies(data);
      } catch (error) {
        console.error(`${config.title} 데이터 로딩 실패:`, error);
        setError(error.message || "영화 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [category, config.endpoint, config.title]);

  return (
    <div className="home-page">
      <section className="home-popular">
        <div className="home-popular__container">
          <SectionHeader title={config.title} icon={config.icon} />

          {isLoading ? (
            <LoadingSpinner message="로딩 중..." className="home-loading" />
          ) : error ? (
            <NoImage message={`${config.title} 정보를 로드하는데 실패했습니다.`} />
          ) : (
            <div className="home-popular__grid">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MoviesCategoryPage;
