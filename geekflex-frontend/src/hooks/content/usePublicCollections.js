import { useState, useEffect, useCallback } from "react";

/**
 * 공개 컬렉션 목록을 가져오는 커스텀 훅
 *
 * @param {string} sortBy - 정렬 기준 ('latest' | 'views')
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * 반환: { collections, totalElements, totalPages, isLoading, error, refetch }
 */
const usePublicCollections = (sortBy = "latest", page = 0, size = 20) => {
  const [collections, setCollections] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPublicCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // GET /api/v1/collections?sortBy=latest&page=0&size=20 요청
      const queryParams = new URLSearchParams({
        sortBy,
        page: page.toString(),
        size: size.toString(),
      });

      const response = await fetch(`/api/v1/collections?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`공개 컬렉션 데이터를 불러오는데 실패했습니다: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 공개 컬렉션 목록 응답 데이터:", result);

      // 응답 형식에 따라 데이터 추출
      const data = result.data || result;
      const content = data.content || (Array.isArray(data) ? data : []);
      setCollections(content);
      setTotalElements(data.totalElements || content.length);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("공개 컬렉션 목록 데이터 로딩 실패:", error);
      setError(error.message || "공개 컬렉션 데이터를 불러오는데 실패했습니다.");
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, page, size]);

  useEffect(() => {
    console.log("공개 컬렉션 목록 데이터 로딩 시작");
    fetchPublicCollections();
  }, [fetchPublicCollections]);

  return {
    collections,
    totalElements,
    totalPages,
    isLoading,
    error,
    refetch: fetchPublicCollections,
  };
};

export default usePublicCollections;

