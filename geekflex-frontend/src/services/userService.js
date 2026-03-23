import { authenticatedApi, getResponseData } from "./apiClient";

/**
 * @typedef {Object} UserProfile
 * @property {string} publicId
 * @property {string} nickname
 * @property {string|null} profileImage
 * @property {string} bio
 * @property {string} joinedAt
 * @property {Object} userReviewStats
 * @property {number} userReviewStats.totalReviews
 * @property {number} userReviewStats.averageRating
 */

/**
 * 사용자 프로필 조회
 * @param {string} userId - 사용자 publicId
 * @returns {Promise<UserProfile>} 사용자 프로필 데이터
 */
export const getUserProfile = async (userId) => {
  const response = await authenticatedApi.get(`/api/v1/users/${userId}/profile`);
  return getResponseData(response);
};

/**
 * 현재 로그인한 사용자의 상세 정보 조회
 * GET /api/v1/users/me
 * @returns {Promise<Object>} 현재 사용자 상세 정보
 */
export const fetchMe = async () => {
  const response = await authenticatedApi.get("/api/v1/users/me");
  return getResponseData(response);
};

/**
 * Public ID로 사용자 정보 조회
 * GET /api/v1/users/{publicId}
 * @param {string} publicId
 * @returns {Promise<Object>} 사용자 정보
 */
export const fetchUserByPublicId = async (publicId) => {
  const response = await authenticatedApi.get(`/api/v1/users/${publicId}`);
  return getResponseData(response);
};

/**
 * 현재 사용자 정보 업데이트
 * PUT /api/v1/users/me
 * @param {Object} updateData - 업데이트할 데이터
 * @param {string} [updateData.nickname]
 * @param {string} [updateData.userEmail]
 * @param {string} [updateData.bio]
 * @param {boolean} [updateData.marketingAgreement]
 * @param {string} [updateData.currentPassword]
 * @param {string} [updateData.newPassword]
 * @param {File} [updateData.profileImage]
 * @returns {Promise<Object>} 업데이트된 사용자 정보
 */
export const updateCurrentUser = async (updateData) => {
  const formData = new FormData();
  const userUpdateRequest = {};

  if (updateData.nickname !== undefined) userUpdateRequest.nickname = updateData.nickname;
  if (updateData.userEmail !== undefined) userUpdateRequest.userEmail = updateData.userEmail;
  if (updateData.bio !== undefined) userUpdateRequest.bio = updateData.bio || "";
  if (updateData.marketingAgreement !== undefined)
    userUpdateRequest.marketingAgreement = updateData.marketingAgreement;
  if (updateData.currentPassword !== undefined)
    userUpdateRequest.currentPassword = updateData.currentPassword;
  if (updateData.newPassword !== undefined) userUpdateRequest.newPassword = updateData.newPassword;

  // "data" 필드에 JSON 객체를 Blob으로 추가
  const jsonBlob = new Blob([JSON.stringify(userUpdateRequest)], {
    type: "application/json",
  });
  formData.append("data", jsonBlob);

  // 프로필 이미지가 있는 경우 추가
  if (updateData.profileImage instanceof File) {
    formData.append("profile", updateData.profileImage);
  }

  const response = await authenticatedApi.put("/api/v1/users/me", formData);
  return getResponseData(response);
};

/**
 * 비밀번호 확인
 * POST /api/v1/users/me/verify-password
 * @param {string} password
 * @returns {Promise<boolean>} 성공 시 true
 */
export const verifyPassword = async (password) => {
  await authenticatedApi.post("/api/v1/users/me/verify-password", {
    password,
  });
  return true;
};
