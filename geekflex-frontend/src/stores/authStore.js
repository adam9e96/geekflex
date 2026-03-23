import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { isAuthenticated, getAccessToken, ACCESS_TOKEN_KEY, saveTokens } from "@utils/auth";
import { authenticatedApi, publicApi, getErrorMessage } from "@services/apiClient";

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated - 인증 상태
 * @property {{nickname: string|null, profileImage: string|null}} userProfile - 사용자 프로필 정보
 * @property {boolean} isLoading - 로딩 상태
 * @property {string} loginError - 로그인 에러 메시지
 * @property {string} logoutMessage - 로그아웃 메시지
 * @property {function(boolean): void} setAuthenticated - 인증 상태 설정 함수
 * @property {function(Object): void} setUserProfile - 사용자 프로필 정보 설정 함수
 * @property {function(): void} resetUserProfile - 사용자 프로필 정보 초기화 함수
 * @property {function(): Promise<void>} fetchUserProfile - 사용자 프로필 정보 가져오기 함수
 * @property {function(): void} checkAuth - 인증 상태 확인 함수
 * @property {function(string, string): Promise<{success: boolean, message?: string}>} login - 로그인 함수
 * @property {function(): Promise<void>} logout - 로그아웃 함수
 * @property {function(string): void} setLoginError - 로그인 에러 설정 함수
 * @property {function(): void} clearLoginError - 로그인 에러 초기화 함수
 * @property {function(string): void} setLogoutMessage - 로그아웃 메시지 설정 함수
 * @property {function(): void} clearLogoutMessage - 로그아웃 메시지 초기화 함수
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<AuthState>>} */
export const useAuthStore = create(
  devtools(
    (set, get) => ({
      isAuthenticated: isAuthenticated(),
      userProfile: {
        nickname: null,
        profileImage: null,
      },
      isLoading: false,
      loginError: "",
      logoutMessage: "",
      setAuthenticated: (value) => set({ isAuthenticated: value }),

      setUserProfile: (profile) =>
        set({
          userProfile: {
            nickname: profile?.nickname || null,
            profileImage: profile?.profileImage || null,
          },
        }),

      resetUserProfile: () => {
        set({
          userProfile: {
            nickname: null,
            profileImage: null,
          },
        });
      },

      fetchUserProfile: async () => {
        try {
          // 토큰 확인
          const accessToken = getAccessToken();
          if (!accessToken || !isAuthenticated()) {
            get().resetUserProfile();
            return;
          }

          const response = await authenticatedApi.get("/api/v1/users/me/summary");
          const data = response.data;

          get().setUserProfile({
            nickname: data.nickname || null,
            profileImage: data.profileImage || null,
          });
        } catch (error) {
          console.error("프로필 정보 가져오기 오류:", error);
          // 401 에러는 인증되지 않은 상태로 처리
          if (error.response?.status === 401) {
            get().resetUserProfile();
            return;
          }
          get().resetUserProfile();
        }
      },

      // 인증 상태 확인
      checkAuth: () => {
        const loggedIn = isAuthenticated();
        // 인증 상태 업데이트
        set({ isAuthenticated: loggedIn });

        if (loggedIn) {
          // 로그인 상태일 때 프로필 정보 가져오기
          get().fetchUserProfile();
        } else {
          // 로그아웃 시 프로필 정보 초기화
          get().resetUserProfile();
        }
        set({ isLoading: false });
      },

      // 로그인 (서버 요청 포함)
      login: async (username, password) => {
        try {
          // 1. 서버에 로그인 요청
          const response = await publicApi.post("/api/v1/auth/login", {
            username: username.trim(),
            password: password,
          });

          const data = response.data;

          if (!data.accessToken) {
            console.error("accessToken이 응답에 없습니다:", data);
            get().setLoginError("로그인 응답 형식이 올바르지 않습니다.");
            return { success: false, message: "로그인 응답 형식이 올바르지 않습니다." };
          }

          // 2. 토큰 저장 (accessToken만 저장, refreshToken은 서버에서 HttpOnly 쿠키로 자동 저장됨)
          try {
            saveTokens(data.accessToken);
            console.log(
              "로그인 성공 - accessToken 저장 완료, refreshToken은 서버에서 HttpOnly 쿠키로 자동 설정됨",
            );
          } catch (storageError) {
            console.error("토큰 저장 실패:", storageError);
            get().setLoginError("토큰 저장에 실패했습니다. 다시 시도해주세요.");
            return { success: false, message: "토큰 저장에 실패했습니다. 다시 시도해주세요." };
          }

          // 3. 인증 상태 업데이트
          get().checkAuth();
          get().clearLoginError();

          return { success: true };
        } catch (error) {
          console.error("로그인 요청 오류:", error);

          // 401, 403은 잘못된 자격증명
          if (error.response?.status === 401 || error.response?.status === 403) {
            const errorMessage = "아이디(이메일) 또는 비밀번호가 올바르지 않습니다.";
            get().setLoginError(errorMessage);
            return { success: false, message: errorMessage };
          }

          // 그 외 에러는 getErrorMessage 사용
          const errorMessage = getErrorMessage(error);
          get().setLoginError(errorMessage);
          return { success: false, message: errorMessage };
        }
      },

      // 로그아웃 (서버 요청 포함)
      logout: async () => {
        try {
          // 1. 서버에 로그아웃 요청
          const accessToken = getAccessToken();

          // 토큰이 있으면 authenticatedApi, 없으면 publicApi 사용
          const api = accessToken ? authenticatedApi : publicApi;

          await api.post("/api/v1/auth/logout").catch(() => {
            // 서버 요청 실패해도 클라이언트 상태는 정리
            console.warn("로그아웃 서버 요청 실패 (클라이언트 상태는 정리됨)");
          });

          // 2. 클라이언트 상태 정리 (세션스토리지에서 accessToken 삭제)
          if (accessToken) {
            sessionStorage.removeItem(ACCESS_TOKEN_KEY);
          }

          // 3. 상태 업데이트 (Zustand subscribe가 자동으로 감지)
          set({
            isAuthenticated: false,
          });
          get().resetUserProfile();
        } catch (error) {
          console.error("로그아웃 오류:", error);
          // 에러가 나도 클라이언트 상태는 정리
          sessionStorage.removeItem(ACCESS_TOKEN_KEY);
          // 상태 업데이트 (Zustand subscribe가 자동으로 감지)
          set({
            isAuthenticated: false,
          });
          get().resetUserProfile();
        }
      },

      // 로그인 에러 관리
      setLoginError: (error) => set({ loginError: error }),
      clearLoginError: () => set({ loginError: "" }),

      // 로그아웃 메시지 관리
      setLogoutMessage: (message) => set({ logoutMessage: message }),
      clearLogoutMessage: () => set({ logoutMessage: "" }),
    }),
    {
      name: "AuthStore", // DevTools에서 표시될 이름
      enabled: import.meta.env.DEV, // 개발 환경에서만 활성화
    },
  ),
);
