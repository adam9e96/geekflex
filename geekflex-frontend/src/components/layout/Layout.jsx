import React, { useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@components/header/Header";
import Footer from "@components/footer/Footer";
import SearchModal from "@components/search/SearchModal";
import { useSearchStore } from "@stores/searchStore";
import { useUserSearch } from "@hooks/user/useUserSearch";
import { useMovieSearch } from "@hooks/content/useMovieSearch";
import { useTvSearch } from "@hooks/content/useTvSearch";
import { useKeyboardShortcuts } from "@hooks/useKeyboardShortcuts";
import "./styles/Layout.css";

/**
 * GeekFlex 레이아웃 컴포넌트
 * 헤더, 푸터를 포함한 전체 레이아웃 관리
 *
 * Props:
 * - children: 컴포넌트 태그 사이에 들어가는 내용 (main.jsx에서 <Routes>를 전달)
 *   예: <Layout><Routes>...</Routes></Layout> 에서 <Routes>...</Routes>가 children
 */
const Layout = ({ children }) => {
  // 검색 스토어 (Layout에서 필요한 것만 구독)
  const isSearchOpen = useSearchStore((state) => state.isSearchOpen);
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const activeResultIndex = useSearchStore((state) => state.activeResultIndex);
  const setActiveResultIndex = useSearchStore((state) => state.setActiveResultIndex);
  const activeTab = useSearchStore((state) => state.activeTab);
  const handleSearchClick = useSearchStore((state) => state.handleSearchClick);
  const handleCloseSearch = useSearchStore((state) => state.handleCloseSearch);
  const performSearch = useSearchStore((state) => state.performSearch);
  const setUserResults = useSearchStore((state) => state.setUserResults);
  const setMovieResults = useSearchStore((state) => state.setMovieResults);
  const setTvResults = useSearchStore((state) => state.setTvResults);
  
  // 검색 결과 (useKeyboardShortcuts에서 사용)
  const userResults = useSearchStore((state) => state.userResults);
  const movieResults = useSearchStore((state) => state.movieResults);
  const tvResults = useSearchStore((state) => state.tvResults);

  // 검색 훅들
  const { userResults: userResultsFromHook, userTotalCount, isUserSearchLoading: isUserLoading, searchUsers } = useUserSearch();
  const { movieResults: movieResultsFromHook, movieTotalCount, isMovieSearchLoading: isMovieLoading, searchMovies } = useMovieSearch();
  const { tvResults: tvResultsFromHook, tvTotalCount, isTvSearchLoading: isTvLoading, searchTv } = useTvSearch();

  // Refs
  const searchInputRef = useRef(null);
  const searchModalRef = useRef(null);

  // activeTab에 따라 현재 검색 결과 반환 (useKeyboardShortcuts에서 사용)
  const searchResults = (() => {
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
  })();

  // 검색 결과를 스토어에 동기화
  useEffect(() => {
    setUserResults(userResultsFromHook, userTotalCount, isUserLoading);
  }, [userResultsFromHook, userTotalCount, isUserLoading, setUserResults]);

  useEffect(() => {
    setMovieResults(movieResultsFromHook, movieTotalCount, isMovieLoading);
  }, [movieResultsFromHook, movieTotalCount, isMovieLoading, setMovieResults]);

  useEffect(() => {
    setTvResults(tvResultsFromHook, tvTotalCount, isTvLoading);
  }, [tvResultsFromHook, tvTotalCount, isTvLoading, setTvResults]);

  // 검색어 변경 시 자동 검색 (디바운스)
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, searchUsers, searchMovies, searchTv);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch, searchUsers, searchMovies, searchTv]);

  // 검색어가 비어있을 때 결과 초기화
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

  // 검색 모달 열릴 때 입력 필드 포커스
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);


  // 키보드 단축키 처리
  useKeyboardShortcuts({
    isSearchOpen,
    handleSearchClick,
    handleCloseSearch,
    searchResults,
    activeResultIndex,
    setActiveResultIndex,
    activeTab,
  });

  // 검색 모달이 열려있을 때 배경 스크롤 막기
  useEffect(() => {
    if (isSearchOpen) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      // html과 body 스크롤 막기 (모달 내부 스크롤은 유지)
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.position = "fixed";
      document.documentElement.style.top = `-${scrollY}px`;
      document.documentElement.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // 스크롤 복원
      const scrollY = document.documentElement.style.top;
      document.documentElement.style.overflow = "";
      document.documentElement.style.position = "";
      document.documentElement.style.top = "";
      document.documentElement.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // cleanup: 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.position = "";
      document.documentElement.style.top = "";
      document.documentElement.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  return (
    <>
      <Header
        onSearchClick={handleSearchClick}
      />

      <main className="layout-main-content">
        {children}
      </main>

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <SearchModal
        searchInputRef={searchInputRef}
        searchModalRef={searchModalRef}
      />
    </>
  );
};

export default Layout;
