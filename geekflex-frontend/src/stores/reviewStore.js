import { create } from "zustand";

/**
 * 리뷰 관련 상태 관리 스토어
 * ReviewList 컴포넌트의 state를 관리하는 예시
 */
export const useReviewStore = create((set, get) => ({
  // 리뷰 데이터
  reviews: [],
  isLoading: true,
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

  // 프로필 팝업
  profilePopup: {
    isOpen: false,
    userPublicId: null,
    userData: null,
  },

  // 사용자
  currentUserPublicId: null,

  // 액션들
  setReviews: (reviews) => set({ reviews, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

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
      reply: {
        reviewId,
        text: "",
      },
    }),

  updateReplyText: (text) =>
    set((state) => ({
      reply: { ...state.reply, text },
    })),

  clearReply: () =>
    set({
      reply: { reviewId: null, text: "" },
    }),

  // 프로필 팝업 액션
  openProfilePopup: (userPublicId, userData) =>
    set({
      profilePopup: {
        isOpen: true,
        userPublicId,
        userData: {
          nickname: userData?.nickname || "사용자",
          profileImage: userData?.profileImage || null,
        },
      },
    }),

  closeProfilePopup: () =>
    set({
      profilePopup: {
        isOpen: false,
        userPublicId: null,
        userData: null,
      },
    }),

  // 사용자 관련
  setCurrentUserPublicId: (publicId) => set({ currentUserPublicId: publicId }),
}));

