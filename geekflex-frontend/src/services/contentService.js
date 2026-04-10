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

/**
 * 저장된 콘텐츠 중 랜덤 작품 1개를 조회
 * @returns {Promise<Object>} 랜덤 콘텐츠 정보
 */
export const getRandomContent = async () => {
  const response = await publicApi.get("/api/v1/contents/random");

  return getResponseData(response);
};

/**
 * 검색 제안으로 사용할 랜덤 콘텐츠 4개를 조회
 * @returns {Promise<Array>} 랜덤 콘텐츠 목록
 */
export const getRandomContentSuggestions = async () => {
  const response = await publicApi.get("/api/v1/contents/random-suggestions");

  return getResponseData(response);
};
