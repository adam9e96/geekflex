import { useState, useCallback } from "react";
import { authenticatedApi, publicApi, getErrorMessage } from "@services/apiClient";

/**
 * 영화 검색 커스텀 훅
 * GET /api/v1/movies/search?keyword={keyword}
 */
export const useMovieSearch = () => {
  const [movieResults, setMovieResults] = useState([]);
  const [movieTotalCount, setMovieTotalCount] = useState(0);
  const [isMovieSearchLoading, setIsMovieSearchLoading] = useState(false);
  const [movieSearchError, setMovieSearchError] = useState(null);

  /**
   * 영화 검색 실행
   * @param {string} keyword - 검색 키워드
   */
  const searchMovies = useCallback(async (keyword) => {
    if (!keyword || !keyword.trim()) {
      setMovieResults([]);
      setMovieTotalCount(0);
      return;
    }

    setIsMovieSearchLoading(true);
    setMovieSearchError(null);

    try {
      // 토큰이 있으면 authenticatedApi, 없으면 publicApi 사용
      const api = authenticatedApi;
      
      const response = await api.get(`/api/v1/movies/search`, {
        params: { keyword: keyword.trim() },
      });

      const data = response.data;

      // 응답이 배열인지 확인
      const movies = Array.isArray(data) ? data : [];

      // 영화 데이터를 검색 결과 형식으로 변환
      const formattedResults = movies.map((movie) => ({
        id: movie.id,
        contentId: movie.id,
        tmdbId: movie.tmdbId,
        contentType: "MOVIE",
        title: movie.title,
        originalTitle: movie.originalTitle,
        overview: movie.overview,
        releaseDate: movie.releaseDate,
        poster: movie.posterUrl
          ? `https://image.tmdb.org/t/p/w500${movie.posterUrl}`
          : null,
        backdropUrl: movie.backdropUrl
          ? `https://image.tmdb.org/t/p/w1280${movie.backdropUrl}`
          : null,
        rating: movie.voteAverage?.toFixed(1) || null,
        voteCount: movie.voteCount,
        popularity: movie.popularity,
        year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null,
      }));

      setMovieResults(formattedResults);
      setMovieTotalCount(formattedResults.length);
    } catch (error) {
      console.error("영화 검색 오류:", error);
      
      // 401 에러는 인증되지 않은 상태로 처리 (에러로 처리하지 않음)
      if (error.response?.status === 401) {
        console.log("인증되지 않은 사용자 - 영화 검색 불가");
        setMovieResults([]);
        setMovieTotalCount(0);
        setIsMovieSearchLoading(false);
        return;
      }

      setMovieSearchError(getErrorMessage(error));
      setMovieResults([]);
      setMovieTotalCount(0);
    } finally {
      setIsMovieSearchLoading(false);
    }
  }, []);

  return {
    movieResults,
    movieTotalCount,
    isMovieSearchLoading,
    movieSearchError,
    searchMovies,
  };
};
