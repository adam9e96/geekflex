import { useState, useEffect } from "react";
import { collectionService } from "@services/collectionService";
import { EXAMPLE_COLLECTIONS } from "@utils/content/collectionConstants";

/**
 * 컬렉션 상세 정보를 가져오는 커스텀 훅
 *
 * @param {string} id - 컬렉션 ID
 * 반환: { collection, contents, isLoading, error, isExample, refetch }
 */
const useCollectionDetail = (id) => {
  const [collection, setCollection] = useState(null);
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExample, setIsExample] = useState(false);

  // 컬렉션 상세 정보를 가져오는 함수
  const fetchCollectionDetail = async (collectionId) => {
    if (!collectionId) return;

    // 예시 컬렉션인지 확인
    if (EXAMPLE_COLLECTIONS[collectionId]) {
      console.log("예시 컬렉션 데이터 로딩:", collectionId);
      setIsLoading(true);

      // 예시 컬렉션 데이터 설정
      const exampleCollection = EXAMPLE_COLLECTIONS[collectionId];
      setCollection(exampleCollection);
      setIsExample(true);

      // 예시 작품 목록 가져오기 (인기 영화 API 사용)
      try {
        // publicAPI를 사용하여 인기 영화 가져오기
        const { publicApi } = await import("@services/apiClient");
        const response = await publicApi.get("/api/v1/movies/popular");

        const data = response.data;
        // 처음 6개만 표시
        setContents(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (error) {
        console.error("예시 작품 목록 로딩 실패:", error);
        setContents([]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 실제 API 호출
    console.log("컬렉션 상세 데이터 로딩 시작:", collectionId);
    try {
      setIsLoading(true);
      setError(null);
      setIsExample(false);

      const data = await collectionService.fetchCollectionDetail(collectionId);
      console.log("📦 컬렉션 상세 응답 데이터:", data);

      setCollection(data);
      // 컬렉션에 포함된 작품 목록 (items 또는 contents 또는 movies)
      const items = data.items || data.contents || data.movies;
      setContents(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("컬렉션 상세 데이터 로딩 실패:", error);
      setError(error.message || "컬렉션 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    if (id) {
      fetchCollectionDetail(id);
    }
  }, [id]);

  // refetch 함수: 수동으로 데이터를 다시 가져올 수 있음
  const refetch = () => {
    if (id) {
      fetchCollectionDetail(id);
    }
  };

  return { collection, contents, isLoading, error, isExample, refetch };
};

export default useCollectionDetail;
