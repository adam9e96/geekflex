# GeekFlex

**TMDB 기반 영화·드라마 리뷰 및 컬렉션 플랫폼**

## 📖 프로젝트 소개

**GeekFlex**는 TMDB API를 기반으로 영화와 드라마 콘텐츠를 탐색하고, 리뷰와 컬렉션을 통해 개인 취향을 기록할 수 있는 **미디어 커뮤니티 플랫폼**입니다.

사용자는 영화·드라마 상세 정보를 확인하고, 별점과 리뷰를 남기며, 원하는 작품을 주제별 컬렉션으로 큐레이션할 수 있습니다. 좋아요, 댓글, 사용자 검색, 마이페이지 기능을 통해 단순 콘텐츠 조회를 넘어 사용자 간 상호작용까지 경험할 수 있도록 구성했습니다.

백엔드는 Spring Boot BFF 서버로 TMDB API 호출을 중계하여 API Key 노출을 줄이고, 영화/TV 데이터를 공통 `Content` 모델로 관리합니다. 또한 인증, 이메일 인증, 캐시, 스케줄러, Docker Compose 기반 배포까지 1인 풀스택으로 구현했습니다.

### 🎯 기획 의도

OTT와 콘텐츠 플랫폼을 사용하면서 흩어지는 감상 기록과 추천 목록을 직접 관리할 수 있는 서비스를 만들고자 했습니다. 외부 콘텐츠 API를 단순히 화면에 표시하는 수준을 넘어, **API 응답 가공, 인증 안정성, 캐싱, 스케줄러, 배포 비용**까지 실제 운영 관점의 문제를 함께 해결하는 것을 목표로 했습니다.

---

## 프로젝트 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | GeekFlex |
| 개발 기간 | 2025.10.28 ~ 2025.11.30 |
| 팀 구성 | 개인 프로젝트 |
| 담당 역할 | 서비스 기획, 프론트엔드, 백엔드, DB 설계, 배포 |
| 배포 주소 | [https://geekflex.adam9e96.dev/](https://geekflex.adam9e96.dev/) |
| GitHub | [https://github.com/adam9e96/geekflex](https://github.com/adam9e96/geekflex) |
| 배포 문서 | [doc/geekflex_doc/DEPLOYMENT.md](doc/geekflex_doc/DEPLOYMENT.md) |
| 포트폴리오 문서 | [doc/geekflex_doc/PORTFOLIO_NOTION.md](doc/geekflex_doc/PORTFOLIO_NOTION.md) |

### 검증 가능한 구현 수치

실제 측정하지 않은 사용자 수나 전환율 대신, 리포지토리에서 재확인 가능한 구현 수치만 사용했습니다.

| 항목 | 수치 |
| --- | ---: |
| 백엔드 API 핸들러 | 67개 |
| JPA 엔티티 | 12개 |
| 백엔드 테스트 | 35개 |
| Spring Scheduler | 9개 |
| TMDB 자동 갱신 카테고리 | 8개 |
| Caffeine 상세 캐시 | 최대 10,000건 |
| Docker Compose 운영 컨테이너 | 4개 |

---

## 주요 기능

### 1. 콘텐츠 탐색

- **TMDB API 기반 콘텐츠 조회**: 영화/TV 메타데이터와 상세 정보를 제공합니다.
- **영화·드라마 통합 모델**: 영화와 TV 데이터를 공통 `Content` 엔티티로 관리합니다.
- **동적 검색 로직**: 검색 결과를 정확도 중심으로 정렬합니다.
- **상세 데이터 캐싱**: TMDB 상세 응답을 Caffeine 캐시로 재사용합니다.

### 2. 리뷰와 반응

- **리뷰 작성/수정/삭제**: 콘텐츠별 별점과 리뷰를 남길 수 있습니다.
- **좋아요 토글**: 콘텐츠와 컬렉션에 대한 반응을 기록합니다.
- **사용자별 리뷰 조회**: 사용자 프로필에서 리뷰 이력을 확인할 수 있습니다.

### 3. 컬렉션 큐레이션

- **테마형 컬렉션 생성**: 원하는 작품을 주제별로 묶어 관리할 수 있습니다.
- **공개/비공개 설정**: 본인과 타인의 접근 범위를 서버에서 검증합니다.
- **커버 이미지 관리**: 직접 업로드 이미지, 선택 콘텐츠 포스터, 최신 콘텐츠 포스터 순서로 표지를 구성합니다.
- **댓글 상호작용**: 컬렉션 상세 페이지에서 댓글 기반 커뮤니케이션을 지원합니다.

### 4. 사용자 및 인증

- **회원가입/로그인/로그아웃**: JWT 기반 인증 흐름을 제공합니다.
- **Refresh Token 쿠키 분리**: RefreshToken은 `HttpOnly`, `Secure`, `SameSite=Strict` 쿠키로 전달합니다.
- **이메일 인증**: Resend API와 Redis TTL로 인증코드를 관리합니다.
- **마이페이지/사용자 검색**: 사용자 정보와 활동 기록을 조회할 수 있습니다.

### 5. 운영 기능

- **관리자 페이지**: 캐시와 스케줄러 관련 운영 기능을 제공합니다.
- **주기적 콘텐츠 갱신**: 영화 4개, TV 4개 TMDB 카테고리를 자동 갱신합니다.
- **헬스체크**: `/api/health` 엔드포인트로 운영 상태를 확인합니다.

---

## 기술 스택 (Tech Stack)

### Frontend

| Category | Technology | Description |
| --- | --- | --- |
| **Core** | ![React](https://img.shields.io/badge/React_19.2.3-61DAFB?style=flat-square&logo=react&logoColor=black) | 컴포넌트 기반 UI 개발 |
| **Build** | ![Vite](https://img.shields.io/badge/Vite_7.3.0-646CFF?style=flat-square&logo=vite&logoColor=white) | 빠른 개발 서버와 빌드 환경 |
| **Routing** | ![React Router](https://img.shields.io/badge/React_Router_7.11.0-CA4245?style=flat-square&logo=react-router&logoColor=white) | SPA 라우팅 처리 |
| **State** | ![Zustand](https://img.shields.io/badge/Zustand_5.0.9-orange?style=flat-square) | 경량 전역 상태 관리 |
| **HTTP** | ![Axios](https://img.shields.io/badge/Axios_1.13.5-5A29E4?style=flat-square&logo=axios&logoColor=white) | API 요청, 인증 토큰 갱신 인터셉터 |
| **Style** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4.1.18-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | 반응형 UI 스타일링 |

### Backend

| Category | Technology | Description |
| --- | --- | --- |
| **Language** | ![Java](https://img.shields.io/badge/Java_21-007396?style=flat-square&logo=openjdk&logoColor=white) | 백엔드 애플리케이션 구현 |
| **Framework** | ![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.5.9-6DB33F?style=flat-square&logo=springboot&logoColor=white) | REST API 서버 구축 |
| **Security** | ![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white) | JWT 기반 인증/인가 |
| **Data** | ![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=flat-square&logo=spring&logoColor=white) | ORM 기반 데이터 처리 |
| **Query** | ![QueryDSL](https://img.shields.io/badge/QueryDSL_5.1.0-007396?style=flat-square) | 동적 검색 조건과 정렬 처리 |
| **HTTP Client** | ![WebClient](https://img.shields.io/badge/WebClient-6DB33F?style=flat-square&logo=spring&logoColor=white) | TMDB API, Resend API 연동 |
| **Token** | ![JJWT](https://img.shields.io/badge/JJWT_0.13.0-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) | JWT 발급과 검증 |

### Infrastructure & Database

| Category | Technology | Description |
| --- | --- | --- |
| **Database** | ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=flat-square&logo=mariadb&logoColor=white) | 콘텐츠, 리뷰, 컬렉션 데이터 저장 |
| **Cache** | ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white) | 이메일 인증코드, 임시 데이터 저장 |
| **Local Cache** | ![Caffeine](https://img.shields.io/badge/Caffeine-6DB33F?style=flat-square) | TMDB 상세 응답 인메모리 캐시 |
| **Runtime** | ![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white) | Nginx, Backend, MariaDB, Redis 통합 실행 |
| **Proxy** | ![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white) | 정적 파일 서빙, API 프록시, 업로드 파일 서빙 |
| **Tunnel** | ![Cloudflare Tunnel](https://img.shields.io/badge/Cloudflare_Tunnel-F38020?style=flat-square&logo=cloudflare&logoColor=white) | 홈서버 origin 노출 최소화 |

---

## 주요 개발 이슈

### 1. TMDB API 노출 최소화와 공통 콘텐츠 모델 설계

프론트에서 TMDB API를 직접 호출하지 않고 Spring Boot 서버가 외부 API 호출과 DTO 변환을 담당하도록 했습니다. 영화와 TV는 `tmdb_id + content_type` 조합으로 유니크하게 관리하고, 공통 필드는 하나의 `Content` 엔티티로 통합했습니다.

### 2. 인기/상영/평점 콘텐츠 캐싱과 스케줄러 충돌 완화

TMDB 인기 영화, 현재 상영작, 평점 높은 영화, 인기 TV 목록에는 같은 작품이 반복 등장할 수 있습니다. 카테고리 태그는 `ContentListTag`로 분리하고, 콘텐츠 저장은 별도 트랜잭션과 최대 3회 재시도로 보완해 중복 저장과 잠금 충돌 가능성을 줄였습니다.

### 3. 캐시 비용과 외부 API 호출 부담 최적화

DB에 영구 저장하지 않아도 되는 TMDB 상세 응답은 Redis가 아니라 Caffeine 인메모리 캐시로 분리했습니다. 영화 상세 5,000건, TV 상세 5,000건까지 캐시하고, 24시간 재동기화 기준으로 외부 API 재호출 부담을 낮췄습니다.

### 4. 인증과 이메일 발송 구조 개선

AccessToken은 응답 본문으로 전달하고 RefreshToken은 `HttpOnly`, `Secure`, `SameSite=Strict` 쿠키로 분리했습니다. 이메일 인증은 Resend API와 Redis TTL을 사용해 인증코드 만료와 운영 부담을 단순화했습니다.

### 5. 배포 비용 문제와 셀프 호스팅 전환

Vercel/Railway 중심의 초기 배포는 빠르게 시작하기 좋지만, Java 서버·DB·Redis가 상시 메모리를 점유하는 구조에서는 개인 프로젝트 기준 비용 부담이 있었습니다. Ubuntu VM, Docker Compose, Nginx, Cloudflare Tunnel 기반 셀프 호스팅으로 전환해 비용과 공개 포트 노출 리스크를 줄였습니다.

---

## 🚀 시작하기

### 사전 요구사항 (Prerequisites)

- **Java 21** 이상
- **Node.js 최신 LTS** 또는 최신 Docker Node 이미지
- **Docker / Docker Compose**
- 로컬 백엔드 실행 시 **MariaDB**, **Redis**
- TMDB API Key / Access Token
- Resend API Key

### 환경변수 설정

루트 디렉터리에서 `.env.example`을 참고해 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

주요 환경변수:

```text
GEEKFLEX_DB_ROOT_PASSWORD
GEEKFLEX_DB_NAME
GEEKFLEX_DB_USER
GEEKFLEX_DB_PASSWORD
GEEKFLEX_REDIS_PASSWORD
GEEKFLEX_BACKEND_PORT
GeekFlex_RESEND_API_KEY
GeekFlex_TMDB_API_KEY
GeekFlex_TMDB_ACCESS_TOKEN
GeekFlex_JWT_SECRET_KEY
GeekFlex_FILE_UPLOAD_DIR
```

파일 업로드 경로는 기본적으로 `/app/uploads/users` 기준으로 동작합니다.

### 로컬 개발 실행

1. **Backend**

   ```bash
   cd geekflex-backend
   ./gradlew bootRun
   ```

   기본 설정 기준:

   - Backend Port: `8080`
   - MariaDB: `localhost:3306`
   - Redis: `localhost:6379`

2. **Frontend**

   ```bash
   cd geekflex-frontend
   npm install
   npm run dev
   ```

   기본 개발 서버 포트:

   - Frontend Port: `5037`

### Docker Compose 실행

1. **프론트 빌드**

   ```bash
   cd geekflex-frontend
   npm install
   npm run build
   cd ..
   ```

2. **전체 서비스 실행**

   ```bash
   docker compose up -d --build
   ```

실행 구성:

- `geekflex-nginx`
- `geekflex-db`
- `geekflex-redis`
- `geekflex-backend`

참고 사항:

- Nginx는 `geekflex-frontend/dist`를 정적 파일로 서빙합니다.
- 로컬/VM 테스트 진입점은 `http://localhost:18080`입니다.
- MariaDB 초기 스키마는 `geekflex-backend/db-init/schema.sql`에서 로드됩니다.
- Backend는 `prod` 프로필로 실행됩니다.

---

## 운영 배포

### 배포 환경

- Domain: `https://geekflex.adam9e96.dev`
- Server: Ubuntu VM
- Public access: Cloudflare Tunnel
- Reverse proxy: Nginx
- App runtime: Docker Compose
- Detail guide: [doc/geekflex_doc/DEPLOYMENT.md](doc/geekflex_doc/DEPLOYMENT.md)

### 운영 구조

```text
Cloudflare Tunnel
  geekflex.adam9e96.dev
    -> localhost:18080
      -> geekflex-nginx
        -> React static files
        -> geekflex-backend
        -> uploads volume
```

![GeekFlex deployment architecture](<doc/geekflex_doc/GeekFlex_인프라_포트폴리오(배포및CI_CD중점).png>)

운영 서버에서는 Docker Compose로 Nginx, Spring Boot Backend, MariaDB, Redis를 함께 실행합니다. Nginx는 React 정적 파일을 서빙하고, `/api/` 요청을 백엔드로 프록시하며, `/uploads/` 경로로 업로드 파일을 제공합니다.

```bash
docker compose up -d --build
```

### 운영 포인트

- Cloudflare Tunnel: `geekflex.adam9e96.dev -> http://localhost:18080`
- Health Check: `GET /api/health`
- 업로드 경로: `/uploads/users/**`, `/uploads/collections/**`
- 업로드 정적 파일: 7일 `Cache-Control`
- 운영 프로필: `application-prod.yml`
- 배포 프로필에서는 Swagger UI와 API Docs 비활성화

---

## 품질 확인

### Frontend

```bash
cd geekflex-frontend
npm run lint
npm run lint:styles
npm run format:check
```

### Backend

```bash
cd geekflex-backend
./gradlew test
```

### 수치 검증

문서에 사용한 구현 수치는 아래 명령으로 재확인할 수 있습니다.

```powershell
(rg -n "@(Get|Post|Put|Delete|Patch)Mapping" geekflex-backend\src\main\java | Measure-Object).Count
(rg -n "@Entity" geekflex-backend\src\main\java | Measure-Object).Count
(rg -n "@Scheduled" geekflex-backend\src\main\java | Measure-Object).Count
(rg -n "@Test" geekflex-backend\src\test\java | Measure-Object).Count
```

---

## Contact

- Developer: adam9e96
- Email: `adam9e96@gmail.com`
- GitHub: [https://github.com/adam9e96/geekflex](https://github.com/adam9e96/geekflex)
