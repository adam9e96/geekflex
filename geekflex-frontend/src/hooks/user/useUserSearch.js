import { useState, useCallback } from "react";
import { getAccessToken } from "@utils/auth";

/**
 * 유저 검색 커스텀 훅
 * GET /api/v1/users/search?keyword={keyword}
 */
export const useUserSearch = () => {
  const [userResults, setUserResults] = useState([]);
  const [userTotalCount, setUserTotalCount] = useState(0);
  const [isUserSearchLoading, setIsUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState(null);

  /**
   * 유저 검색 실행
   * @param {string} keyword - 검색 키워드
   */
  const searchUsers = useCallback(async (keyword) => {
    if (!keyword || !keyword.trim()) {
      setUserResults([]);
      setUserTotalCount(0);
      return;
    }

    setIsUserSearchLoading(true);
    setUserSearchError(null);

    try {
      const encodedKeyword = encodeURIComponent(keyword.trim());
      const url = `/api/v1/users/search?keyword=${encodedKeyword}`;

      // 토큰 가져오기
      const token = getAccessToken();

      // 헤더 설정
      const headers = {
        "Content-Type": "application/json",
      };

      // 토큰이 있으면 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log("유저 검색 요청 시작:", {
        url,
        hasToken: !!token,
        method: "GET",
      });

      // 직접 fetch 사용
      const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include", // refreshToken 쿠키 자동 전송
      });

      console.log("유저 검색 응답:", {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        // 401 에러는 인증되지 않은 상태로 처리 (에러로 처리하지 않음)
        if (response.status === 401) {
          console.log("인증되지 않은 사용자 - 유저 검색 불가");
          setUserResults([]);
          setUserTotalCount(0);
          setIsUserSearchLoading(false);
          return;
        }

        // 에러 응답 본문 읽기
        let errorMessage = `유저 검색 실패: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error("에러 응답 파싱 실패:", parseError);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("유저 검색 결과:", {
        dataLength: Array.isArray(data) ? data.length : 0,
      });

      // 응답이 배열인지 확인
      const users = Array.isArray(data) ? data : [];

      setUserResults(users);
      setUserTotalCount(users.length);
    } catch (error) {
      console.error("유저 검색 오류:", error);
      setUserSearchError(error.message);
      setUserResults([]);
      setUserTotalCount(0);
    } finally {
      setIsUserSearchLoading(false);
    }
  }, []);

  return {
    userResults,
    userTotalCount,
    isUserSearchLoading,
    userSearchError,
    searchUsers,
  };
};
