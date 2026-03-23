import { authenticatedApi, getResponseData } from "./apiClient";

/**
 * 내가 작성한 리뷰 목록 조회
 * @returns {Promise<Array>} 리뷰 목록
 */
export const fetchMyReviews = async () => {
  const response = await authenticatedApi.get("/api/v1/reviews/me");
  return getResponseData(response);
};

/**
 * 내가 작성한 리뷰 개수 조회
 * @returns {Promise<Object>} { reviewCount: number }
 */
export const fetchMyReviewsCount = async () => {
  const response = await authenticatedApi.get("/api/v1/reviews/me/count");
  return getResponseData(response);
};
