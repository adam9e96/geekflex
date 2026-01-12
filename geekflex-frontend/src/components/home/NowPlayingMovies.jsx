import React, { useState, useEffect } from "react";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import NoImage from "./NoImage";
import SectionHeader from "./SectionHeader";
import MovieCard from "./MovieCard";

/**
 * 개봉예정 영화 섹션 컴포넌트
 */
const NowPlayingMovies = () => {
  const [movies, setMovies] = useState([]); // 개봉예정 영화를 담을 배열
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 인덱스 (0부터 시작)

  const itemsPerPage = 6; // 한 페이지에 표시할 영화 개수

  // 개봉예정 영화 데이터 가져오기
  useEffect(() => {
    console.log("개봉예정 영화 데이터 로딩 시작");
    const fetchUpcomingMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // GET /api/v1/movies/upcoming 요청
        const response = await fetch("/api/v1/movies/upcoming", {
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
        // console.log("📦 upcoming 응답 데이터:", data);
        // console.log("🖼️ 첫 번째 영화 포스터:", data[0]?.posterPath || data[0]?.posterUrl);
        setMovies(data);
      } catch (error) {
        console.error("개봉예정 영화 데이터 로딩 실패:", error);
        setError(error.message || "영화 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, []);

  return (
    <section className="home-popular">
      <div className="home-popular__container">
        <SectionHeader
          title="개봉예정 영화"
          icon="fas fa-calendar-alt"
          moreLink="/movies/upcoming"
        />

        {isLoading ? (
          <LoadingSpinner message="로딩 중..." className="home-loading" />
        ) : error ? (
          <NoImage message="개봉예정 정보를 로드하는데 실패했습니다." />
        ) : (
          <>
            <div className="home-popular__grid">
              {movies
                .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                .map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>

            {/* 페이지네이션 컨트롤 */}
            {movies.length > itemsPerPage && (
              <div className="home-popular__pagination">
                <button
                  className="home-popular__pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  aria-label="이전 페이지"
                >
                  <i className="fas fa-chevron-left"></i>
                  <span>이전</span>
                </button>

                <span className="home-popular__pagination-info">
                  {currentPage + 1} / {Math.ceil(movies.length / itemsPerPage)}
                </span>

                <button
                  className="home-popular__pagination-btn"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(Math.ceil(movies.length / itemsPerPage) - 1, prev + 1),
                    )
                  }
                  disabled={currentPage >= Math.ceil(movies.length / itemsPerPage) - 1}
                  aria-label="다음 페이지"
                >
                  <span>다음</span>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default NowPlayingMovies;
