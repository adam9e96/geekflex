import { create } from "zustand";
import * as userService from "@services/userService";
import { getErrorMessage } from "@services/apiClient";

/**
 * 사용자 정보 관리 스토어
 *
 * @param {Object} set - Zustand의 set 함수
 * @returns {Object} 사용자 정보 관리 스토어
 */
export const useUserStore = create((set) => ({
  // 상태
  currentUser: null, // 현재 로그인한 사용자의 상세 정보
  selectedUser: null, // 선택된 다른 사용자 정보

  // 상태 관리 세분화
  currentUserStatus: { loading: false, error: null },
  selectedUserStatus: { loading: false, error: null },

  // 하위 호환성을 위한 getter (필요시 컴포넌트에서 수정 권장)
  // isLoading, error getter는 제거하고 컴포넌트에서 status 객체를 사용하도록 유도

  /**
   * 현재 사용자 상세 정보 가져오기
   */
  fetchCurrentUser: async () => {
    set({ currentUserStatus: { loading: true, error: null } });

    try {
      const data = await userService.fetchMe();
      set({
        currentUser: data,
        currentUserStatus: { loading: false, error: null },
      });
      return data;
    } catch (error) {
      console.error("현재 사용자 정보 가져오기 오류:", error);
      const errorMessage =
        error.response?.status === 401 || error.response?.status === 403
          ? "인증이 필요합니다."
          : getErrorMessage(error);

      set({
        currentUser: null,
        currentUserStatus: { loading: false, error: errorMessage },
      });
      return null;
    }
  },

  /**
   * publicId로 사용자 정보 가져오기
   */
  fetchUserByPublicId: async (publicId) => {
    if (!publicId) {
      set({ selectedUser: null });
      return null;
    }

    set({ selectedUserStatus: { loading: true, error: null } });

    try {
      const userData = await userService.fetchUserByPublicId(publicId);
      set({
        selectedUser: userData,
        selectedUserStatus: { loading: false, error: null },
      });
      return userData;
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      const errorMessage =
        error.response?.status === 404 ? "유저를 찾을 수 없습니다." : getErrorMessage(error);

      set({
        selectedUser: null,
        selectedUserStatus: { loading: false, error: errorMessage },
      });
      return null;
    }
  },

  /**
   * 현재 사용자 정보 업데이트
   */
  updateCurrentUser: async (updateData) => {
    set({ currentUserStatus: { loading: true, error: null } });

    try {
      const data = await userService.updateCurrentUser(updateData);
      set({
        currentUser: data,
        currentUserStatus: { loading: false, error: null },
      });
      return data;
    } catch (error) {
      console.error("사용자 정보 업데이트 오류:", error);
      const errorMessage =
        error.response?.status === 401 || error.response?.status === 403
          ? "인증이 필요합니다."
          : getErrorMessage(error);

      set({
        currentUserStatus: { loading: false, error: errorMessage },
      });
      return null;
    }
  },

  /**
   * 비밀번호 확인하기
   */
  verifyPassword: async (password) => {
    try {
      await userService.verifyPassword(password);
      console.log("비밀번호 확인 성공");
      return true;
    } catch (error) {
      console.error("비밀번호 확인 오류:", error);

      if (error.response?.status === 401) {
        throw new Error("인증이 필요합니다. 다시 로그인해주세요.");
      } else if (error.response?.status === 400) {
        throw new Error(getErrorMessage(error) || "비밀번호가 일치하지 않습니다.");
      } else if (error.response?.status === 403) {
        throw new Error(
          getErrorMessage(error) || "소셜 로그인 사용자는 비밀번호를 확인할 수 없습니다.",
        );
      } else {
        throw new Error(getErrorMessage(error) || "비밀번호 확인 중 오류가 발생했습니다.");
      }
    }
  },

  /**
   * 에러 초기화
   */
  clearErrors: () => {
    set((state) => ({
      currentUserStatus: { ...state.currentUserStatus, error: null },
      selectedUserStatus: { ...state.selectedUserStatus, error: null },
    }));
  },

  /**
   * 현재 사용자 정보 초기화
   */
  clearCurrentUser: () => {
    set({
      currentUser: null,
      currentUserStatus: { loading: false, error: null },
    });
  },

  /**
   * 선택된 사용자 정보 초기화
   */
  clearSelectedUser: () => {
    set({
      selectedUser: null,
      selectedUserStatus: { loading: false, error: null },
    });
  },
}));
