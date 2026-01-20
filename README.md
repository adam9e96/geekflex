# GEEKFLEX – Geek Culture Platform

![Tech Stack](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat&logo=react&logoColor=black) ![Tech Stack](https://img.shields.io/badge/Spring_Boot-3.5.9-6DB33F?style=flat&logo=springboot&logoColor=white) ![Tech Stack](https://img.shields.io/badge/Java-21-007396?style=flat&logo=java&logoColor=white) ![Tech Stack](https://img.shields.io/badge/QueryDSL-5.1.0-007396?style=flat&logo=java&logoColor=white) ![Tech Stack](https://img.shields.io/badge/JJWT-0.13.0-000000?style=flat&logo=jsonwebtokens&logoColor=white)

## 📌 프로젝트 소개

**GeekFlex**는 TMDB API 기반의 방대한 콘텐츠 데이터에 사용자의 취향을 더한 차세대 미디어 플랫폼입니다.
단순한 정보 검색을 넘어, 사용자가 직접 평론가가 되어 심도 있는 리뷰를 남기고, 나만의 테마로 컬렉션을 구성하여 공유하는 **능동적인 콘텐츠 소비 경험**을 제공합니다.

BFF(Backend for Frontend) 아키텍처를 적용하여 보안성을 강화했으며, QueryDSL을 활용한 고성능 동적 검색 시스템과 JWT + Redis 기반의 견고한 인증 시스템을 구축하여 **실무 수준의 기술적 완성도**를 구현했습니다.

## 📅 프로젝트 개요

- **개발 기간**: 2025.10 ~ 2025.11 (약3주)
- **개발 인원**: 1명 (Full Stack)
- **주요 역할**: 기획, DB 설계, API 구현, 프론트엔드 개발

## 핵심 기능

### 1. 실시간 콘텐츠 동기화 (TMDB API & BFF)

- **17만+ 데이터 연동**: TMDB API와 실시간 연동하여 최신 영화/드라마 메타데이터 및 고화질 포스터 제공
- **데이터 경량화**: 프론트엔드에 필요한 데이터만 선별하여 전송하는 DTO 매핑 전략으로 로딩 속도 최적화
- **반응형 UX**: PC, 태블릿, 모바일 등 모든 디바이스에서 최적화된 뷰 제공

### 2. 고성능 동적 검색 (QueryDSL)

- **정교한 필터링**: 장르, 연도, 평점 등 복잡한 조건도 즉시 처리하는 동적 쿼리 구현
- **검색 정확도 알고리즘**: 단순 매칭이 아닌 `정확 일치 > 시작 > 포함` 순의 가중치 기반 정렬 로직 적용
- **Type-Safe**: 컴파일 시점에 쿼리 문법 오류를 잡아내는 안정적인 검색 시스템 구축

### 3. 보안 시스템 (Security & Auth)

- **3-Layer Security**: JWT Access Token + HttpOnly Cookie Refresh Token + Redis Blacklist 전략으로 XSS 및 토큰 탈취 방지
- **이메일 본인인증**: SMTP와 Redis TTL(5분)을 활용한 안전하고 빠른 회원가입 프로세스
- **RBAC**: Spring Security 권한 기반의 철저한 API 접근 제어

### 4. 나만의 취향 큐레이션 (Collections)

- **테마별 아카이빙**: '우울할 때 보는 영화', '여름방학 정주행 드라마' 등 나만의 테마 컬렉션 생성
- **소셜 인터랙션**: 다른 유저의 컬렉션을 구경하고 좋아요/댓글로 소통하는 커뮤니티 기능
- **공유 및 확장**: 공개/비공개 설정을 통해 개인 기록용 또는 공유용으로 유연하게 활용 가능

## 🛠 기술 스택

### Frontend

- **Core**: React 19.2.3, Vite 7.3.0
- **State Management**: Zustand 5.0.9 (전역 상태 관리 최적화)
- **Styling**: Tailwind CSS 4.1.18 (유틸리티 퍼스트 CSS)
- **Network**: Axios 1.13.2 (Interceptor를 통한 토큰 재발급 자동화)
- **Routing**: React Router DOM 7.11.0

### Backend

- **Framework**: Spring Boot 3.5.9, Spring WebFlux
- **Language**: Java 21 (LTS)
- **Database**: MariaDB, Redis (캐싱 및 토큰 관리)
- **ORM**: JPA (Hibernate), QueryDSL 5.1.0
- **Security**: Spring Security, JWT (jjwt 0.13.0)

### DevOps & Tools

- **Build**: Gradle
- **Version Control**: GitHub
- **API Test**: Postman
- **Management**: DataGrip, Notion

## 🚀 설치 및 실행 방법

### Prerequisites

- Java 21+
- Node.js 18+
- MariaDB & Redis

### 1. Backend Setting

```bash
cd GeekFlex
# application.yml 설정 (DB, Mail, JWT 등)
./gradlew bootRun
```

### 2. Frontend Setting

```bash
cd geekflex-frontend
npm install
npm run dev
```

## 📧 Contact

- **Developer**: Adam
- **Email**: adam9e96@gmail.com
- **GitHub**: [https://github.com/adam9e96/geekflex](https://github.com/adam9e96/geekflex)
