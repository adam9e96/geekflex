import { create } from "zustand";
import { getContentDetail } from "@services/contentService";
import { checkLikeStatus, getLikeCount, toggleLike } from "@services/likeService";

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
 * @property {Function} fetchLikeStatus - 좋아요 상태 가져오기
 * @property {Function} toggleLike - 좋아요 토글하기
 * @property {Function} clearContent - 콘텐츠 정보 초기화
 * @description 콘텐츠 상세 정보와 좋아요 상태를 관리하는 스토어
 *
 * @usage 사용처:
 * - src/pages/ContentDetail.jsx (영화/TV 공통)
 * @reviewed 2026-01-23 - 검토 완료
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

  /**
   * 텐츠 상세 정보 가져오기
   * 기본값 TMDB ID는 영화로 설정
   * @param tmdbId
   * @param contentType
   * @returns {Promise<void>}
   * @reviewed 2026-01-23 - 검토 완료
   */
  fetchContentDetail: async (tmdbId, contentType = "movie") => {
    // 호출 작동기준: tmdbId가 없으면 호출하지 않음
    if (!tmdbId) {
      set({ isLoading: false });
      return;
    }

    const currentState = get();

    // 호출 작동기준: 이미 같은 콘텐츠를 로드 중이면 중복 호출 방지
    if (
      currentState.isLoading &&
      currentState.tmdbId === tmdbId &&
      currentState.contentType === contentType
    ) {
      return;
    }

    // 호출 작동기준: 이미 같은 콘텐츠가 로드되어 있으면 재호출하지 않음
    if (
      currentState.content &&
      currentState.tmdbId === tmdbId &&
      currentState.contentType === contentType &&
      !currentState.error
    ) {
      return;
    }

    set({ isLoading: true, error: null, tmdbId, contentType });

    try {
      // 콘텐츠 정보와 좋아요 개수를 병렬로 요청하여 속도 개선
      const [contentData, likeCount] = await Promise.all([
        getContentDetail(tmdbId, contentType),
        getLikeCount(tmdbId),
      ]);

      set({
        content: contentData,
        likeCount: likeCount,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("콘텐츠 상세 정보 로딩 실패:", error);
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "콘텐츠 정보를 불러오는데 실패했습니다.",
        isLoading: false,
      });
    }
  },

  /**
   * 좋아요 상태 가져오기
   * @param targetId
   * @returns {Promise<void>}
   * @reviewed 2026-01-23 - 검토 완료
   */
  fetchLikeStatus: async (targetId) => {
    if (!targetId) return;

    const isLiked = await checkLikeStatus(targetId);
    set({ isLiked });
  },

  /**
   * 좋아요 토글하기 (낙관적 업데이트 적용)
   * @param contentId
   * @returns {Promise<void>}
   * @reviewed 2026-01-23 - 검토 완료
   */
  toggleLike: async (contentId) => {
    if (!contentId) return;

    const { isLiked, likeCount } = get();

    // 1. 낙관적 업데이트 (UI 먼저 변경)
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

    set({ isLiked: newIsLiked, likeCount: newLikeCount });

    try {
      // 2. API 호출
      const liked = await toggleLike(contentId);

      // 3. 서버 응답으로 상태 동기화
      set({ isLiked: liked });
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      // 4. 실패 시 롤백 (원래 상태로 복구)
      set({ isLiked: isLiked, likeCount: likeCount });
    }
  },
}));
