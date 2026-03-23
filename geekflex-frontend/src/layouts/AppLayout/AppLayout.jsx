import React from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@components/header/Header/Header";
import Footer from "@components/footer/Footer/Footer";
import SearchModal from "@components/search/SearchModal.jsx";
import { useSearchCoordinator } from "@hooks/useSearchCoordinator";
import { useScrollLock } from "@hooks/ui/useScrollLock";
import styles from "./AppLayout.module.css";

/**
 * GeekFlex 앱 레이아웃 컴포넌트
 * 헤더, 푸터를 포함한 전체 레이아웃 관리
 *
 * Props:
 * - children: 컴포넌트 태그 사이에 들어가는 내용
 */
const AppLayout = ({ children }) => {
  const location = useLocation();

  const isFullWidth =
    location.pathname === "/" ||
    location.pathname.startsWith("/movie/") ||
    location.pathname.startsWith("/tv/");

  // mainClasses construction using refactored class names
  const mainClasses = `${styles.main} ${!isFullWidth ? styles.constrained : ""}`;

  // 검색 로직 조율자 (데이터 동기화, 디바운스, 단축키 처리 등)
  const { isSearchOpen, handleSearchClick } = useSearchCoordinator();

  // 검색 모달 열림 시 스크롤 잠금
  useScrollLock(isSearchOpen);

  return (
    <>
      <Header onSearchClick={handleSearchClick} />

      <main className={mainClasses}>{children}</main>

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

      <SearchModal />
    </>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppLayout;
