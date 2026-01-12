import { useState, useCallback } from "react";
import { authenticatedApi, publicApi, getErrorMessage } from "@services/apiClient";

/**
 * TV 검색 커스텀 훅
 * GET /api/v1/tv/search?keyword={keyword}
 */
export const useTvSearch = () => {
  const [tvResults, setTvResults] = useState([]);
  const [tvTotalCount, setTvTotalCount] = useState(0);
  const [isTvSearchLoading, setIsTvSearchLoading] = useState(false);
  const [tvSearchError, setTvSearchError] = useState(null);

  /**
   * TV 검색 실행
   * @param {string} keyword - 검색 키워드
   */
  const searchTv = useCallback(async (keyword) => {
    if (!keyword || !keyword.trim()) {
      setTvResults([]);
      setTvTotalCount(0);
      return;
    }

    setIsTvSearchLoading(true);
    setTvSearchError(null);

    try {
      // 토큰이 있으면 authenticatedApi, 없으면 publicApi 사용
      const api = authenticatedApi;
      
      const response = await api.get(`/api/v1/tv/search`, {
        params: { keyword: keyword.trim() },
      });

      const data = response.data;

      // 응답이 배열인지 확인
      const tvShows = Array.isArray(data) ? data : [];

      // TV 데이터를 검색 결과 형식으로 변환
      const formattedResults = tvShows.map((tv) => ({
        id: tv.id,
        contentId: tv.id,
        tmdbId: tv.tmdbId,
        contentType: "TV",
        title: tv.name,
        originalTitle: tv.originalName,
        overview: tv.overview,
        releaseDate: tv.firstAirDate,
        poster: tv.posterUrl
          ? `https://image.tmdb.org/t/p/w500${tv.posterUrl}`
          : null,
        backdropUrl: tv.backdropUrl
          ? `https://image.tmdb.org/t/p/w1280${tv.backdropUrl}`
          : null,
        rating: tv.voteAverage?.toFixed(1) || null,
        voteCount: tv.voteCount,
        popularity: tv.popularity,
        year: tv.firstAirDate ? new Date(tv.firstAirDate).getFullYear() : null,
      }));

      setTvResults(formattedResults);
      setTvTotalCount(formattedResults.length);
    } catch (error) {
      console.error("TV 검색 오류:", error);
      
      // 401 에러는 인증되지 않은 상태로 처리 (에러로 처리하지 않음)
      if (error.response?.status === 401) {
        console.log("인증되지 않은 사용자 - TV 검색 불가");
        setTvResults([]);
        setTvTotalCount(0);
        setIsTvSearchLoading(false);
        return;
      }

      setTvSearchError(getErrorMessage(error));
      setTvResults([]);
      setTvTotalCount(0);
    } finally {
      setIsTvSearchLoading(false);
    }
  }, []);

  return {
    tvResults,
    tvTotalCount,
    isTvSearchLoading,
    tvSearchError,
    searchTv,
  };
};

