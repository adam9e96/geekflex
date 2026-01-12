import { create } from "zustand";
import { publicApi, authenticatedApi } from "@services/apiClient";

/**
 * 콘텐츠 상세 정보 관리 스토어
 * 
 * @param {Object} set - Zustand의 set 함수
 * @param {Object} get - Zustand의 get 함수
 * @returns {Object} 콘텐츠 상세 정보 관리 스토어
 * @property {Object|null} content - 콘텐츠 상세 정보
 * @property {boolean} isLoading - 로딩 상태
 * @property {string|null} error - 에러 메시지
 * @property {number} likeCount - 좋아요 개수
 * @property {boolean} isLiked - 현재 사용자의 좋아요 여부
 * @property {string|null} tmdbId - 현재 조회 중인 TMDB ID
 * @property {string} contentType - 현재 콘텐츠 타입 ("movie" | "tv")
 * @property {Function} fetchContentDetail - 콘텐츠 상세 정보 가져오기
 * @property {Function} fetchLikeCount - 좋아요 개수 가져오기
 * @property {Function} clearContent - 콘텐츠 정보 초기화
 * 
 * @since 2025-12-20
 * @description 콘텐츠 상세 정보와 좋아요 상태를 관리하는 스토어
 * 
 * @usage 사용처:
 * - src/pages/ContentDetail.jsx (영화/TV 공통)
 */
export const useContentDetailStore = create((set, get) => ({
  // 상태
  content: null,
  isLoading: false,
  error: null,
  likeCount: 0,
  isLiked: false,
  tmdbId: null,
  contentType: "movie",

  // 콘텐츠 상세 정보 가져오기
  // 기본값 TMDB ID는 영화로 설정
  fetchContentDetail: async (tmdbId, contentType = "movie") => {
    // 호출 작동기준: tmdbId가 없으면 호출하지 않음
    if (!tmdbId) {
      set({ isLoading: false });
      return;
    }

    const currentState = get();
    
    // 호출 작동기준: 이미 같은 콘텐츠를 로드 중이면 중복 호출 방지
    if (currentState.isLoading && 
        currentState.tmdbId === tmdbId && 
        currentState.contentType === contentType) {
      return;
    }

    // 호출 작동기준: 이미 같은 콘텐츠가 로드되어 있으면 재호출하지 않음
    if (currentState.content && 
        currentState.tmdbId === tmdbId && 
        currentState.contentType === contentType &&
        !currentState.error) {
      return;
    }

    set({ isLoading: true, error: null, tmdbId, contentType });

    try {
      // 콘텐츠 타입에 따라 상세 API 엔드포인트 결정
      const basePathMap = {
        movie: "/api/v1/movies",
        tv: "/api/v1/tv",
      };
      // 콘텐츠 타입에 따라 상세 API 엔드포인트 결정 (기본값은 영화)
      const basePath = basePathMap[contentType] || basePathMap.movie;

      // 예) 영화: /api/v1/movies/496243
      //     드라마: /api/v1/tv/88046
      const response = await publicApi.get(`${basePath}/${tmdbId}`);
      const data = response.data;
      
      set({ content: data, isLoading: false, error: null });

      // 콘텐츠 로드 후 좋아요 개수도 가져오기
      if (data.contentId) {
        get().fetchLikeCount(data.contentId);
      }
    } catch (error) {
      console.error("콘텐츠 상세 정보 로딩 실패:", error);
      set({
        error: error.response?.data?.message || error.message || "콘텐츠 정보를 불러오는데 실패했습니다.",
        isLoading: false,
      });
    }
  },

  // 좋아요 개수 가져오기
  fetchLikeCount: async (contentId) => {
    // 호출 작동기준: contentId가 없으면 호출하지 않음
    if (!contentId) {
      return;
    }

    const currentState = get();
    
    // 호출 작동기준: 현재 콘텐츠의 contentId와 일치하지 않으면 호출하지 않음
    if (currentState.content && currentState.content.contentId !== contentId) {
      return;
    }

    try {
      // 토큰이 있으면 authenticatedApi, 없으면 publicApi 사용
      const api = authenticatedApi;
      const response = await api.get(`/api/v1/likes/CONTENT/${contentId}/all`);
      
      const data = response.data;
      set({ likeCount: data.count || 0 });
    } catch (error) {
      // 400 에러는 contentId가 없거나 유효하지 않은 경우일 수 있음 (정상적인 경우)
      // 401, 403 에러는 인증/권한 문제 (정상적인 경우)
      // 에러가 발생해도 0으로 설정 (좋아요 개수는 필수가 아님)
      if (error.response?.status !== 400 && error.response?.status !== 401 && error.response?.status !== 403) {
        console.warn("좋아요 개수 가져오기 실패:", error.response?.status);
      }
      set({ likeCount: 0 });
    }
  },

  // 콘텐츠 정보 초기화
  clearContent: () => {
    set({
      content: null,
      isLoading: false,
      error: null,
      likeCount: 0,
      isLiked: false,
      tmdbId: null,
      contentType: "movie",
    });
  },
}));
