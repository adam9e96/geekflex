import { useState, useEffect, useCallback } from "react";
import { authenticatedApi, publicApi, getResponseData, getErrorMessage } from "@services/apiClient";

/**
 * 유저 상세 정보 조회 커스텀 훅
 * GET /api/v1/users/{publicId}
 */
export const useUserDetail = (publicId) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * 유저 상세 정보 조회
   */
  const fetchUserDetail = useCallback(async () => {
    if (!publicId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 토큰이 있으면 authenticatedApi, 없으면 publicApi 사용
      const api = authenticatedApi;
      const response = await api.get(`/api/v1/users/${publicId}`);

      const data = getResponseData(response);

      // 응답 구조 확인 (success, message, data 형태)
      if (data?.publicId) {
        // data가 직접 유저 정보인 경우
        setUserData(data);
      } else {
        throw new Error("유저 정보 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("유저 상세 정보 조회 실패:", err);
      
      // 404 에러는 유저를 찾을 수 없음
      if (err.response?.status === 404) {
        setError("유저를 찾을 수 없습니다.");
      } else {
        setError(getErrorMessage(err));
      }
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  // publicId가 변경되면 데이터 다시 가져오기
  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  return {
    userData,
    isLoading,
    error,
    refetch: fetchUserDetail,
  };
};

