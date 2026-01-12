import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 키보드 단축키 처리 커스텀 훅
 * 
 * 전역 키보드 단축키를 처리하여 검색 모달 제어 및 검색 결과 네비게이션을 제공합니다.
 * 
 * @param {Object} params - 훅 파라미터 객체
 * @param {boolean} params.isSearchOpen - 검색 모달 열림 상태
 * @param {Function} params.handleSearchClick - 검색 모달 열기 함수
 * @param {Function} params.handleCloseSearch - 검색 모달 닫기 함수
 * @param {Array<Object>} params.searchResults - 검색 결과 배열
 * @param {number} params.activeResultIndex - 활성 검색 결과 인덱스 (-1이면 선택 없음)
 * @param {Function} params.setActiveResultIndex - 활성 검색 결과 인덱스 설정 함수
 * @param {string} params.activeTab - 현재 활성 탭 ("movie" | "tv" | "user")
 * 
 * @returns {void}
 * 
 * @example
 * ```jsx
 * useKeyboardShortcuts({
 *   isSearchOpen,
 *   handleSearchClick,
 *   handleCloseSearch,
 *   searchResults,
 *   activeResultIndex,
 *   setActiveResultIndex,
 *   activeTab,
 * });
 * ```
 * 
 * @description
 * 지원하는 키보드 단축키:
 * - Ctrl+K (또는 Cmd+K): 검색 모달 열기/닫기 토글
 * - Ctrl+H (또는 Cmd+H): 홈 페이지로 이동
 * - ESC: 검색 모달 닫기
 * - ArrowDown: 다음 검색 결과 선택 (검색 모달이 열려있을 때)
 * - ArrowUp: 이전 검색 결과 선택 (검색 모달이 열려있을 때)
 * - Enter: 선택된 검색 결과로 이동 (검색 모달이 열려있고 결과가 선택되어 있을 때)
 */
export const useKeyboardShortcuts = ({
  isSearchOpen,
  handleSearchClick,
  handleCloseSearch,
  searchResults,
  activeResultIndex,
  setActiveResultIndex,
  activeTab,
}) => {
  const navigate = useNavigate();

  // 키보드 단축키 처리
  useEffect(() => {
    /**
     * 키보드 이벤트 핸들러
     * 
     * 전역 keydown 이벤트를 처리하여 다양한 키보드 단축키를 지원
     * 
     * @param {KeyboardEvent} e - 키보드 이벤트 객체
     * @returns {void}
     * 
     * @description
     * 처리하는 키 조합:
     * 1. Ctrl+K / Cmd+K: 검색 모달 토글
     * 2. Ctrl+H / Cmd+H: 홈으로 이동
     * 3. ESC: 검색 모달 닫기
     * 4. ArrowDown: 다음 검색 결과 선택 (모달 열림 시)
     * 5. ArrowUp: 이전 검색 결과 선택 (모달 열림 시)
     * 6. Enter: 선택된 검색 결과로 이동 (모달 열림 및 결과 선택 시)
     */
    const handleKeyDown = (e) => {
      /**
       * Ctrl+K / Cmd+K: 검색 모달 열기/닫기 토글
       * 
       * @description
       * - 검색 모달이 열려있으면 닫기
       * - 검색 모달이 닫혀있으면 열기
       */
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isSearchOpen) {
          handleCloseSearch();
        } else {
          handleSearchClick();
        }
      }

      /**
       * Ctrl+H / Cmd+H: 홈 페이지로 이동
       * 
       * @description
       * 홈 페이지("/")로 라우팅
       */
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        navigate("/");
      }

      /**
       * ESC: 검색 모달 닫기
       * 
       * @description
       * 검색 모달이 열려있을 때만 동작
       */
      if (e.key === "Escape" && isSearchOpen) {
        handleCloseSearch();
      }

      /**
       * 검색 모달 내에서 키보드 네비게이션
       * 
       * @description
       * 검색 모달이 열려있을 때만 동작
       */
      if (isSearchOpen) {
        /**
         * ArrowDown: 다음 검색 결과 선택
         * 
         * @description
         * 현재 선택된 결과의 다음 결과를 선택
         * 마지막 결과일 경우 더 이상 이동하지 않음.
         */
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveResultIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
        } 
        /**
         * ArrowUp: 이전 검색 결과 선택
         * 
         * @description
         * 현재 선택된 결과의 이전 결과를 선택
         * 첫 번째 결과이거나 선택이 없을 경우 -1로 리셋.
         */
        else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveResultIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } 
        /**
         * Enter: 선택된 검색 결과로 이동
         * 
         * @description
         * 활성화된 검색 결과가 있을 때만 동작합니다.
         * - tmdbId가 있고 contentType이 "TV"이거나 activeTab이 "tv"인 경우: /tv/{tmdbId}로 이동
         * - tmdbId가 있고 contentType이 "MOVIE"이거나 activeTab이 "movie"인 경우: /movie/{tmdbId}로 이동
         * - 그 외의 경우: 모달만 닫기
         * 
         * @param {number} activeResultIndex - 선택된 결과의 인덱스 (0 이상이어야 함)
         */
        else if (e.key === "Enter" && activeResultIndex >= 0) {
          e.preventDefault();
          const selectedResult = searchResults[activeResultIndex];
          if (selectedResult) {
            // 영화/드라마 검색 결과인 경우 상세 페이지로 이동
            if (selectedResult.tmdbId) {
              // contentType 또는 activeTab에 따라 경로 구분
              const contentType = selectedResult.contentType;
              if (contentType === "TV" || activeTab === "tv") {
                // 드라마(TV) 상세 페이지로 이동
                navigate(`/tv/${selectedResult.tmdbId}`);
              } else if (contentType === "MOVIE" || activeTab === "movie") {
                // 영화 상세 페이지로 이동
                navigate(`/movie/${selectedResult.tmdbId}`);
              } else {
                // 기본값으로 영화 경로 사용
                navigate(`/movie/${selectedResult.tmdbId}`);
              }
              handleCloseSearch();
            } else {
              // 다른 타입의 결과는 추후 구현
              handleCloseSearch();
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isSearchOpen,
    searchResults,
    activeResultIndex,
    activeTab,
    navigate,
    handleSearchClick,
    handleCloseSearch,
    setActiveResultIndex,
  ]);
};
