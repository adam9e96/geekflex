import { useState, useEffect, useCallback } from "react";
import { getAccessToken } from "@utils/auth";

/**
 * 내 컬렉션 목록을 가져오는 커스텀 훅
 *
 * 반환: { collections, isLoading, error, refetch }
 */
const useMyCollections = () => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = getAccessToken();
      if (!accessToken) {
        setCollections([]);
        setError("로그인이 필요합니다.");
        setIsLoading(false);
        return;
      }

      // GET /api/v1/collections/me 요청
      const response = await fetch("/api/v1/collections/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        // 401 또는 403 에러인 경우 로그인 필요 메시지 표시
        if (response.status === 401 || response.status === 403) {
          setError("로그인이 필요합니다.");
        } else {
          setError(`내 컬렉션 데이터를 불러오는데 실패했습니다: ${response.status}`);
        }
        setCollections([]);
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      console.log("📦 내 컬렉션 목록 응답 데이터:", result);
      
      // 응답 형식에 따라 데이터 추출
      const collectionList = result.data || result;
      const collectionsArray = Array.isArray(collectionList) ? collectionList : [];
      setCollections(collectionsArray);
    } catch (error) {
      console.error("내 컬렉션 목록 데이터 로딩 실패:", error);
      // 네트워크 에러나 기타 에러의 경우에도 로그인 필요 여부 확인
      if (error.message && error.message.includes("401")) {
        setError("로그인이 필요합니다.");
      } else {
        setError(error.message || "내 컬렉션 데이터를 불러오는데 실패했습니다.");
      }
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("내 컬렉션 목록 데이터 로딩 시작");
    fetchMyCollections();
  }, [fetchMyCollections]);

  return { collections, isLoading, error, refetch: fetchMyCollections };
};

export default useMyCollections;

