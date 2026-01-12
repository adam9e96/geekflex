import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaFilm, FaFire, FaCalendarAlt, FaBookmark, FaSearch, FaUserPlus, FaSignInAlt, FaSignOutAlt, FaStar, FaPlayCircle } from "react-icons/fa";
import { useAuthStore } from "@stores/authStore";
import { useProfileImage } from "@hooks/user/useProfileImage";
import HeaderProfile from "./components/HeaderProfile";
import "@styles/header/header.css";

/**
 * Header 컴포넌트
 * Props (Layout.jsx에서 전달받음):
 * - onNavClick: 네비게이션 메뉴 클릭 핸들러 (Layout의 handleNavClick)
 * - onSearchClick: 통합검색 버튼 클릭 핸들러 (Layout의 handleSearchClick)
 */
const Header = ({ onNavClick, onSearchClick }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userProfile = useAuthStore((state) => state.userProfile);
  const logout = useAuthStore((state) => state.logout);

  // 프로필 이미지 관련 로직 (커스텀 훅 사용)
  const { profileImageUrl, hasProfileImage, setImageError } = useProfileImage(
    userProfile?.profileImage
  );

  // 로그아웃 핸들러
  const handleLogout = (e) => {
    e.preventDefault();
    
    try {
      logout();
      navigate("/");
      // 페이지 새로고침하여 상태 완전히 초기화
      window.location.reload();
    } catch (error) {
      console.error("로그아웃 오류:", error);
      navigate("/");
    }
  };

  // 네비게이션 메뉴 클릭 핸들러 (추가 로직이 필요한 경우에만 사용)
  const handleNavClick = (category) => {
    if (onNavClick) {
      onNavClick(category);
    }
  };

  // 통합검색 버튼 클릭 핸들러
  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    }
  };


  const nickname = userProfile?.nickname;

  // 프로필 이미지 오류 시 콜백
  const handleProfileImageError = () => {
    setImageError(true);
  };

  return (
    <header className="flex justify-center geekflex-header">
      <div className="relative flex items-center justify-between gap-6 h-[70px] min-h-[70px] w-full max-w-[1400px] mx-auto lg:h-16 md:h-[60px] md:gap-4 sm:h-14 sm:gap-1 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px]">
        {/* 왼쪽: 로고 */}
        <div className="flex gap-6 items-center shrink-0">
          <div className="flex items-center">
            <Link to={"/"} className="flex gap-3 items-center no-underline">
              <h1 className="header-logo-text">GeekFlex</h1>
            </Link>
          </div>
        </div>

        {/* 중앙: 네비게이션 메뉴 - flex justify-center로 중앙 정렬 */}
        <nav
          className="flex flex-1 justify-center items-center"
          aria-label="메인 메뉴"
        >
          <ul className="flex items-center p-0 m-0 list-none">
            {/* 영화 드롭다운 메뉴 */}
            <li className="relative group header-dropdown">
              <button
                className="header-nav-link"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <FaFilm />
                <span>영화</span>
              </button>
              <ul className="header-dropdown-menu">
                <li>
                  <Link
                    to="/movies/popular"
                    className="header-dropdown-link"
                    onClick={() => handleNavClick("popular")}
                  >
                    <FaFire />
                    <span>인기있는 작품</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/movies/upcoming"
                    className="header-dropdown-link"
                    onClick={() => handleNavClick("upcoming")}
                  >
                    <FaCalendarAlt />
                    <span>개봉예정 작품</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/movies/top_rated"
                    className="header-dropdown-link"
                    onClick={() => handleNavClick("top_rated")}
                  >
                    <FaStar />
                    <span>최고평점</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/movies/now-playing"
                    className="header-dropdown-link"
                    onClick={() => handleNavClick("now-playing")}
                  >
                    <FaPlayCircle />
                    <span>현재 상영중인</span>
                  </Link>
                </li>
              </ul>
            </li>
            {/* 유저 컬렉션 */}
            <li className="relative">
              <Link
                to="/collection"
                className="header-nav-link"
                onClick={() => handleNavClick("collection")}
              >
                <FaBookmark />
                <span>유저 컬렉션</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* 오른쪽: 통합검색, 회원가입, 로그인 */}
        <div className="flex items-center shrink-0">
          {/* 통합검색 버튼 */}
          <button
            className="header-search-btn"
            title="통합검색 (Ctrl+K)"
            aria-label="통합검색"
            onClick={handleSearchClick}
          >
            <FaSearch />
            <span className="hidden lg:inline">통합검색</span>
          </button>

          {/* 로그인 상태에 따라 버튼 표시 */}
          {isAuthenticated ? (
            <>
              {/* 프로필 영역 */}
              <HeaderProfile
                nickname={nickname}
                profileImageUrl={profileImageUrl}
                hasProfileImage={hasProfileImage}
                onImageError={handleProfileImageError}
              />

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="header-logout-btn"
                type="button"
              >
                <FaSignOutAlt />
                <span className="hidden lg:inline">로그아웃</span>
              </button>
            </>
          ) : (
            <>
              {/* 회원가입 버튼 */}
              <Link to="/signup" className="header-register-btn">
                <FaUserPlus />
                <span className="hidden lg:inline">회원가입</span>
              </Link>

              {/* 로그인 버튼 */}
              <Link to="/login" className="header-login-btn">
                <FaSignInAlt />
                <span className="hidden lg:inline">로그인</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
