import { useState, useEffect, useCallback } from "react";
import { getAccessToken } from "@utils/auth";
import { buildApiUrl } from "@services/apiClient";

/**
 * 컬렉션 목록을 가져오는 커스텀 훅
 *
 * 반환: { collections, isLoading, error, showExamples, refetch }
 */
const useCollection = () => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExamples, setShowExamples] = useState(false);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // GET /api/v1/collections/me 요청 (로그인한 유저의 컬렉션 목록)
      const accessToken = getAccessToken();
      if (!accessToken) {
        // 로그인하지 않은 경우는 에러로 처리하지 않고 빈 배열 반환
        setCollections([]);
        setShowExamples(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch(buildApiUrl("/api/v1/collections/me"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`컬렉션 데이터를 불러오는데 실패했습니다: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 컬렉션 목록 응답 데이터:", result);

      // 응답 구조: { success: true, data: [...] }
      const collectionList = result?.data && Array.isArray(result.data) ? result.data : [];
      setCollections(collectionList);
      // 데이터가 없거나 빈 배열인 경우 예시 표시
      setShowExamples(collectionList.length === 0);
    } catch (error) {
      // 로그인 필요 에러는 조용하게 처리
      if (error.message === "로그인이 필요합니다.") {
        setCollections([]);
        setShowExamples(false);
        setError(null);
      } else {
        console.error("컬렉션 목록 데이터 로딩 실패:", error);
        setError(error.message || "컬렉션 데이터를 불러오는데 실패했습니다.");
        // 에러 발생 시에도 예시 표시
        setShowExamples(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("컬렉션 목록 데이터 로딩 시작");
    fetchCollections();
    // fetchCollections는 useCallback으로 메모이제이션되어 있지만,
    // 의존성 배열에서 제외하여 무한 루프 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { collections, isLoading, error, showExamples, refetch: fetchCollections };
};

export default useCollection;
