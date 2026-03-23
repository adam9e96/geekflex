import { authenticatedApi, getResponseData } from "./apiClient";

/**
 * @typedef {Object} LikeCountResponse
 * @property {number} count - 좋아요 개수
 */

/**
 * @typedef {Object} ToggleLikeResponse
 * @property {boolean} liked - 좋아요 여부
 * @property {number} targetId - 대상 ID
 * @property {string} targetType - 대상 타입
 */

/**
 * @typedef {Object} CheckLikeResponse
 * @property {boolean} liked - 좋아요 여부
 */

/**
 * 좋아요 개수 조회
 * @param {number} targetId - 콘텐츠 ID (TMDB ID)
 * @returns {Promise<number>} 좋아요 개수
 * @reviewed 2026-01-23 - 검토 완료
 */
export const getLikeCount = async (targetId) => {
  try {
    const response = await authenticatedApi.get(`/api/v1/likes/CONTENT/${targetId}/all`);
    /** @type {LikeCountResponse} */
    const data = getResponseData(response);
    return data.count || 0;
  } catch {
    return 0;
  }
};

/**
 * 좋아요 상태 조회
 * @param {number} targetId - 콘텐츠 ID (TMDB ID)
 * @returns {Promise<boolean>} 좋아요 여부
 * @reviewed 2026-01-23 - 검토 완료
 */
export const checkLikeStatus = async (targetId) => {
  try {
    const response = await authenticatedApi.get(`/api/v1/likes/CONTENT/${targetId}`);
    /** @type {CheckLikeResponse} */
    const data = getResponseData(response);
    return data.liked || false;
  } catch {
    return false;
  }
};

/**
 * 좋아요 토글
 * @param {string|number} targetId - 콘텐츠 ID (TMDB ID)
 * @returns {Promise<boolean>} 변경된 좋아요 상태
 * @reviewed 2026-01-23 - 검토 완료
 */
export const toggleLike = async (targetId) => {
  const response = await authenticatedApi.post(`/api/v1/likes/CONTENT/${targetId}`);
  /** @type {ToggleLikeResponse} */
  const data = getResponseData(response);
  return data.liked;
};
