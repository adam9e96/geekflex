# GeekFlex Frontend

## 1. 개요
- 프로젝트: `GeekFlex` React + Vite 프론트엔드
- 기본 개발 주소: `http://localhost:5037`
- 백엔드 기본 주소: `http://localhost:8080`
- 주요 기술:
  - React 19
  - Vite 7
  - React Router DOM 7
  - Zustand 5
  - Axios
  - CSS Modules

## 2. 실행 전 환경
필수 선행 조건:
- Node.js / npm
- 백엔드 서버 실행 (`http://localhost:8080`)

로컬 실행:
```bash
npm install
npm run dev
```

주요 스크립트:
- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run lint`: ESLint 검사
- `npm run lint:styles`: Stylelint 검사
- `npm run format`: Prettier 포맷 적용
- `npm run lint:all`: 코드/스타일/포맷 전체 검사

환경 변수:
- `VITE_API_URL`: 프록시 대상 백엔드 주소

## 3. 앱 구조
엔트리 및 공통 구성:
- 엔트리: `src/main.jsx`
- 공통 레이아웃: `src/layouts/AppLayout/AppLayout.jsx`
- 전역 인증 초기화: `src/components/auth/AuthInitializer`
- 전역 예외 처리: `src/components/ui/ErrorBoundary`
- 전역 스타일: `src/styles/global/theme.css`, `src/styles/global/global.css`

주요 디렉터리:
- `src/pages`: 라우트 단위 페이지
- `src/components`: 재사용 UI 및 도메인 컴포넌트
- `src/hooks`: 페이지/도메인 로직 훅
- `src/stores`: Zustand 전역 상태
- `src/services`: API 호출 계층
- `src/utils`: 인증, 검증, 포맷 유틸
- `src/constants`: 네비게이션, 상수

## 4. 라우트 명세

### 4.1 공개 페이지
- `/`
  - 홈 페이지
  - 최고 평점 영화, 개봉예정 영화 섹션 제공
- `/login`
  - 로그인 페이지
- `/signup`
  - 회원가입 페이지
  - 이메일 인증, 비밀번호 검증, 프로필 이미지 업로드 지원
- `/forgot-password`
  - 비밀번호 재설정 링크 요청 페이지

### 4.2 사용자 페이지
- `/mypage`
  - 내 프로필/계정 정보 관리
  - 프로필 수정, 비밀번호 확인, 내 리뷰 요약 제공
- `/mypage/reviews`
  - 내가 작성한 리뷰 목록
- `/user/:publicId`
  - 공개 사용자 상세 페이지
  - 프로필, 리뷰, 컬렉션 목록 제공

### 4.3 콘텐츠 페이지
- `/movies/:category`
  - 영화 카테고리 목록
  - `popular`, `upcoming`, `top_rated`, `now-playing` 지원
- `/movie/:id`
  - 영화 상세 페이지
  - 상세 정보, 좋아요 수, 리뷰 목록/작성 기능
- `/tv/:id`
  - 드라마 상세 페이지
  - 상세 정보, 좋아요 수, 리뷰 목록/작성 기능
- `/movie/:id/review`
- `/tv/:id/review`
  - 리뷰 작성 페이지
- `/movie/:id/review/:reviewId/edit`
- `/tv/:id/review/:reviewId/edit`
  - 리뷰 수정 페이지
- `/collection`
- `/collections`
  - 컬렉션 목록 페이지
  - 내 컬렉션/공개 컬렉션 구분 표시
- `/collection/:id`
- `/collections/:id`
  - 컬렉션 상세 페이지
  - 컬렉션 헤더, 작품 목록, 수정/삭제/작품 추가 기능

### 4.4 관리자/정적 페이지
- `/admin`
  - 관리자 페이지
  - 사용자 관리, 스케줄러 관리 섹션
- `/privacy`
  - 개인정보 처리방침
- `/terms`
  - 이용약관
- `/about`
  - 서비스 소개

## 5. 기능 명세

### 5.1 인증
주요 파일:
- `src/hooks/auth/useLogin.js`
- `src/hooks/auth/useSignup.js`
- `src/hooks/auth/useForgotPassword.js`
- `src/hooks/auth/useLogout.js`
- `src/stores/authStore.js`
- `src/utils/auth.js`

기능:
- 아이디/비밀번호 로그인
- JWT Access Token 저장/갱신 처리
- 로그아웃
- 회원가입
- 이메일 인증코드 발송/검증
- 프로필 이미지 포함 회원가입
- 비밀번호 재설정 링크 요청
- 앱 시작 시 인증 상태 복구

제약/현황:
- Google/Kakao 로그인 버튼은 UI는 있으나 실제 동작은 준비 중

### 5.2 검색
주요 파일:
- `src/components/search/*`
- `src/hooks/useSearchCoordinator.js`
- `src/hooks/useSearchModal.js`
- `src/stores/searchStore.js`

기능:
- 전역 검색 모달 오픈/닫기
- 영화/드라마/유저 통합 검색
- 검색 탭 전환
- 최근 검색어 저장/삭제
- 키보드 기반 검색 UX 지원

상태 관리:
- 검색어, 탭, 결과, 히스토리, 선택 인덱스는 Zustand 사용

### 5.3 홈
주요 파일:
- `src/pages/home/Home.jsx`
- `src/components/home/TopRatedMovies/TopRatedMovies.jsx`
- `src/components/home/NowPlayingMovies/NowPlayingMovies.jsx`
- `src/components/home/ContentCard.jsx`

기능:
- 메인 배너 노출
- 최고 평점 영화 목록 조회
- 개봉예정 영화 목록 조회
- 카드 클릭 시 상세 페이지 이동

### 5.4 콘텐츠 상세
주요 파일:
- `src/pages/content/ContentDetail/ContentDetail.jsx`
- `src/pages/content/TvDetail/TvDetail.jsx`
- `src/components/content/detail/*`
- `src/stores/contentDetailStore.js`
- `src/services/contentService.js`

기능:
- 영화/드라마 상세 정보 조회
- 포스터/배경 이미지 렌더링
- 줄거리, 장르, 메타 정보 표시
- 좋아요 개수 표시
- 공유 버튼 UI
- 컬렉션 추가 모달
- 리뷰 섹션 연결

### 5.5 리뷰
주요 파일:
- `src/pages/content/WriteReview/WriteReview.jsx`
- `src/pages/content/EditReview/EditReview.jsx`
- `src/components/review/*`
- `src/stores/reviewStore.js`
- `src/hooks/review/useLike.js`
- `src/services/reviewService.js`
- `src/services/likeService.js`

기능:
- 리뷰 작성
- 리뷰 수정
- 리뷰 삭제
- 리뷰 목록 조회
- 리뷰 좋아요 토글/상태 조회
- 별점 입력
- 상세 리뷰와 인라인 리뷰 수정 분기 처리

### 5.6 컬렉션
주요 파일:
- `src/pages/content/CollectionPage/CollectionPage.jsx`
- `src/pages/content/CollectionDetailPage/CollectionDetailPage.jsx`
- `src/components/content/collections/*`
- `src/stores/collectionStore.js`
- `src/services/collectionService.js`

기능:
- 컬렉션 생성
- 컬렉션 수정
- 컬렉션 삭제
- 내 컬렉션 조회
- 공개 컬렉션 조회
- 정렬 기준 전환 (`latest`, `views`)
- 컬렉션 상세 조회
- 컬렉션에 작품 추가/제거

### 5.7 마이페이지/프로필
주요 파일:
- `src/pages/user/MyPage/MyPage.jsx`
- `src/pages/user/MyReviewsPage/MyReviewsPage.jsx`
- `src/components/mypage/*`
- `src/hooks/useMyPage.js`
- `src/hooks/useEditProfile.js`
- `src/services/userService.js`
- `src/stores/userStore.js`
- `src/stores/profileStore.js`

기능:
- 내 프로필 조회
- 프로필 수정
- 비밀번호 확인 후 민감 작업 수행
- 프로필 이미지 변경/삭제
- 내 리뷰 목록 조회
- 활동 정보 요약 표시

### 5.8 사용자 공개 프로필
주요 파일:
- `src/pages/user/UserDetailPage/UserDetailPage.jsx`
- `src/hooks/user/useUserDetail.js`

기능:
- 공개 프로필 정보 조회
- 유저의 리뷰 목록 표시
- 유저의 컬렉션 목록 표시
- 리뷰/컬렉션 클릭 시 상세 페이지 이동

### 5.9 관리자
주요 파일:
- `src/pages/admin/AdminPage/AdminPage.jsx`
- `src/components/admin/ApiSchedulerSection/*`
- `src/components/admin/UserManagementSection/*`

기능:
- 사용자 관리 섹션 UI
- API 스케줄러 관리 섹션 UI

제약/현황:
- 백엔드 연동 범위와 실제 권한 정책은 별도 확인 필요

## 6. 전역 상태 명세

### `authStore`
- 인증 여부
- 사용자 프로필 요약
- 토큰/로그인 상태 갱신

### `searchStore`
- 검색 모달 열림 상태
- 검색어
- 탭별 결과
- 검색 히스토리
- 활성 결과 인덱스

### `collectionStore`
- 컬렉션 목록
- 공개/내 컬렉션 로딩 상태
- 컬렉션 생성/수정 모달 상태
- 현재 편집 중 컬렉션

### `reviewStore`
- 리뷰 목록
- 로딩/에러 상태
- 현재 수정 중 리뷰 상태

### `contentDetailStore`
- 콘텐츠 상세 데이터
- 로딩/에러 상태
- 좋아요 수 등 상세 화면 부가 데이터

### 기타 Store
- `userStore`
- `profileStore`

## 7. 서비스/API 연동 명세
주요 서비스 파일:
- `src/services/apiClient.js`
- `src/services/contentService.js`
- `src/services/reviewService.js`
- `src/services/likeService.js`
- `src/services/collectionService.js`
- `src/services/userService.js`

역할:
- Axios 인스턴스 공통화
- Access Token 주입
- 인증 만료 시 재발급 처리
- 공통 응답 데이터 추출
- 도메인별 API 호출 함수 제공

백엔드 의존 API 범주:
- Auth
- User
- Movies
- TV
- Reviews
- Likes
- Collections

## 8. UI/공용 컴포넌트 명세
주요 공용 컴포넌트:
- `src/components/ui/BackButton`
- `src/components/ui/LoadingSpinner`
- `src/components/ui/ErrorMessage`
- `src/components/ui/ErrorBoundary`
- `src/components/ui/SectionHeader`
- `src/components/ui/EmptyState`

공통 목적:
- 로딩/에러/빈 상태 일관화
- 섹션 헤더 표현 통일
- 공통 뒤로가기 UX 제공

## 9. 외부 라이브러리 사용 목적
- `react-router-dom`: 라우팅
- `zustand`: 전역 상태 관리
- `axios`: HTTP 클라이언트
- `react-toastify`: 토스트 알림
- `react-icons`: 아이콘 표시
- `@headlessui/react`: 접근성 있는 모달(Dialog)
- `react-datepicker`: 생년월일 선택 입력
- `date-fns`: 날짜 로케일 처리
- `sweetalert2`: 리뷰 삭제 확인 다이얼로그

## 10. 현재 확인된 미완성/주의 사항
- 소셜 로그인 버튼은 실제 인증 연동 전 상태
- 관리자 기능은 UI 중심이며 운영 정책 확인 필요
- 일부 상세 페이지의 공유 기능은 브라우저 API 의존
- 백엔드 응답 래퍼/직접 DTO 반환이 혼재되어 있어 서비스 계층에서 일관 처리 필요
- 프론트 구조 개편 이후 import 경로/alias 변경 시 Vite alias와 `jsconfig.json`을 함께 유지해야 함

## 11. 참고
- 본 문서는 현재 `src` 구조와 라우트/스토어/서비스 기준으로 작성한 프론트엔드 기능 개요 문서입니다.
- 세부 요청/응답 스키마는 백엔드 문서 `GeekFlex/README.md` 및 각 서비스/DTO 구현 기준으로 확인합니다.
