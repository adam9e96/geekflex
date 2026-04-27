# GEEKFLEX - Geek Culture Platform

![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat&logo=react&logoColor=black)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.9-6DB33F?style=flat&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-007396?style=flat&logo=openjdk&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3.0-646CFF?style=flat&logo=vite&logoColor=white)
![QueryDSL](https://img.shields.io/badge/QueryDSL-5.1.0-007396?style=flat)
![JJWT](https://img.shields.io/badge/JJWT-0.13.0-000000?style=flat&logo=jsonwebtokens&logoColor=white)

## 프로젝트 소개

**GeekFlex**는 TMDB 기반 영화/TV 콘텐츠 탐색, 리뷰 작성, 컬렉션 큐레이션, 사용자 상호작용을 하나의 흐름으로 묶은 미디어 플랫폼입니다.

- 배포 주소: [https://geekflex.adam9e96.dev/](https://geekflex.adam9e96.dev/)

단순한 콘텐츠 조회를 넘어 다음 경험을 제공합니다.

- 영화/드라마 상세 정보 탐색
- 리뷰 작성 및 수정
- 컬렉션 생성, 공개 설정, 커버 이미지 업로드
- 좋아요와 댓글 기반 상호작용
- 마이페이지, 사용자 프로필, 사용자 검색
- 이메일 인증 및 비밀번호 재설정

## 프로젝트 구조

```text
geekflex/
|- geekflex-backend/   # Spring Boot API 서버
|- geekflex-frontend/  # React + Vite 웹 앱
|- nginx/              # 배포용 Nginx 설정
|- docker-compose.yml  # 통합 실행 구성
|- .env.example        # 환경변수 예시
```

## 주요 기능

### 콘텐츠 탐색

- TMDB API 기반 영화/TV 메타데이터 조회
- 영화/드라마 상세 페이지 제공
- 검색 결과를 정확도 우선으로 정렬하는 동적 검색 로직
- 캐시 기반 상세 데이터 재사용

### 리뷰와 반응

- 콘텐츠 리뷰 작성, 수정, 삭제
- 별점 기반 평가
- 좋아요 토글 및 좋아요 수 조회
- 사용자별 리뷰 목록 조회

### 컬렉션 큐레이션

- 테마형 컬렉션 생성 및 수정
- 컬렉션 공개/비공개 설정
- 컬렉션에 콘텐츠 추가/삭제
- 컬렉션 커버 이미지 업로드
- 댓글 기반 커뮤니티 상호작용

### 사용자 기능

- 회원가입, 로그인, 로그아웃
- 이메일 인증
- 비밀번호 재설정
- 프로필 이미지 업로드
- 마이페이지 및 사용자 상세 페이지
- 사용자 검색

### 운영 기능

- 관리자 페이지 제공
- API 캐시/스케줄러 관리 기능 포함
- 헬스체크 엔드포인트 제공: `/api/health`

## 기술 스택

### Frontend

- React 19.2.3
- Vite 7.3.0
- React Router DOM 7.11.0
- Zustand 5.0.9
- Axios 1.13.5
- Tailwind CSS 4.1.18
- ESLint / Prettier / Stylelint

### Backend

- Java 21
- Spring Boot 3.5.9
- Spring Web MVC + WebClient
- Spring Security
- Spring Data JPA
- QueryDSL 5.1.0
- MariaDB
- Redis
- JJWT 0.13.0
- springdoc-openapi

### Infra / Tools

- Docker Compose
- Nginx
- Gradle
- GitHub
- Postman
- Notion

## 실행 방식

GeekFlex는 크게 두 가지 방식으로 실행할 수 있습니다.

- 로컬 개발 실행: 프론트와 백엔드를 각각 실행하기
- Docker Compose 실행: Nginx, DB, Redis, Backend를 함께 실행하기

## 사전 준비

### 공통

- Java 21+
- Node.js 18+

### 로컬 백엔드 실행 시 추가

- MariaDB
- Redis

## 환경변수 설정

루트 디렉터리에서 `.env.example`을 참고해 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

주요 환경변수:

- `GEEKFLEX_DB_ROOT_PASSWORD`
- `GEEKFLEX_DB_NAME`
- `GEEKFLEX_DB_USER`
- `GEEKFLEX_DB_PASSWORD`
- `GEEKFLEX_REDIS_PASSWORD`
- `GEEKFLEX_BACKEND_PORT`
- `GeekFlex_RESEND_API_KEY`
- `GeekFlex_TMDB_API_KEY`
- `GeekFlex_TMDB_ACCESS_TOKEN`
- `GeekFlex_JWT_SECRET_KEY`
- `GeekFlex_FILE_UPLOAD_DIR`

파일 업로드 경로는 기본적으로 `/app/uploads/users` 기준으로 동작합니다.

## 로컬 개발 실행

### 1. Backend

```bash
cd geekflex-backend
./gradlew bootRun
```

기본 설정 기준:

- Backend Port: `8080`
- MariaDB: `localhost:3306`
- Redis: `localhost:6379`

백엔드는 `application.yml` 기준으로 실행되며, 업로드 파일 정적 경로와 CORS 설정이 포함되어 있습니다.

### 2. Frontend

```bash
cd geekflex-frontend
npm install
npm run dev
```

기본 개발 서버 포트:

- Frontend Port: `5037`

## Docker Compose 실행

루트 디렉터리에서 아래 순서로 실행합니다.

### 1. 프론트 빌드

```bash
cd geekflex-frontend
npm install
npm run build
cd ..
```

### 2. 전체 서비스 실행

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
- MariaDB 초기 스키마는 `geekflex-backend/db-init/schema.sql`에서 로드됩니다.
- Backend는 `prod` 프로필로 실행됩니다.
- 배포 프로필에서는 Swagger UI와 API Docs가 비활성화됩니다.

## 품질 확인 명령어

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

## API / 운영 참고

- 서비스 URL: [https://geekflex.adam9e96.dev/](https://geekflex.adam9e96.dev/)
- Health Check: `GET /api/health`
- 업로드 정적 경로:
  - `/uploads/users/**`
  - `/uploads/collections/**`
- 운영 프로필: `application-prod.yml`
- Railway 배포용 설정 파일도 포함되어 있습니다: `application-railway.yml`

## Contact

- Developer: adam9e96
- Email: `adam9e96@gmail.com`
- GitHub: [https://github.com/adam9e96/geekflex](https://github.com/adam9e96/geekflex)
