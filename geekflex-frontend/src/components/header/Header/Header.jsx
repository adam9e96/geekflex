import React from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFilm,
  FaTv,
  FaSearch,
  FaRandom,
  FaUserPlus,
  FaSignInAlt,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";
import { useAuthStore } from "@stores/authStore";
import { useProfileImage } from "@hooks/user/useProfileImage";
import { useLogout } from "@hooks/auth/useLogout";
import { useScroll } from "@hooks/useScroll";
import { MOVIE_DROPDOWN_ITEMS, TV_DROPDOWN_ITEMS, MAIN_NAV_ITEMS } from "@constants/navigation";
import { getRandomContent } from "@services/contentService";
import HeaderProfile from "../HeaderProfile/HeaderProfile";
import styles from "./Header.module.css";

/**
 * Header 컴포넌트
 * Props (AppLayout에서 전달받음):
 * - onNavClick: 네비게이션 메뉴 클릭 핸들러 (Layout의 handleNavClick)
 * - onSearchClick: 통합검색 버튼 클릭 핸들러 (Layout의 handleSearchClick)
 */
const Header = ({ onNavClick, onSearchClick }) => {
  const navigate = useNavigate();
  const [isRandomLoading, setIsRandomLoading] = React.useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userProfile = useAuthStore((state) => state.userProfile);

  const { handleLogout } = useLogout(); // OK
  const isScrolled = useScroll(); // OK
  const { profileImageUrl, hasProfileImage, setImageError } = useProfileImage(
    userProfile?.profileImage,
  ); // OK

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

  const handleRandomClick = async () => {
    if (isRandomLoading) return;

    setIsRandomLoading(true);
    try {
      const content = await getRandomContent();
      const tmdbId = content.tmdbId;
      const contentType = content.contentType?.toUpperCase();

      if (!tmdbId) {
        throw new Error("랜덤 작품에 TMDB ID가 없습니다.");
      }

      navigate(contentType === "TV" ? `/tv/${tmdbId}` : `/movie/${tmdbId}`);
    } catch (error) {
      console.error("랜덤 작품 이동 실패:", error);
      window.alert("랜덤 작품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsRandomLoading(false);
    }
  };

  const nickname = userProfile?.nickname;

  // 프로필 이미지 오류 시 콜백
  const handleProfileImageError = () => {
    setImageError(true);
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* 왼쪽: 로고 */}
        <div className={styles.leftSection}>
          <div className={styles.content}>
            <Link to={"/"} className={styles.logoLink}>
              <h1 className={styles.logoText}>GeekFlex</h1>
            </Link>
          </div>
        </div>

        {/* 중앙: 네비게이션 메뉴 */}
        <nav className={styles.nav} aria-label="메인 메뉴">
          <ul className={styles.list}>
            {/* 영화 드롭다운 메뉴 */}
            <li className={styles.dropdown}>
              <button className={styles.link} aria-haspopup="true" aria-expanded="false">
                <FaFilm />
                <span>영화</span>
              </button>
              <ul className={styles.menu}>
                {MOVIE_DROPDOWN_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.category}>
                      <Link
                        to={item.path}
                        className={styles.dropdownLink}
                        onClick={() => handleNavClick(item.category)}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            {/* 드라마 드롭다운 메뉴 */}
            <li className={styles.dropdown}>
              <button className={styles.link} aria-haspopup="true" aria-expanded="false">
                <FaTv />
                <span>드라마</span>
              </button>
              <ul className={styles.menu}>
                {TV_DROPDOWN_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.category}>
                      <Link
                        to={item.path}
                        className={styles.dropdownLink}
                        onClick={() => handleNavClick(item.category)}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            {/* 기타 메뉴 아이템 */}
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={styles.link}
                    onClick={() => handleNavClick(item.category)}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 오른쪽: 통합검색, 회원가입, 로그인 */}
        <div className={styles.rightSection}>
          {/* 통합검색 버튼 */}
          <button
            className={styles.searchBtn}
            title="통합검색 (Ctrl+K)"
            aria-label="통합검색"
            onClick={handleSearchClick}
          >
            <FaSearch />
            <span>통합검색</span>
          </button>

          <button
            className={styles.randomBtn}
            title="랜덤 작품"
            aria-label="랜덤 작품"
            onClick={handleRandomClick}
            disabled={isRandomLoading}
            type="button"
          >
            <FaRandom />
            <span>{isRandomLoading ? "선택 중" : "랜덤 작품"}</span>
          </button>

          {/* 로그인 상태에 따라 버튼 표시 */}
          {isAuthenticated ? (
            <>
              {/* 알림 버튼 */}
              <button className={styles.notificationBtn} aria-label="알림" type="button">
                <div className={styles.notificationContent}>
                  <FaBell />
                  {/* 알림 배지 */}
                  <span className={styles.notificationBadge}>3</span>
                </div>
              </button>

              {/* 프로필 영역 2026.02.03 검토완료 */}
              <HeaderProfile
                nickname={nickname}
                profileImageUrl={profileImageUrl}
                hasProfileImage={hasProfileImage}
                onImageError={handleProfileImageError}
              />

              {/* 로그아웃 버튼 2026.02.03 검토완료 */}
              <button onClick={handleLogout} className={styles.logoutBtn} type="button">
                <FaSignOutAlt />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <>
              {/* 회원가입 버튼 2026.02.03 검토완료 */}
              <Link to="/signup" className={styles.registerBtn}>
                <FaUserPlus />
                <span>회원가입</span>
              </Link>

              {/* 로그인 버튼 2026.02.03 검토완료 */}
              <Link to="/login" className={styles.loginBtn}>
                <FaSignInAlt />
                <span>로그인</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  onNavClick: PropTypes.func,
  onSearchClick: PropTypes.func,
};

export default Header;
