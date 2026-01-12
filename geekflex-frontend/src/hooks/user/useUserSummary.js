import { useState, useCallback } from "react";
import { getAccessToken } from "@utils/auth";

/**
 * 사용자 요약 정보를 가져오는 커스텀 훅
 * 헤더에 표시할 사용자 정보 (nickname, profileImage, userId)를 조회합니다.
 * GET /api/v1/users/me/summary
 */
export const useUserSummary = () => {
  const [userSummary, setUserSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 사용자 요약 정보 가져오기
   * @returns {Promise<{nickname: string, profileImage: string | null, userId: string} | null>}
   */
  const fetchUserSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 토큰 확인
      const token = getAccessToken();

      if (!token) {
        // 토큰이 없으면 null 반환 (에러로 처리하지 않음)
        setUserSummary(null);
        setIsLoading(false);
        return null;
      }

      console.log("사용자 요약 정보 요청 시작:", {
        url: "/api/v1/users/me/summary",
        hasToken: !!token,
      });

      // 직접 fetch 사용
      const response = await fetch("/api/v1/users/me/summary", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // refreshToken 쿠키 자동 전송
      });

      console.log("사용자 요약 정보 응답:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      // 401 에러는 인증되지 않은 상태로 처리 (에러로 처리하지 않음)
      if (response.status === 401) {
        console.log("인증되지 않은 사용자");
        setUserSummary(null);
        setIsLoading(false);
        return null;
      }

      if (!response.ok) {
        // 기타 에러 처리
        let errorMessage = "";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || "";
          console.error("에러 응답 데이터:", errorData);
        } catch (parseError) {
          console.error("에러 응답 파싱 실패:", parseError);
        }

        throw new Error(errorMessage || `서버 오류가 발생했습니다. (${response.status})`);
      }

      const data = await response.json();
      console.log("사용자 요약 정보 가져오기 성공:", data);

      // 응답 데이터 구조 확인 및 설정
      const summaryData = {
        nickname: data.nickname || null,
        profileImage: data.profileImage || null,
        userId: data.userId || null,
      };

      setUserSummary(summaryData);
      return summaryData;
    } catch (err) {
      console.error("사용자 요약 정보 가져오기 오류:", err);
      const errorMessage = err.message || "사용자 정보를 가져오는 중 오류가 발생했습니다.";
      setError(errorMessage);
      setUserSummary(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    userSummary,
    isLoading,
    error,
    fetchUserSummary,
  };
};
