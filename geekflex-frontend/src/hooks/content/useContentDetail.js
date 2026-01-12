import { useState, useEffect } from "react";
import { publicApi, getErrorMessage } from "@services/apiClient";

/**
 * 콘텐츠 상세 정보를 가져오는 커스텀 훅
 *
 * 입력:
 *  - tmdbId: TMDB ID (영화/TV 공통)
 *  - contentType: "movie" | "tv" (기본값: "movie")
 *
 * 처리:
 *  1. tmdbId와 contentType에 따라 알맞은 상세 API 호출
 *     - 영화: GET /api/v1/movies/{tmdbId}
 *     - 드라마: GET /api/v1/tv/{tmdbId}
 *  2. 로딩 상태, 에러 상태, 콘텐츠 데이터를 관리
 *  3. tmdbId 또는 contentType이 변경될 때마다 자동으로 데이터를 다시 가져옴
 *
 * 반환: { content, isLoading, error }
 */
const useContentDetail = (tmdbId, contentType = "movie") => {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // tmdbId 또는 contentType이 변경될 때마다 자동으로 데이터를 다시 가져옴
  useEffect(() => {
    const fetchContentDetail = async () => {
      if (!tmdbId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true); // 로딩 상태 설정 true
        setError(null); // 에러 메시지 초기화

        // 콘텐츠 타입에 따라 상세 API 엔드포인트 결정
        const basePathMap = {
          movie: "/api/v1/movies",
          tv: "/api/v1/tv",
        };
        const basePath = basePathMap[contentType] || basePathMap.movie;

        // 예) 영화: http://localhost:8080/api/v1/movies/496243
        //     드라마: http://localhost:8080/api/v1/tv/88046
        const response = await publicApi.get(`${basePath}/${tmdbId}`);

        // 응답 데이터 파싱
        const data = response.data;
        console.log("콘텐츠 상세 정보 응답:", data);
        setContent(data);
      } catch (error) {
        console.error("콘텐츠 상세 정보 로딩 실패:", error);
        setError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentDetail();
  }, [tmdbId, contentType]);

  return { content, isLoading, error };
};

export default useContentDetail;

