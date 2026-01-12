/**
 * 에러 처리 유틸리티
 * - HTTP 상태 코드별 표준 메시지 정의
 * - 에러 타입 분류 및 처리
 * - 사용자 친화적인 에러 메시지 변환
 */

/**
 * HTTP 상태 코드별 표준 에러 메시지
 * @type {Object}
 * @since 2025-12-27
 */
export const ERROR_MESSAGES = {
  // 4xx 클라이언트 에러
  400: "잘못된 요청입니다. 입력한 정보를 확인해주세요.",
  401: "인증이 필요합니다. 다시 로그인해주세요.",
  403: "접근 권한이 없습니다.",
  404: "요청한 리소스를 찾을 수 없습니다.",
  405: "허용되지 않은 요청 방법입니다.",
  409: "이미 존재하는 데이터입니다.",
  422: "입력한 정보를 확인해주세요.",
  429: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  
  // 5xx 서버 에러
  500: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  502: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
  503: "서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
  504: "서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
  
  // 네트워크 에러
  NETWORK_ERROR: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
  TIMEOUT_ERROR: "요청 시간이 초과되었습니다. 다시 시도해주세요.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.",
};

/**
 * 에러 타입 분류
 * @type {Object}
 * @since 2025-12-27
 */
export const ERROR_TYPES = {
  NETWORK: "NETWORK",
  TIMEOUT: "TIMEOUT",
  VALIDATION: "VALIDATION",
  AUTHENTICATION: "AUTHENTICATION",
  AUTHORIZATION: "AUTHORIZATION",
  NOT_FOUND: "NOT_FOUND",
  SERVER: "SERVER",
  UNKNOWN: "UNKNOWN",
};

/**
 * Axios 에러에서 에러 타입 추출
 * @param {Error} error - Axios 에러 객체
 * @returns {string} 에러 타입
 */
export const getErrorType = (error) => {
  // 네트워크 에러
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return ERROR_TYPES.TIMEOUT;
    }
    return ERROR_TYPES.NETWORK;
  }

  const status = error.response.status;

  // 상태 코드별 타입 분류
  switch (status) {
    case 400:
    case 422:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.AUTHORIZATION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 * @param {Error} error - Axios 에러 객체 또는 일반 Error 객체
 * @param {Object} options - 옵션
 * @param {string} options.defaultMessage - 기본 메시지
 * @param {boolean} options.useServerMessage - 서버 메시지 우선 사용 여부
 * @returns {string} 사용자 친화적인 에러 메시지
 */
export const getErrorMessage = (error, options = {}) => {
  const { defaultMessage, useServerMessage = true } = options;

  // 일반 Error 객체인 경우
  if (!error.response && error.message) {
    return error.message || defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // 네트워크 에러
  if (!error.response) {
    const errorType = getErrorType(error);
    if (errorType === ERROR_TYPES.TIMEOUT) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const status = error.response.status;
  const data = error.response.data;

  // 서버에서 제공한 에러 메시지 우선 사용
  if (useServerMessage) {
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }
    // 필드별 에러 메시지가 있는 경우
    if (data?.errors && typeof data.errors === "object") {
      const firstError = Object.values(data.errors)[0];
      if (Array.isArray(firstError)) {
        return firstError[0];
      }
      if (typeof firstError === "string") {
        return firstError;
      }
    }
  }

  // 상태 코드별 기본 메시지
  const statusMessage = ERROR_MESSAGES[status];
  if (statusMessage) {
    return statusMessage;
  }

  // 기본 메시지
  return defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * 에러 로깅 (개발 환경에서만)
 * @param {Error} error - 에러 객체
 * @param {string} context - 에러 발생 컨텍스트
 */
export const logError = (error, context = "") => {
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` in ${context}` : ""}]`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });
  }
};

/**
 * 에러 객체 생성 헬퍼
 * @param {string} message - 에러 메시지
 * @param {number} status - HTTP 상태 코드 (선택)
 * @param {*} data - 추가 데이터 (선택)
 * @returns {Error} 에러 객체
 */
export const createError = (message, status = null, data = null) => {
  const error = new Error(message);
  if (status) {
    error.status = status;
  }
  if (data) {
    error.data = data;
  }
  return error;
};

/**
 * 에러가 특정 타입인지 확인
 * @param {Error} error - 에러 객체
 * @param {string} errorType - 확인할 에러 타입
 * @returns {boolean}
 */
export const isErrorType = (error, errorType) => {
  return getErrorType(error) === errorType;
};

/**
 * 에러가 특정 상태 코드인지 확인
 * @param {Error} error - 에러 객체
 * @param {number} status - 확인할 상태 코드
 * @returns {boolean}
 */
export const isErrorStatus = (error, status) => {
  return error.response?.status === status;
};

/**
 * 재시도 가능한 에러인지 확인
 * @param {Error} error - 에러 객체
 * @returns {boolean}
 */
export const isRetryableError = (error) => {
  const errorType = getErrorType(error);
  const status = error.response?.status;

  // 네트워크 에러나 타임아웃은 재시도 가능
  if (errorType === ERROR_TYPES.NETWORK || errorType === ERROR_TYPES.TIMEOUT) {
    return true;
  }

  // 5xx 서버 에러는 재시도 가능
  if (status >= 500 && status < 600) {
    return true;
  }

  // 429 Too Many Requests는 재시도 가능
  if (status === 429) {
    return true;
  }

  return false;
};

/**
 * 에러 처리 표준 패턴
 * @param {Function} apiCall - API 호출 함수
 * @param {Object} options - 옵션
 * @param {Function} options.onError - 에러 발생 시 콜백
 * @param {Function} options.onSuccess - 성공 시 콜백
 * @param {string} options.context - 에러 컨텍스트
 * @returns {Promise} API 호출 결과
 */
export const handleApiError = async (apiCall, options = {}) => {
  const { onError, onSuccess, context = "" } = options;

  try {
    const result = await apiCall();
    if (onSuccess) {
      onSuccess(result);
    }
    return { success: true, data: result };
  } catch (error) {
    logError(error, context);
    const message = getErrorMessage(error);
    
    if (onError) {
      onError(error, message);
    }
    
    return {
      success: false,
      error,
      message,
      errorType: getErrorType(error),
    };
  }
};

export default {
  ERROR_MESSAGES,
  ERROR_TYPES,
  getErrorType,
  getErrorMessage,
  logError,
  createError,
  isErrorType,
  isErrorStatus,
  isRetryableError,
  handleApiError,
};
