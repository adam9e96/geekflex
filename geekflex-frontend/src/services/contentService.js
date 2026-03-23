import { publicApi, getResponseData } from "./apiClient";

/**
 * 콘텐츠 상세 정보 조회
 * @param {number} tmdbId - TMDB ID
 * @param {string} contentType - 콘텐츠 타입 ("movie" | "tv")
 * @returns {Promise<Object>} 콘텐츠 상세 정보
 * @reviewed 2026-01-23 - 검토 완료
 */
export const getContentDetail = async (tmdbId, contentType = "movie") => {
  const basePathMap = {
    movie: "/api/v1/movies",
    tv: "/api/v1/tv",
  };

  const basePath = basePathMap[contentType] || basePathMap.movie;
  const response = await publicApi.get(`${basePath}/${tmdbId}`);

  return getResponseData(response);
};
