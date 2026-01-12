import { create } from "zustand";
import { authenticatedApi, publicApi, getResponseData, getErrorMessage } from "@services/apiClient";

/**
 * 사용자 정보 관리 스토어
 * 
 * @param {Object} set - Zustand의 set 함수
 * @returns {Object} 사용자 정보 관리 스토어
 * @property {Object|null} currentUser - 현재 로그인한 사용자의 상세 정보 (마이페이지용)
 * @property {Object|null} selectedUser - 선택된 다른 사용자 정보 (사용자 상세 페이지용)
 * @property {boolean} isLoading - 로딩 상태
 * @property {string|null} error - 에러 메시지
 * @property {Function} fetchCurrentUser - 현재 사용자 상세 정보 가져오기 (마이페이지용)
 * @property {Function} fetchUserByPublicId - publicId로 사용자 정보 가져오기
 * @property {Function} updateCurrentUser - 현재 사용자 정보 업데이트
 * @property {Function} verifyPassword - 비밀번호 확인하기
 * @property {Function} clearCurrentUser - 현재 사용자 정보 초기화
 * @property {Function} clearSelectedUser - 선택된 사용자 정보 초기화
 * 
 * @since 2025-12-20
 * @description 사용자 상세 정보를 관리하는 스토어
 * 
 * @usage 사용처 정리
 * 
 * 📝 사용 예시:
 * - 마이페이지: 현재 사용자 상세 정보
 * - 사용자 상세 페이지: 다른 사용자 정보
 * - 프로필 업데이트: 사용자 정보 수정
 * 
 * 🔗 authStore와의 관계:
 * - authStore: 인증 관련 (로그인, 로그아웃, 기본 프로필 - nickname, profileImage)
 * - userStore: 사용자 정보 관련 (상세 정보, 다른 사용자 정보 등)
 */
export const useUserStore = create((set) => ({
  // 상태
  currentUser: null, // 현재 로그인한 사용자의 상세 정보 (마이페이지용)
  selectedUser: null, // 선택된 다른 사용자 정보 (사용자 상세 페이지용)
  isLoading: false,
  error: null,

  // 현재 사용자 상세 정보 가져오기 (마이페이지용)
  // GET /api/v1/users/me - 현재 로그인한 사용자의 전체 정보를 가져옵니다
  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await authenticatedApi.get("/api/v1/users/me");
      const data = response.data;
      
      set({ currentUser: data, error: null, isLoading: false });
      return data;
    } catch (error) {
      console.error("현재 사용자 정보 가져오기 오류:", error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        set({ currentUser: null, error: "인증이 필요합니다.", isLoading: false });
      } else {
        set({ currentUser: null, error: getErrorMessage(error), isLoading: false });
      }
      return null;
    }
  },

  // publicId로 사용자 정보 가져오기 (사용자 상세 페이지용)
  //  다른 사용자 요소를 클릭해 조회할 때 사용
  fetchUserByPublicId: async (publicId) => {
    if (!publicId) {
      set({ selectedUser: null });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      // 토큰이 있으면 authenticatedApi, 없으면 publicApi 사용
      const api = authenticatedApi;
      const response = await api.get(`/api/v1/users/${publicId}`);
      
      const userData = getResponseData(response);

      set({ selectedUser: userData, error: null, isLoading: false });
      return userData;
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      
      if (error.response?.status === 404) {
        set({ selectedUser: null, error: "유저를 찾을 수 없습니다.", isLoading: false });
      } else {
        set({ selectedUser: null, error: getErrorMessage(error), isLoading: false });
      }
      return null;
    }
  },

  // 현재 사용자 정보 업데이트
  updateCurrentUser: async (updateData) => {
    set({ isLoading: true, error: null });

    try {
      // FormData 생성 (백엔드는 항상 multipart/form-data를 기대함)
      const formData = new FormData();

      // 수정할 데이터 객체 생성
      const userUpdateRequest = {};
      if (updateData.nickname !== undefined) {
        userUpdateRequest.nickname = updateData.nickname;
      }
      if (updateData.userEmail !== undefined) {
        userUpdateRequest.userEmail = updateData.userEmail;
      }
      if (updateData.bio !== undefined) {
        userUpdateRequest.bio = updateData.bio || "";
      }
      if (updateData.marketingAgreement !== undefined) {
        userUpdateRequest.marketingAgreement = updateData.marketingAgreement;
      }
      if (updateData.currentPassword !== undefined) {
        userUpdateRequest.currentPassword = updateData.currentPassword;
      }
      if (updateData.newPassword !== undefined) {
        userUpdateRequest.newPassword = updateData.newPassword;
      }

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
      const data = response.data;
      
      // 현재 사용자 정보 업데이트
      set({ currentUser: data, error: null, isLoading: false });

      // authStore의 userProfile도 업데이트 (동기화)
      // authStore는 별도로 import해서 사용하거나, 컴포넌트에서 처리
      return data;
    } catch (error) {
      console.error("사용자 정보 업데이트 오류:", error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        set({ error: "인증이 필요합니다.", isLoading: false });
      } else {
        set({ error: getErrorMessage(error), isLoading: false });
      }
      return null;
    }
  },

  // 비밀번호 확인하기
  verifyPassword: async (password) => {
    try {
      const response = await authenticatedApi.post("/api/v1/users/me/verify-password", {
        password,
      });

      console.log("비밀번호 확인 성공:", response.data);
      return true;
    } catch (error) {
      console.error("비밀번호 확인 오류:", error);
      
      // 상태 코드별 에러 메시지
      if (error.response?.status === 401) {
        throw new Error("인증이 필요합니다. 다시 로그인해주세요.");
      } else if (error.response?.status === 400) {
        throw new Error(getErrorMessage(error) || "비밀번호가 일치하지 않습니다.");
      } else if (error.response?.status === 403) {
        throw new Error(getErrorMessage(error) || "소셜 로그인 사용자는 비밀번호를 확인할 수 없습니다.");
      } else {
        throw new Error(getErrorMessage(error) || "비밀번호 확인 중 오류가 발생했습니다.");
      }
    }
  },

  // 현재 사용자 정보 초기화
  clearCurrentUser: () => {
    set({ currentUser: null, error: null });
  },

  // 선택된 사용자 정보 초기화
  clearSelectedUser: () => {
    set({ selectedUser: null, error: null });
  },
}));
