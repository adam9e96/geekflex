import { useEffect } from "react";
import { useSearchStore } from "@stores/searchStore";
import { useUserSearch } from "@hooks/user/useUserSearch";
import { useMovieSearch } from "@hooks/content/useMovieSearch";
import { useTvSearch } from "@hooks/content/useTvSearch";
import { useKeyboardShortcuts } from "@hooks/useKeyboardShortcuts";

/**
 * 전역 검색 로직을 조율하는 커스텀 훅
 * Layout 컴포넌트에서 분리됨
 */
export const useSearchCoordinator = () => {
  // 검색 스토어 구독
  const {
    isSearchOpen,
    searchQuery,
    activeTab,
    activeResultIndex,
    setActiveResultIndex,
    handleSearchClick,
    handleCloseSearch,
    performSearch,
    setUserResults,
    setMovieResults,
    setTvResults,
    // 키보드 단축키용 결과 참조
    userResults,
    movieResults,
    tvResults,
  } = useSearchStore();

  // 개별 검색 훅들
  const {
    userResults: userResultsFromHook,
    userTotalCount,
    isUserSearchLoading: isUserLoading,
    searchUsers,
  } = useUserSearch();

  const {
    movieResults: movieResultsFromHook,
    movieTotalCount,
    isMovieSearchLoading: isMovieLoading,
    searchMovies,
  } = useMovieSearch();

  const {
    tvResults: tvResultsFromHook,
    tvTotalCount,
    isTvSearchLoading: isTvLoading,
    searchTv,
  } = useTvSearch();

  // activeTab에 따라 현재 표시될 검색 결과 반환 (단축키용)
  const getCurrentSearchResults = () => {
    switch (activeTab) {
      case "movie":
        return movieResults;
      case "tv":
        return tvResults;
      case "user":
        return userResults;
      default:
        return [];
    }
  };

  const searchResults = getCurrentSearchResults();

  // 1. 검색 결과를 스토어에 동기화
  useEffect(() => {
    setUserResults(userResultsFromHook, userTotalCount, isUserLoading);
  }, [userResultsFromHook, userTotalCount, isUserLoading, setUserResults]);

  useEffect(() => {
    setMovieResults(movieResultsFromHook, movieTotalCount, isMovieLoading);
  }, [movieResultsFromHook, movieTotalCount, isMovieLoading, setMovieResults]);

  useEffect(() => {
    setTvResults(tvResultsFromHook, tvTotalCount, isTvLoading);
  }, [tvResultsFromHook, tvTotalCount, isTvLoading, setTvResults]);

  // 2. 검색어 변경 시 자동 검색 (디바운스)
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, searchUsers, searchMovies, searchTv);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch, searchUsers, searchMovies, searchTv]);

  // 3. 검색어가 비어있을 때 결과 초기화
  useEffect(() => {
    if (!searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        setUserResults([], 0, false);
        setMovieResults([], 0, false);
        setTvResults([], 0, false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, setUserResults, setMovieResults, setTvResults]);

  // 4. 키보드 단축키 설정
  useKeyboardShortcuts({
    isSearchOpen,
    handleSearchClick,
    handleCloseSearch,
    searchResults,
    activeResultIndex,
    setActiveResultIndex,
    activeTab,
  });

  return {
    isSearchOpen,
    handleSearchClick,
  };
};
