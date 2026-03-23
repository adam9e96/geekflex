import { authenticatedApi, publicApi, getResponseData } from "@services/apiClient";

const COLLECTION_API_BASE = "/api/v1/collections";

/**
 * 컬렉션 서비스
 * 컬렉션 관련 API 호출을 담당합니다.
 */
export const collectionService = {
  /**
   * 내 컬렉션 목록 조회
   */
  fetchMyCollections: async () => {
    const response = await authenticatedApi.get(`${COLLECTION_API_BASE}/me`);
    return getResponseData(response);
  },

  /**
   * 공개 컬렉션 목록 조회
   * @param {Object} params - { sortBy, page, size }
   */
  fetchPublicCollections: async ({ sortBy = "latest", page = 0, size = 20 } = {}) => {
    const response = await publicApi.get(COLLECTION_API_BASE, {
      params: {
        sortBy,
        page,
        size,
      },
    });
    return getResponseData(response);
  },

  /**
   * 컬렉션 상세 조회
   * @param {number|string} collectionId
   */
  fetchCollectionDetail: async (collectionId) => {
    // 상세 조회는 공개일 수도 있고 비공개일 수도 있는데,
    // authenticatedApi는 토큰이 있으면 보내고 없으면 안 보내는 로직이 아니라
    // 무조건 토큰을 보내려고 하거나, 401 시 갱신을 시도함.
    // apiClient 구현상 authenticatedApi는 토큰이 있으면 헤더에 추가하므로
    // 여기서는 authenticatedApi를 사용하는 것이 안전함 (비공개 컬렉션 접근 가능성)
    const response = await authenticatedApi.get(`${COLLECTION_API_BASE}/${collectionId}`);
    return getResponseData(response);
  },

  /**
   * 컬렉션 생성
   * @param {Object} data - { title, description, isPublic }
   */
  createCollection: async (data) => {
    const response = await authenticatedApi.post(COLLECTION_API_BASE, data);
    return getResponseData(response);
  },

  /**
   * 컬렉션 수정
   * @param {number|string} collectionId
   * @param {Object} data - { title, description, isPublic }
   */
  updateCollection: async (collectionId, data) => {
    const response = await authenticatedApi.put(`${COLLECTION_API_BASE}/${collectionId}`, data);
    return getResponseData(response);
  },

  /**
   * 컬렉션 삭제
   * @param {number|string} collectionId
   */
  deleteCollection: async (collectionId) => {
    const response = await authenticatedApi.delete(`${COLLECTION_API_BASE}/${collectionId}`);
    // 204 No Content는 getResponseData에서 null 처리됨 (apiClient 구현에 따라 다름)
    // apiClient.js의 getResponseData는 response.data를 반환하므로 status 체크 필요 여부 확인
    // Axios는 status 200번대면 에러를 던지지 않음.
    return getResponseData(response);
  },
};
