import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Font Awesome
import "@fortawesome/fontawesome-free/css/all.css";
// Pretendard 폰트
import "pretendard/dist/web/static/pretendard.css";
// 전역 스타일 (Tailwind CSS 포함)
import "@styles/global/theme.css";
import "@styles/global/global.css";
// 전역 상태 관리 (Zustand)
import AuthInitializer from "@components/auth/AuthInitializer.jsx";
// 에러 바운더리
import ErrorBoundary from "@components/ui/ErrorBoundary/ErrorBoundary.jsx";
// 레이아웃 컴포넌트
import AppLayout from "@layouts/AppLayout/AppLayout";
// Pages
import Home from "@pages/home/Home.jsx";
import Login from "@pages/auth/Login/Login.jsx";
import Signup from "@pages/auth/Signup/Signup.jsx";
import ForgotPassword from "@pages/auth/ForgotPassword/ForgotPassword.jsx";
import MyPage from "@pages/user/MyPage/MyPage.jsx";
import MyReviewsPage from "@pages/user/MyReviewsPage/MyReviewsPage.jsx";
import ContentDetail from "@pages/content/ContentDetail/ContentDetail.jsx";
import TvDetail from "@pages/content/TvDetail/TvDetail.jsx";
import WriteReview from "@pages/content/WriteReview/WriteReview.jsx";
import EditReview from "@pages/content/EditReview/EditReview.jsx";
import AdminPage from "@pages/admin/AdminPage/AdminPage.jsx";
import Privacy from "@pages/legal/Privacy/Privacy.jsx";
import Terms from "@pages/legal/Terms/Terms.jsx";
import About from "@pages/legal/About/About.jsx";
import MoviesCategoryPage from "@pages/content/MoviesCategoryPage/MoviesCategoryPage.jsx";
import CollectionPage from "@pages/content/CollectionPage/CollectionPage.jsx";
import CollectionDetailPage from "@pages/content/CollectionDetailPage/CollectionDetailPage.jsx";
import UserDetailPage from "@pages/user/UserDetailPage/UserDetailPage.jsx";

/**
 *
 * 라우팅 구조:
 * - BrowserRouter: 브라우저 URL과 동기화 (필수)
 * - AuthInitializer: 전역 인증 상태 초기화 (Zustand)
 * - AppLayout: 공통 레이아웃 (Header, Footer)
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
        <AppLayout>
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
        </AppLayout>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
