import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { FaXmark, FaClockRotateLeft, FaStar, FaSpinner, FaUser, FaFilm, FaTv, FaMagnifyingGlass } from "react-icons/fa6";
import { useSearchStore } from "@stores/searchStore";
import { getProfileImageUrl } from "@utils/imageUtils";
import "./styles/SearchModal.css";

/**
 * 검색 모달 컴포넌트
 * @headlessui/react의 Dialog를 사용하여 구현
 * 접근성(WAI-ARIA) 지원 및 Tailwind CSS 통합
 *
 * @param {React.Ref} searchInputRef - 검색 입력 필드 ref
 * @param {React.Ref} searchModalRef - 검색 모달 ref (호환성을 위해 유지)
 */
const SearchModal = ({ searchInputRef, searchModalRef }) => {
  const navigate = useNavigate();

  // Zustand store에서 필요한 상태와 함수만 선택적으로 구독
  const isOpen = useSearchStore((state) => state.isSearchOpen);
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const activeTab = useSearchStore((state) => state.activeTab);
  const setActiveTab = useSearchStore((state) => state.setActiveTab);
  const searchCounts = useSearchStore((state) => state.searchCounts);
  const searchHistory = useSearchStore((state) => state.searchHistory);
  const activeResultIndex = useSearchStore((state) => state.activeResultIndex);
  const userResults = useSearchStore((state) => state.userResults);
  const isUserSearchLoading = useSearchStore((state) => state.isUserSearchLoading);
  const movieResults = useSearchStore((state) => state.movieResults);
  const isMovieSearchLoading = useSearchStore((state) => state.isMovieSearchLoading);
  const tvResults = useSearchStore((state) => state.tvResults);
  const isTvSearchLoading = useSearchStore((state) => state.isTvSearchLoading);
  const handleCloseSearch = useSearchStore((state) => state.handleCloseSearch);
  const addToSearchHistory = useSearchStore((state) => state.addToSearchHistory);
  const removeFromSearchHistory = useSearchStore((state) => state.removeFromSearchHistory);
  const handleHistoryClick = useSearchStore((state) => state.handleHistoryClick);
  const setActiveResultIndex = useSearchStore((state) => state.setActiveResultIndex);

  // 모달이 열릴 때 입력 필드에 포커스
  useEffect(() => {
    if (isOpen && searchInputRef?.current) {
      // 여러 방법으로 포커스 시도 (DOM 렌더링 완료 보장)
      const focusInput = () => {
        if (searchInputRef?.current) {
          searchInputRef.current.focus();
          // 포커스가 실제로 적용되었는지 확인
          if (document.activeElement !== searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }
      };

      // 즉시 시도
      focusInput();
      
      // requestAnimationFrame으로 시도
      requestAnimationFrame(() => {
        focusInput();
        requestAnimationFrame(() => {
          focusInput();
        });
      });

      // setTimeout으로도 시도 (애니메이션 완료 후)
      const timeoutId = setTimeout(() => {
        focusInput();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, searchInputRef]);

  // 검색어 변경 시 활성 결과 인덱스 리셋
  useEffect(() => {
    setActiveResultIndex(-1);
  }, [searchQuery, setActiveResultIndex]);

  /**
   * 검색 입력 필드의 Enter 키 핸들러
   * @param {KeyboardEvent} e - 키보드 이벤트
   */
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      addToSearchHistory(searchQuery);
      // performSearch는 Layout에서 useEffect로 자동 호출되므로
      // 여기서는 검색어만 설정하면 됨
      setSearchQuery(searchQuery);
    }
  };

  /**
   * 검색 결과 클릭 시 호출되는 함수
   * @param {object} result - 검색 결과
   */
  const handleResultClick = (result) => {
    // 검색 결과 클릭 시 상세 페이지로 이동
    if (result && result.tmdbId) {
      // activeTab에 따라 다른 경로로 이동
      if (activeTab === "movie") {
        navigate(`/movie/${result.tmdbId}`);
      } else if (activeTab === "tv") {
        // 드라마(TV) 상세 페이지로 이동 → GET /api/v1/tv/{tmdbId}
        navigate(`/tv/${result.tmdbId}`);
      }
      handleCloseSearch();
    }
  };

  /**
   * 유저 검색 결과 클릭 시 호출되는 함수
   */
  const handleUserClick = () => {
    handleCloseSearch();
  };

  /**
   * 검색 히스토리 아이템 삭제 핸들러
   * @param {Event} e - 이벤트 객체
   * @param {string} item - 삭제할 검색어
   */
  const handleHistoryRemove = (e, item) => {
    e.stopPropagation();
    removeFromSearchHistory(item);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleCloseSearch}
      initialFocus={searchInputRef}
      id="searchModal"
      ref={searchModalRef}
      className="relative z-201"
    >
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 transition-opacity duration-300 bg-black/80" />

      {/* 모달 컨테이너 */}
      <div className="overflow-y-auto fixed inset-0">
        <div className="flex min-h-full items-start justify-center p-4 pt-[5%] text-center">
          <div
            className="search-modal__content w-full max-w-[600px] transform transition-all duration-300 data-closed:opacity-0 data-closed:scale-95 data-closed:translate-y-[-50px]"
            onTransitionEnd={() => {
              // 애니메이션 완료 후 입력 필드에 포커스
              if (isOpen && searchInputRef?.current) {
                requestAnimationFrame(() => {
                  searchInputRef.current?.focus();
                });
              }
            }}
          >
            {/* 검색 모달 헤더 */}
            <div className="search-modal__header">
              <h2 className="search-modal__title">통합 검색</h2>
              <button 
                className="search-modal__close" 
                onClick={handleCloseSearch} 
                aria-label="검색 모달 닫기"
              >
                <FaXmark />
              </button>
            </div>

            {/* 검색 입력 필드 */}
            <div className="search-modal__input">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="통합 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              {searchQuery && (
                <button
                  className="search-modal__input-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="검색어 지우기"
                  type="button"
                >
                  <FaXmark />
                </button>
              )}
            </div>

            {searchQuery && (
              /* 검색 탭 */
              <div className="search-modal__tabs">
                {[
                  { id: "movie", label: "영화", count: searchCounts.movie || 0, icon: FaFilm },
                  { id: "tv", label: "드라마", count: searchCounts.tv || 0, icon: FaTv },
                  { id: "user", label: "유저", count: searchCounts.user || 0, icon: FaUser },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`search-modal__tab ${activeTab === tab.id ? "search-modal__tab--active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className="search-modal__tab-icon" />
                      <span className="search-modal__tab-label">{tab.label}</span>
                      {tab.count > 0 && (
                        <span className="search-modal__tab-count">{tab.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!searchQuery && searchHistory && searchHistory.length > 0 && (
              /* 검색 히스토리 목록 */
              <div className="search-modal__results">
                <div className="search-modal__history-title">
                  <h4>최근 검색</h4>
                </div>
                {searchHistory.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="search-modal__history-item"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <FaClockRotateLeft />
                    <span>{item}</span>
                    <button
                      className="search-modal__history-remove"
                      onClick={(e) => handleHistoryRemove(e, item)}
                      aria-label="검색 기록 삭제"
                    >
                      <FaXmark />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && (
              <>
                {activeTab === "user" && (
                  /* 유저 검색 결과 */
                  (() => {
                    const users = userResults;
                    const isLoading = isUserSearchLoading;
                    
                    if (isLoading) {
                      return (
                        <div className="search-modal__results search-modal__results--user">
                          <div className="search-modal__loading">
                            <FaSpinner className="animate-spin" />
                            <span>검색 중...</span>
                          </div>
                        </div>
                      );
                    }
                    
                    if (users.length === 0) {
                      return (
                        <div className="search-modal__results search-modal__results--user">
                          <div className="search-modal__empty">
                            <FaMagnifyingGlass className="search-modal__empty-icon" />
                            <span>검색 결과가 없습니다.</span>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="search-modal__results search-modal__results--user">
                        {users.map((user, index) => {
                          const profileImageUrl = user.profileImage
                            ? getProfileImageUrl(user.profileImage)
                            : null;

                          return (
                            <Link
                              key={user.publicId}
                              to={`/user/${user.publicId}`}
                              className={`search-modal__user-item ${index === activeResultIndex ? "search-modal__result-item--active" : ""}`}
                              onClick={handleUserClick}
                            >
                              <div className="search-modal__user-content">
                                {profileImageUrl ? (
                                    <div className="search-modal__user-avatar">
                                    <img
                                      src={profileImageUrl}
                                      alt={user.nickname}
                                      onError={(e) => {
                                        const img = e.target;
                                        const placeholder = img.nextElementSibling;
                                        if (img && placeholder) {
                                          img.style.display = "none";
                                          placeholder.style.display = "flex";
                                        }
                                      }}
                                    />
                                    <div className="search-modal__user-avatar-placeholder" style={{ display: "none" }}>
                                      <FaUser />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="search-modal__user-avatar">
                                    <div className="search-modal__user-avatar-placeholder">
                                      {user.nickname ? (
                                        <span className="search-modal__user-initial">
                                          {user.nickname.charAt(0).toUpperCase()}
                                        </span>
                                      ) : (
                                        <FaUser />
                                      )}
                                    </div>
                                  </div>
                                )}
                                <div className="search-modal__user-info">
                                  <div className="search-modal__user-nickname">{user.nickname}</div>
                                  {user.activityScore !== undefined && (
                                    <div className="search-modal__user-meta">
                                      <span className="search-modal__user-score">
                                        활동 점수: {user.activityScore}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
                {activeTab === "movie" && (
                  /* 영화 검색 결과 */
                  (() => {
                    const results = movieResults;
                    const isLoading = isMovieSearchLoading;
                    
                    if (isLoading) {
                      return (
                        <div className="search-modal__results">
                          <div className="search-modal__loading">
                            <FaSpinner className="animate-spin" />
                            <span>검색 중...</span>
                          </div>
                        </div>
                      );
                    }
                    
                    if (results.length === 0) {
                      return (
                        <div className="search-modal__results">
                          <div className="search-modal__empty">
                            <FaMagnifyingGlass className="search-modal__empty-icon" />
                            <span>검색 결과가 없습니다.</span>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="search-modal__results">
                        {results.map((result, index) => (
                          <div
                            key={result.id || `result-${index}`}
                            className={`search-modal__result-item ${index === activeResultIndex ? "search-modal__result-item--active" : ""}`}
                            onClick={() => handleResultClick(result)}
                          >
                            <div className="search-modal__result-content">
                              {result.poster && (
                                <div className="search-modal__result-poster">
                                  <img src={result.poster} alt={result.title} />
                                </div>
                              )}
                              <div className="search-modal__result-info">
                                <div className="search-modal__result-title">{result.title}</div>
                                <div className="search-modal__result-meta">
                                  {result.rating && (
                                    <div className="search-modal__result-rating">
                                      <FaStar />
                                      <span>{result.rating}</span>
                                    </div>
                                  )}
                                  {result.year && <div className="search-modal__result-year">{result.year}</div>}
                                </div>
                                {result.overview && (
                                  <div className="search-modal__result-overview">{result.overview}</div>
                                )}
                                {result.genres && result.genres.length > 0 && (
                                  <div className="search-modal__result-genres">
                                    {result.genres.map((genre, idx) => (
                                      <span key={idx} className="search-modal__genre-tag">
                                        {genre}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
                {activeTab === "tv" && (
                  /* TV 검색 결과 */
                  (() => {
                    const results = tvResults;
                    const isLoading = isTvSearchLoading;
                    
                    if (isLoading) {
                      return (
                        <div className="search-modal__results">
                          <div className="search-modal__loading">
                            <FaSpinner className="animate-spin" />
                            <span>검색 중...</span>
                          </div>
                        </div>
                      );
                    }
                    
                    if (results.length === 0) {
                      return (
                        <div className="search-modal__results">
                          <div className="search-modal__empty">
                            <FaMagnifyingGlass className="search-modal__empty-icon" />
                            <span>검색 결과가 없습니다.</span>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="search-modal__results">
                        {results.map((result, index) => (
                          <div
                            key={result.id || `result-${index}`}
                            className={`search-modal__result-item ${index === activeResultIndex ? "search-modal__result-item--active" : ""}`}
                            onClick={() => handleResultClick(result)}
                          >
                            <div className="search-modal__result-content">
                              {result.poster && (
                                <div className="search-modal__result-poster">
                                  <img src={result.poster} alt={result.title} />
                                </div>
                              )}
                              <div className="search-modal__result-info">
                                <div className="search-modal__result-title">{result.title}</div>
                                <div className="search-modal__result-meta">
                                  {result.rating && (
                                    <div className="search-modal__result-rating">
                                      <FaStar />
                                      <span>{result.rating}</span>
                                    </div>
                                  )}
                                  {result.year && <div className="search-modal__result-year">{result.year}</div>}
                                </div>
                                {result.overview && (
                                  <div className="search-modal__result-overview">{result.overview}</div>
                                )}
                                {result.genres && result.genres.length > 0 && (
                                  <div className="search-modal__result-genres">
                                    {result.genres.map((genre, idx) => (
                                      <span key={idx} className="search-modal__genre-tag">
                                        {genre}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SearchModal;
