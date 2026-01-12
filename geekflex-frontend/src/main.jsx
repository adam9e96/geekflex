import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Font Awesome
import "@fortawesome/fontawesome-free/css/all.css";
// Pretendard 폰트
import "pretendard/dist/web/static/pretendard.css";
// 전역 스타일 (Tailwind CSS 포함)
import "@styles/global/main.css";
// 전역 상태 관리 (Zustand)
import AuthInitializer from "@components/auth/AuthInitializer";
// 에러 바운더리
import ErrorBoundary from "@components/ui/ErrorBoundary";
// 레이아웃 컴포넌트
import Layout from "@components/layout/Layout";
// Pages
import Home from "@pages/Home.jsx";
import Login from "@pages/Login.jsx";
import Signup from "@pages/Signup.jsx";
import ForgotPassword from "@pages/ForgotPassword.jsx";
import MyPage from "@pages/MyPage.jsx";
import MyReviewsPage from "@pages/MyReviewsPage.jsx";
import ContentDetail from "@pages/ContentDetail.jsx";
import TvDetail from "@pages/TvDetail.jsx";
import WriteReview from "@pages/WriteReview.jsx";
import EditReview from "@pages/EditReview.jsx";
import AdminPage from "@pages/AdminPage.jsx";
import Privacy from "@pages/footer/Privacy.jsx";
import Terms from "@pages/footer/Terms.jsx";
import About from "@pages/footer/About.jsx";
import MoviesCategoryPage from "@pages/MoviesCategoryPage.jsx";
import CollectionPage from "@pages/CollectionPage.jsx";
import CollectionDetailPage from "@pages/CollectionDetailPage.jsx";
import UserDetailPage from "@pages/UserDetailPage.jsx";

/**
 *
 * 라우팅 구조:
 * - BrowserRouter: 브라우저 URL과 동기화 (필수)
 * - AuthInitializer: 전역 인증 상태 초기화 (Zustand)
 * - Layout: 공통 레이아웃 (Header, Footer)
 * - Routes: 라우트 컨테이너
 *
 * 페이지 구조:
 * 1. 공개 페이지: 홈, 로그인, 회원가입
 * 2. 사용자 페이지: 마이페이지
 * 3. 콘텐츠 페이지: 영화 상세
 * 4. 법적 문서: 개인정보 처리방침, 이용약관
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthInitializer />
        <Layout>
          <Routes>
            {/* ============================================
                1. 공개 페이지
                ============================================ */}

            {/* 홈 페이지 */}
            <Route path="/" element={<Home />} />

            {/* 인증 페이지 */}
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />

            {/* ============================================
                2. 사용자 페이지
                ============================================ */}

            {/* 마이페이지 */}
            <Route path="mypage" element={<MyPage />} />
            <Route path="mypage/reviews" element={<MyReviewsPage />} />

            {/* 관리자 페이지 */}
            <Route path="admin" element={<AdminPage />} />

            {/* ============================================
                3. 콘텐츠 페이지
                ============================================ */}

            {/* 영화 카테고리 페이지 */}
            <Route path="movies/:category" element={<MoviesCategoryPage />} />

            {/* 영화 상세 페이지 */}
            <Route path="movie/:id" element={<ContentDetail />} />

            {/* 드라마(TV) 상세 페이지 - TV 전용 페이지 */}
            <Route path="tv/:id" element={<TvDetail />} />

            {/* 리뷰 작성 페이지 */}
            <Route path="movie/:id/review" element={<WriteReview />} />
            <Route path="tv/:id/review" element={<WriteReview />} />

            {/* 리뷰 수정 페이지 */}
            <Route path="movie/:id/review/:reviewId/edit" element={<EditReview />} />
            <Route path="tv/:id/review/:reviewId/edit" element={<EditReview />} />

            {/* 컬렉션 페이지 */}
            <Route path="collection" element={<CollectionPage />} />
            <Route path="collections" element={<CollectionPage />} />
            <Route path="collection/:id" element={<CollectionDetailPage />} />
            <Route path="collections/:id" element={<CollectionDetailPage />} />

            {/* 유저 상세 페이지 */}
            <Route path="user/:publicId" element={<UserDetailPage />} />

            {/* ============================================
                4. 법적 문서 페이지
                ============================================ */}

            {/* 개인정보 처리방침 */}
            <Route path="privacy" element={<Privacy />} />

            {/* 이용약관 */}
            <Route path="terms" element={<Terms />} />

            {/* 사용정보 */}
            <Route path="about" element={<About />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
