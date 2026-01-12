import { create } from "zustand";

// 검색 히스토리 관리 헬퍼 함수
const getSearchHistory = () => {
  try {
    const stored = localStorage.getItem("searchHistory");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("검색 히스토리 로드 오류:", error);
    return [];
  }
};

const saveSearchHistory = (history) => {
  localStorage.setItem("searchHistory", JSON.stringify(history));
  return history;
};

/**
 * 검색 기능 관리 Zustand 스토어
 * 
 * @param {Object} set - Zustand의 set 함수
 * @param {Object} get - Zustand의 get 함수
 * @returns {Object} 검색 상태 관리 스토어
 * 
 * @since 2025-12-24
 * @description 검색 모달, 검색어, 검색 결과, 검색 히스토리를 관리하는 스토어
 * 
 * @usage 사용처:
 * - src/components/layout/Layout.jsx
 * - src/components/layout/SearchModal.jsx
 * - src/hooks/useKeyboardShortcuts.js
 */
export const useSearchStore = create((set, get) => ({
  // 상태
  isSearchOpen: false, // 검색 모달 열림 상태
  searchQuery: "", // 현재 검색어
  searchResults: [], // 검색 결과 배열 (사용 안 함, activeTab에 따라 결정)
  isSearchLoading: false, // 검색 로딩 상태
  activeResultIndex: -1, // 키보드로 선택된 결과 인덱스
  searchHistory: getSearchHistory(), // 검색 히스토리 배열
  activeTab: "movie", // 기본 탭: 영화
  searchCounts: {
    movie: 0,
    tv: 0,
    user: 0,
  },

  // 검색 결과 (각 훅에서 관리)
  userResults: [],
  userTotalCount: 0,
  isUserSearchLoading: false,
  movieResults: [],
  movieTotalCount: 0,
  isMovieSearchLoading: false,
  tvResults: [],
  tvTotalCount: 0,
  isTvSearchLoading: false,

  // 검색 결과 업데이트
  setUserResults: (results, totalCount, isLoading) => {
    set((state) => ({
      userResults: results,
      userTotalCount: totalCount,
      isUserSearchLoading: isLoading,
      searchCounts: {
        ...state.searchCounts,
        user: totalCount,
      },
    }));
  },

  setMovieResults: (results, totalCount, isLoading) => {
    set((state) => ({
      movieResults: results,
      movieTotalCount: totalCount,
      isMovieSearchLoading: isLoading,
      searchCounts: {
        ...state.searchCounts,
        movie: totalCount,
      },
    }));
  },

  setTvResults: (results, totalCount, isLoading) => {
    set((state) => ({
      tvResults: results,
      tvTotalCount: totalCount,
      isTvSearchLoading: isLoading,
      searchCounts: {
        ...state.searchCounts,
        tv: totalCount,
      },
    }));
  },

  // activeTab에 따라 현재 검색 결과 반환
  getCurrentSearchResults: () => {
    const { activeTab, userResults, movieResults, tvResults } = get();
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
  },

  // activeTab에 따라 현재 로딩 상태 반환
  getCurrentSearchLoading: () => {
    const { activeTab, isUserSearchLoading, isMovieSearchLoading, isTvSearchLoading } = get();
    switch (activeTab) {
      case "movie":
        return isMovieSearchLoading;
      case "tv":
        return isTvSearchLoading;
      case "user":
        return isUserSearchLoading;
      default:
        return false;
    }
  },

  // 검색 상태 리셋
  resetSearch: () => {
    set({
      searchQuery: "",
      searchResults: [],
      activeResultIndex: -1,
      searchCounts: {
        movie: 0,
        tv: 0,
        user: 0,
      },
    });
  },

  // 검색 모달 열기
  handleSearchClick: () => {
    set({ isSearchOpen: true });
    get().resetSearch();
  },

  // 검색 모달 닫기
  handleCloseSearch: () => {
    set({ isSearchOpen: false });
    get().resetSearch();
  },

  // 검색 실행 (외부에서 검색 함수를 받아서 실행)
  performSearch: async (query, searchUsersFn, searchMoviesFn, searchTvFn) => {
    if (!query.trim()) {
      set({
        searchResults: [],
        searchCounts: {
          movie: 0,
          tv: 0,
          user: 0,
        },
      });
      return;
    }

    set({ isSearchLoading: true });
    
    try {
      // 병렬로 모든 검색 실행
      if (searchUsersFn && searchMoviesFn && searchTvFn) {
        await Promise.all([
          searchUsersFn(query),
          searchMoviesFn(query),
          searchTvFn(query),
        ]);
      }
    } catch (error) {
      console.error("검색 오류:", error);
      set({
        searchCounts: {
          movie: 0,
          tv: 0,
          user: 0,
        },
      });
    } finally {
      set({ isSearchLoading: false });
    }
  },

  // 검색어 설정
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // 활성 탭 설정
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  // 활성 결과 인덱스 설정
  setActiveResultIndex: (index) => {
    set({ activeResultIndex: index });
  },

  // 검색 히스토리에 추가
  addToSearchHistory: (query) => {
    if (!query.trim()) return;

    const history = getSearchHistory();
    const newHistory = [query, ...history.filter((item) => item !== query)].slice(0, 10);
    set({ searchHistory: saveSearchHistory(newHistory) });
  },

  // 검색 히스토리에서 삭제
  removeFromSearchHistory: (query) => {
    const history = getSearchHistory();
    const newHistory = history.filter((item) => item !== query);
    set({ searchHistory: saveSearchHistory(newHistory) });
  },

  // 검색 히스토리 클릭
  handleHistoryClick: (query) => {
    get().setSearchQuery(query);
    get().addToSearchHistory(query);
  },
}));

