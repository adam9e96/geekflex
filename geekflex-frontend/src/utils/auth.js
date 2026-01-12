/**
 * JWT 토큰 관리 유틸리티
 * - accessToken: sessionStorage에만 저장 (탭 닫으면 사라짐)
 * - refreshToken: HttpOnly 쿠키로 저장 (서버에서 관리)
 */
import { publicApi, authenticatedApi } from "@services/apiClient";

export const ACCESS_TOKEN_KEY = "accessToken";

/**
 * 액세스 토큰 저장
 * @param {string} accessToken - 액세스 토큰 (응답 본문에서 받음)
 * @since 2025-12-19
 * 참고: refreshToken은 서버에서 HttpOnly 쿠키로 자동 설정되므로 프론트엔드에서 저장할 필요 없음
 */
export const saveTokens = (accessToken) => {
  try {
    // 세션스토리지에만 저장 (탭 닫으면 사라짐)
    if (accessToken) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
  } catch (error) {
    console.error("토큰 저장 오류:", error);
    throw new Error("토큰 저장에 실패했습니다.");
  }
};

/**
 * 액세스 토큰 조회
 * @returns {string|null} 액세스 토큰 또는 null
 */
export const getAccessToken = () => {
  try {
    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("액세스 토큰 조회 오류:", error);
    return null;
  }
};

/**
 * 로그인 상태 확인
 * getAccessToken() 호출 후 존재 여부 확인
 * @returns {boolean} 로그인 여부 (accessToken 존재 여부)
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * 모든 토큰 삭제 (로그아웃)
 * HttpOnly 쿠키(refreshToken)는 서버에서 삭제해야 하므로, 서버에 로그아웃 요청을 보냄
 */
export const clearTokens = async () => {
  const accessToken = getAccessToken();

  try {
    // 서버에 로그아웃 요청 (서버에서 refreshToken 쿠키 삭제)
    const api = accessToken ? authenticatedApi : publicApi;
    await api.post("/api/v1/auth/logout").catch(() => {
      // 서버 요청 실패해도 클라이언트 상태는 정리
    });
  } catch (error) {
    console.error("토큰 삭제 오류:", error);
  } finally {
    // 항상 클라이언트 상태 정리 (세션스토리지에서 accessToken 삭제)
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

/**
 * 토큰 갱신 (액세스 토큰만 업데이트)
 * refreshToken은 HttpOnly 쿠키로 자동 전송됨
 * @returns {Promise<string>} 새로운 accessToken
 */
export const updateAccessToken = async () => {
  try {
    const response = await publicApi.post("/api/v1/auth/refresh");

    // 응답 본문에서 새 accessToken 받기
    const data = response.data;
    const newAccessToken = data.accessToken;

    if (!newAccessToken) {
      throw new Error("새로운 accessToken을 받지 못했습니다.");
    }

    // 새 accessToken 저장 (세션스토리지에만 저장)
    saveTokens(newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("액세스 토큰 갱신 오류:", error);
    throw error;
  }
};
