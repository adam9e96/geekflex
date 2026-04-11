import { useState, useEffect } from "react";
import SectionHeader from "@components/ui/SectionHeader/SectionHeader.jsx";
import LoadingSpinner from "@components/ui/LoadingSpinner/LoadingSpinner";
import EmptyState from "@components/ui/EmptyState/EmptyState.jsx";
import { buildApiUrl } from "@services/apiClient";
import ContentCard from "../ContentCard";
import styles from "../HomeSection.module.css";

/**
 * 최고 평점 영화 섹션 컴포넌트
 */
const TopRatedMovies = () => {
  const [movies, setMovies] = useState([]); // 최고 평점 영화를 담을 배열
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 인덱스 (0부터 시작)

  const itemsPerPage = 6; // 한 페이지에 표시할 영화 개수

  // 최고 평점 영화 데이터 가져오기
  useEffect(() => {
    // console.log("최고 평점 영화 데이터 로딩 시작");
    const fetchTopRatedMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // GET /api/v1/movies/top_rated 요청
        const response = await fetch(buildApiUrl("/api/v1/movies/top_rated"), {
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
        // console.log("📦 top_rated 응답 데이터:", data);
        // console.log("🖼️ 첫 번째 영화 포스터:", data[0]?.posterPath || data[0]?.posterUrl);
        setMovies(data);
      } catch (error) {
        console.error("최고 평점 영화 데이터 로딩 실패:", error);
        setError(error.message || "영화 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopRatedMovies();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeader title="최고 평점 영화" icon="fas fa-star" moreLink="/movies/top_rated" />

        {isLoading ? (
          <LoadingSpinner message="로딩 중..." className={styles.loading} />
        ) : error ? (
          <EmptyState message="최고 평점 정보를 로드하는데 실패했습니다." />
        ) : (
          <>
            <div className={styles.grid}>
              {movies
                .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                .map((movie) => (
                  <ContentCard key={movie.id} content={movie} />
                ))}
            </div>

            {/* 페이지네이션 컨트롤 */}
            {movies.length > itemsPerPage && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  aria-label="이전 페이지"
                >
                  <i className="fas fa-chevron-left"></i>
                  <span>이전</span>
                </button>

                <span className={styles.paginationInfo}>
                  {currentPage + 1} / {Math.ceil(movies.length / itemsPerPage)}
                </span>

                <button
                  className={styles.paginationBtn}
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

export default TopRatedMovies;
