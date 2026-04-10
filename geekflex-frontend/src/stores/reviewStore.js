import { create } from "zustand";
import { getAccessToken } from "../utils/auth"; // 경로 확인 필요

/**
 * 리뷰 관련 상태 관리 스토어
 * ReviewList 컴포넌트의 state를 관리
 */
export const useReviewStore = create((set) => ({
  // 리뷰 데이터
  reviews: [],
  isLoading: false,
  error: null,

  // 수정 관련
  editing: {
    reviewId: null,
    rating: 0,
    comment: "",
    reviewType: "BASIC",
  },

  // 답변 관련
  reply: {
    reviewId: null,
    text: "",
  },

  // 평점 모달
  ratingModal: {
    isOpen: false,
    contentId: null, // DB Content PK (리뷰 생성 API용)
    onSuccess: null,
  },

  // 사용자
  currentUserPublicId: null,

  // 액션들
  setReviews: (reviews) => set({ reviews, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  // --- API Actions ---

  // 현재 사용자 Public ID 가져오기
  fetchCurrentUserPublicId: async (isLoggedIn) => {
    if (!isLoggedIn) {
      set({ currentUserPublicId: null });
      return;
    }

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        set({ currentUserPublicId: null });
        return;
      }

      // 먼저 /api/v1/users/me/summary 시도
      let response = await fetch("/api/v1/users/me/summary", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.publicId) {
          set({ currentUserPublicId: data.publicId });
          return;
        }
      }

      // 실패 시 /api/v1/users/me 시도
      response = await fetch("/api/v1/users/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        set({ currentUserPublicId: data.publicId || data.userId || null });
      } else {
        set({ currentUserPublicId: null });
      }
    } catch (err) {
      console.error("현재 사용자 publicId 가져오기 실패:", err);
      set({ currentUserPublicId: null });
    }
  },

  // 리뷰 목록 조회
  fetchReviews: async (contentId) => {
    if (!contentId) {
      set({ isLoading: false });
      return [];
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/v1/reviews/content/${contentId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`리뷰 목록 로딩 실패: ${response.status}`);
      }

      const data = await response.json();
      const reviews = Array.isArray(data) ? data : [];
      set({ reviews, isLoading: false });
      return reviews;
    } catch (err) {
      console.error("리뷰 목록 로딩 실패:", err);
      set({ error: err.message, isLoading: false });
      return [];
    }
  },

  // 리뷰 생성
  createReview: async (contentId, reviewData) => {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error("로그인이 필요합니다.");

    const response = await fetch(`/api/v1/reviews/${contentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...reviewData,
        reviewType: reviewData.reviewType || "BASIC",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || "리뷰 등록에 실패했습니다.";

      // 400, 401, 403 등 상태 코드를 포함한 에러 객체 생성 가능
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  },

  // 리뷰 수정
  updateReview: async (reviewId, updateData) => {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error("로그인이 필요합니다.");

    const response = await fetch(`/api/v1/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || "리뷰 수정 실패");
    }
    return true;
  },

  // 리뷰 삭제
  deleteReview: async (reviewId) => {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error("로그인이 필요합니다.");

    const response = await fetch(`/api/v1/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || "리뷰 삭제 실패");
    }
    return true;
  },

  // --- UI State Actions ---

  // 수정 관련 액션
  startEdit: (review) =>
    set({
      editing: {
        reviewId: review.id,
        rating: review.rating,
        comment: review.comment || "",
        reviewType: review.reviewType || "BASIC",
      },
    }),

  updateEditRating: (rating) =>
    set((state) => ({
      editing: { ...state.editing, rating },
    })),

  updateEditComment: (comment) =>
    set((state) => ({
      editing: { ...state.editing, comment },
    })),

  cancelEdit: () =>
    set({
      editing: {
        reviewId: null,
        rating: 0,
        comment: "",
        reviewType: "BASIC",
      },
    }),

  // 답변 관련 액션
  setReplyReviewId: (reviewId) =>
    set({
      reply: { reviewId, text: "" },
    }),

  updateReplyText: (text) =>
    set((state) => ({
      reply: { ...state.reply, text },
    })),

  clearReply: () =>
    set({
      reply: { reviewId: null, text: "" },
    }),

  // 평점 모달 액션
  openRatingModal: ({ contentId, onSuccess }) =>
    set({
      ratingModal: {
        isOpen: true,
        contentId,
        onSuccess,
      },
    }),

  closeRatingModal: () =>
    set((state) => ({
      ratingModal: {
        ...state.ratingModal,
        isOpen: false,
        onSuccess: null,
      },
    })),

  // 사용자 관련 (단순 setter)
  setCurrentUserPublicId: (publicId) => set({ currentUserPublicId: publicId }),
}));
