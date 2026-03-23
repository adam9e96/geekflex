import { useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "@stores/searchStore";

/**
 * 검색 모달 로직을 관리하는 커스텀 훅
 * @param {React.RefObject} searchInputRef - 검색 입력 필드 참조
 * @returns {Object} 검색 모달 상태 및 핸들러
 */
export const useSearchModal = (searchInputRef) => {
  const navigate = useNavigate();

  const {
    isSearchOpen,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    searchCounts,
    searchHistory,
    activeResultIndex,
    setActiveResultIndex,
    addToSearchHistory,
    removeFromSearchHistory,
    handleCloseSearch,
    handleHistoryClick: storeHandleHistoryClick,
    userResults,
    isUserSearchLoading,
    movieResults,
    isMovieSearchLoading,
    tvResults,
    isTvSearchLoading,
  } = useSearchStore();

  useEffect(() => {
    if (isSearchOpen && searchInputRef?.current) {
      const focusInput = () => {
        searchInputRef.current?.focus();
      };

      focusInput();

      requestAnimationFrame(() => {
        focusInput();
        requestAnimationFrame(focusInput);
      });

      const timeoutId = setTimeout(focusInput, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isSearchOpen, searchInputRef]);

  useEffect(() => {
    setActiveResultIndex(-1);
  }, [searchQuery, setActiveResultIndex]);

  const handleInputKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        addToSearchHistory(searchQuery);
        setSearchQuery(searchQuery);
      }
    },
    [searchQuery, addToSearchHistory, setSearchQuery],
  );

  const handleInputChange = useCallback(
    (e) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery],
  );

  const handleInputClear = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  const handleResultClick = useCallback(
    (result) => {
      if (!result) return;
      if (result.tmdbId) {
        const path = activeTab === "movie" ? `/movie/${result.tmdbId}` : `/tv/${result.tmdbId}`;
        navigate(path);
      } else if (result.publicId) {
        navigate(`/user/${result.publicId}`);
      }
      handleCloseSearch();
    },
    [activeTab, navigate, handleCloseSearch],
  );

  const handleHistoryClick = useCallback(
    (item) => {
      storeHandleHistoryClick(item);
    },
    [storeHandleHistoryClick],
  );

  const handleHistoryRemove = useCallback(
    (e, item) => {
      e.stopPropagation();
      removeFromSearchHistory(item);
    },
    [removeFromSearchHistory],
  );

  const currentResults = useMemo(() => {
    switch (activeTab) {
      case "movie":
        return { items: movieResults, loading: isMovieSearchLoading };
      case "tv":
        return { items: tvResults, loading: isTvSearchLoading };
      case "user":
        return { items: userResults, loading: isUserSearchLoading };
      default:
        return { items: [], loading: false };
    }
  }, [
    activeTab,
    movieResults,
    isMovieSearchLoading,
    tvResults,
    isTvSearchLoading,
    userResults,
    isUserSearchLoading,
  ]);

  const input = useMemo(
    () => ({
      value: searchQuery,
      onChange: handleInputChange,
      onKeyDown: handleInputKeyDown,
      onClear: handleInputClear,
    }),
    [searchQuery, handleInputChange, handleInputKeyDown, handleInputClear],
  );

  const tabs = useMemo(
    () => ({
      activeTab,
      counts: searchCounts,
      onChange: setActiveTab,
    }),
    [activeTab, searchCounts, setActiveTab],
  );

  const resultsView = useMemo(
    () => ({
      activeTab,
      items: currentResults.items,
      loading: currentResults.loading,
      activeIndex: activeResultIndex,
      onSelect: handleResultClick,
    }),
    [activeTab, currentResults, activeResultIndex, handleResultClick],
  );

  const history = useMemo(
    () => ({
      items: searchHistory,
      onSelect: handleHistoryClick,
      onRemove: handleHistoryRemove,
    }),
    [searchHistory, handleHistoryClick, handleHistoryRemove],
  );

  return {
    isOpen: isSearchOpen,
    searchQuery,
    onClose: handleCloseSearch,
    input,
    tabs,
    resultsView,
    history,
  };
};
