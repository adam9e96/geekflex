import { create } from "zustand";

/**
 * 프로필 팝업 상태 관리 스토어
 * @reviewed 2026-01-23 - 검토 완료
 */
export const useProfileStore = create((set) => ({
  isOpen: false,
  userPublicId: null,
  userData: null,

  // 팝업 열기
  openProfilePopup: (userPublicId, userData) =>
    set({
      isOpen: true,
      userPublicId,
      userData: {
        nickname: userData?.nickname,
        profileImage: userData?.profileImage || null,
      },
    }),

  // 팝업 닫기
  closeProfilePopup: () =>
    set({
      isOpen: false,
      userPublicId: null,
      userData: null,
    }),
}));
