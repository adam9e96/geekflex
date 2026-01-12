/**
 * Axios 기반 API 클라이언트
 * - 인증이 필요한 요청과 공개 요청을 분리
 * - 토큰 자동 추가 및 갱신
 * - 통합 에러 처리
 */
import axios from "axios";
import { getAccessToken, clearTokens, updateAccessToken, saveTokens } from "@utils/auth";
import { getErrorMessage, logError, getErrorType } from "@utils/errorUtils";

/**
 * API 베이스 URL (프록시 사용 시 빈 문자열)
 * @type {string}
 * @since 2025-12-27
 */
const API_BASE_URL = "";

/**
 * 공개 API 인스턴스 (인증 불필요)
 * - 로그인, 회원가입, 공개 콘텐츠 조회 등
 * 사용 예시: publicApi.get("/api/v1/movies");
 * @returns {AxiosInstance} Axios 인스턴스
 * @since 2025-12-27
 */
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초
  withCredentials: true, // refreshToken 쿠키 자동 전송
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 인증이 필요한 API 인스턴스
 * - 사용자 정보, 리뷰, 컬렉션 등
 * 사용 예시: authenticatedApi.get("/api/v1/users/me");
 * @returns {AxiosInstance} Axios 인스턴스'
 * @since 2025-12-27
 */
export const authenticatedApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초
  withCredentials: true, // refreshToken 쿠키 자동 전송
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 갱신 중인지 추적 (무한 루프 방지)
let isRefreshing = false;
let failedQueue = [];

/**
 * 실패한 요청을 재시도하는 함수
 * 토큰 갱신 중 실패한 요청들을 일괄 처리하기 위해 사용
 * @param {Error} error - 에러 객체
 * @param {string} token - 토큰
 * @returns {void}
 * @since 2025-12-27
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * 인증 API 요청 인터셉터 - 토큰 자동 추가
 *  @param {AxiosRequestConfig} config - Axios 요청 설정
 * @since 2025-12-27
 */
authenticatedApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData인 경우 Content-Type 제거 (브라우저가 자동 설정)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 인증 API 응답 인터셉터 - 401 처리 및 토큰 갱신
 * @param {AxiosResponse} response - Axios 응답 객체
 * @returns {AxiosResponse} Axios 응답 객체
 * @since 2025-12-27
 */
authenticatedApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authenticatedApi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 시도
        const newToken = await updateAccessToken();

        if (!newToken) {
          throw new Error("토큰 갱신 실패");
        }

        // 대기 중인 요청들 처리
        processQueue(null, newToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return authenticatedApi(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 대기 중인 요청들 모두 실패 처리
        processQueue(refreshError, null);

        // 토큰 정리 및 로그인 페이지로 리다이렉트
        await clearTokens();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * 공개 API 응답 인터셉터 - 기본 에러 처리
 */
publicApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * API 응답 데이터 추출 헬퍼
 * @param {Object} response - Axios 응답 객체
 * @returns {*} 응답 데이터
 */
export const getResponseData = (response) => {
  // 일부 API는 { success: true, data: ... } 형태로 응답
  if (response.data?.success && response.data?.data) {
    return response.data.data;
  }
  return response.data;
};

// errorUtils에서 재export (하위 호환성을 위해)
export { getErrorMessage, logError, getErrorType } from "@utils/errorUtils";

export default {
  publicApi,
  authenticatedApi,
  getErrorMessage,
  getResponseData,
};
