# GeekFlex Backend

## 1. 개요
- 프로젝트: `GeekFlex` Spring Boot 백엔드
- 기본 주소: `http://localhost:8080`
- API Prefix: `/api/v1`
- 주요 기능:
  - 인증(JWT + RefreshToken 쿠키)
  - 회원/프로필 관리
  - 영화/드라마 검색 및 상세 조회
  - 리뷰 CRUD
  - 좋아요 토글/조회
  - 컬렉션/컬렉션 아이템/댓글 관리

## 2. 실행 전 환경
`src/main/resources/application.yml` 기준 필수 환경 변수:
- `GeekFlex_DB_PASSWORD`
- `GeekFlex_GMAIL_APP_PASSWORD`
- `GeekFlex_TMDB_API_KEY`
- `GeekFlex_TMDB_ACCESS_TOKEN`
- `GeekFlex_JWT_SECRET_KEY`
- `GeekFlex_FILE_UPLOAD_DIR`

로컬 기본 설정:
- MariaDB: `localhost:3306/geekflex_db`
- Redis: `localhost:6379`
- 서버 포트: `8080`

## 3. 인증 방식
- 로그인 성공 시:
  - Body: `accessToken` 반환
  - Cookie: `refreshToken`(HttpOnly, Secure) 저장
- 인증 필요 API:
  - `Authorization: Bearer <accessToken>` 필요
- 토큰 재발급:
  - `/api/v1/auth/refresh` 호출 시 쿠키의 refreshToken 사용

## 4. 공통 응답 형태
일부 API는 아래 래퍼를 사용합니다.

```json
{
  "success": true,
  "message": "요청 성공 메시지",
  "data": {},
  "errors": null
}
```

일부 API는 DTO를 직접 반환합니다(래퍼 없음).

## 5. API 명세

### 5.1 Auth (`/api/v1/auth`)

#### POST `/login`
- 설명: 로그인
- Request Body:

```json
{
  "username": "string",
  "password": "string"
}
```

- Response 200:

```json
{
  "accessToken": "jwt-token"
}
```

#### POST `/logout`
- 설명: 로그아웃 (DB refresh token 삭제 + 쿠키 무효화)
- 인증: 필요
- Response: `200/204` 수준 성공 응답(Body 없음)

#### POST `/refresh`
- 설명: RefreshToken 쿠키 기반 AccessToken 재발급
- Response 200:

```json
{
  "accessToken": "new-jwt-token"
}
```

- Response 401: refresh token 없음/유효성 실패

#### POST `/email/send`
- 설명: 이메일 인증코드 발송
- Request Body:

```json
{
  "email": "user@example.com"
}
```

- Response: `200 OK`

#### POST `/email/verify`
- 설명: 이메일 인증코드 검증
- Request Body:

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

- Response 200: `true | false`

---

### 5.2 User (`/api/v1`)

#### GET `/users/check/user-id?userId={userId}`
- 설명: 아이디 중복 검사
- Response: `ApiResponse<UserIdCheckResponse>`

#### POST `/signup` (multipart/form-data)
- 설명: 회원가입
- Parts:
  - `data`: `UserJoinRequest` JSON
  - `profile`(optional): 이미지 파일
- Response 201: `ApiResponse<UserDetailResponse>`

#### GET `/users/me`
- 설명: 로그인 사용자 상세 정보
- 인증: 필요
- Response: `UserInfoResponse`

#### GET `/users/me/summary`
- 설명: 헤더용 요약 사용자 정보
- 인증: 필요
- Response: `UserSummaryResponse`

#### POST `/users/me/verify-password`
- 설명: 현재 비밀번호 확인
- 인증: 필요
- Request Body:

```json
{
  "password": "string"
}
```

- Response: `ApiResponse<Void>`

#### GET `/users/{publicId}/profile`
- 설명: 공개 프로필 + 리뷰 통계
- Response: `UserProfileResponse`

#### PUT `/users/me` (multipart/form-data)
- 설명: 회원정보 수정
- 인증: 필요
- Parts:
  - `data`: `UserUpdateRequest` JSON
  - `profile`(optional): 이미지 파일
- Response: `ApiResponse<UserInfoResponse>`

#### DELETE `/users/me`
- 설명: 회원탈퇴
- 인증: 필요
- Request Body: `UserDeleteRequest`
- Response: `ApiResponse<Void>`

#### GET `/users/{publicId}`
- 설명: 사용자 상세(프로필/리뷰/컬렉션)
- Response: `ApiResponse<UserInfoDetailResponse>`

#### GET `/users/search?keyword={keyword}`
- 설명: 사용자 검색
- Response: `List<UserSearchResponse>`

---

### 5.3 Movies (`/api/v1/movies`)

#### GET `/now-playing`
- 설명: 현재 상영작 목록
- Response: `List<ContentResponse>`

#### GET `/popular`
- 설명: 인기 영화 목록
- Response: `List<ContentResponse>`

#### GET `/top_rated`
- 설명: 평점 높은 영화 목록
- Response: `List<ContentResponse>`

#### GET `/upcoming`
- 설명: 개봉 예정 영화 목록
- Response: `List<ContentResponse>`

#### GET `/{tmdbId}?language=ko-KR`
- 설명: 영화 상세 조회
- Response: `MovieDetailResponse`

#### GET `/search?keyword={keyword}`
- 설명: 영화 검색
- Response: `List<MovieSearchResponse>`

#### POST `/{tmdbId}`
- 설명: 영화 저장(검색 결과에서 선택)
- Response: `ApiResponse<ContentResponse>`

---

### 5.4 TV (`/api/v1/tv`)

#### GET `/search?keyword={keyword}`
- 설명: 드라마 검색
- Response: `List<TvSearchResponse>`

#### GET `/{tmdbId}?language=ko-KR`
- 설명: 드라마 상세 조회
- Response: `TvDetailResponse`

#### POST `/{tmdbId}`
- 설명: 드라마 저장
- Response: `ApiResponse<ContentResponse>`

---

### 5.5 Reviews (`/api/v1/reviews`)

#### POST `/{tmdbId}`
- 설명: 리뷰 작성
- 인증: 필요
- Request Body: `ReviewCreateRequest`
- Response: `ReviewCreateResponse`

#### GET `/content/{contentId}`
- 설명: 콘텐츠 리뷰 목록 조회
- Response: `List<ReviewResponse>`

#### PUT `/{reviewId}`
- 설명: 리뷰 수정
- 인증: 필요
- Request Body: `ReviewUpdateRequest`
- Response: `ReviewResponse`

#### DELETE `/{reviewId}`
- 설명: 리뷰 삭제
- 인증: 필요
- Response: `204 No Content`

#### GET `/me`
- 설명: 내 리뷰 목록 조회
- 인증: 필요
- Response: `List<ReviewMyPageResponse>`

#### GET `/me/count`
- 설명: 내 리뷰 개수 조회
- 인증: 필요
- Response: `ReviewCountResponse`

---

### 5.6 Likes (`/api/v1/likes`)

#### POST `/{targetType}/{targetId}`
- 설명: 좋아요 토글
- 인증: 필요
- Response: `ApiResponse<LikeToggleResponse>`

#### GET `/{targetType}/{targetId}`
- 설명: 좋아요 상태 조회
- 인증: 선택(비로그인 시 false)
- Response: `ApiResponse<LikeStatusResponse>`

#### GET `/{targetType}/{targetId}/all`
- 설명: 좋아요 개수 조회
- Response: `ApiResponse<LikeCountResponse>`

#### GET `/{targetType}?reviewIds=1,2,3` 또는 `targetIds=1,2,3`
- 설명: 좋아요 상태 일괄 조회
- Response: `ApiResponse<List<Long>>` (좋아요한 targetId 목록)

---

### 5.7 Collections (`/api/v1/collections`)

#### POST `/`
- 설명: 컬렉션 생성
- 인증: 필요
- Request Body: `CollectionCreateRequest`
- Response: `ApiResponse<CollectionResponse>`

#### GET `/`
- 설명: 공개 컬렉션 목록
- Query:
  - `sortBy` = `latest|views` (default `latest`)
  - 페이징: `page`, `size`
- Response: `ApiResponse<Page<CollectionResponse>>`

#### GET `/{id}`
- 설명: 컬렉션 상세 + 조회수 증가
- 인증: 선택
- Response: `ApiResponse<CollectionDetailResponse>`

#### PUT `/{id}`
- 설명: 컬렉션 수정
- 인증: 필요
- Request Body: `CollectionUpdateRequest`
- Response: `ApiResponse<CollectionResponse>`

#### DELETE `/{id}`
- 설명: 컬렉션 삭제
- 인증: 필요
- Response: `204 No Content`

#### GET `/me`
- 설명: 내 컬렉션 목록
- 인증: 필요
- Response: `ApiResponse<List<CollectionResponse>>`

#### GET `/user/{userIdOrPublicId}`
- 설명: 특정 사용자 컬렉션 목록
- 인증: 선택
- Response: `ApiResponse<List<CollectionResponse>>`

#### POST `/{id}/items`
- 설명: 컬렉션 아이템 추가
- 인증: 필요
- Request Body: `CollectionItemRequest`
- Response: `ApiResponse<Void>`

#### DELETE `/{id}/items/{contentId}`
- 설명: 컬렉션 아이템 제거
- 인증: 필요
- Response: `204 No Content`

#### GET `/{id}/items`
- 설명: 컬렉션 아이템 목록
- 인증: 선택
- Response: `ApiResponse<List<ContentResponse>>`

#### GET `/{id}/items/count`
- 설명: 아이템 개수 조회
- 현재 상태: Controller 구현 미완성(`null` 반환)

#### POST `/{id}/comments`
- 설명: 댓글 생성
- 인증: 필요
- Request Body: `CollectionCommentRequest`
- Response: `ApiResponse<CollectionCommentResponse>`

#### PUT `/{id}/comments/{commentId}`
- 설명: 댓글 수정
- 인증: 필요
- Request Body: `CollectionCommentRequest`
- Response: `ApiResponse<CollectionCommentResponse>`

#### DELETE `/{id}/comments/{commentId}`
- 설명: 댓글 삭제
- 인증: 필요
- Response: `204 No Content`

#### GET `/{id}/comments`
- 설명: 댓글 목록
- 인증: 선택
- Response: `ApiResponse<List<CollectionCommentResponse>>`

## 6. 에러 처리
- 전역 예외 핸들러: `com.geekflex.app.common.exception.GlobalExceptionHandler`
- 도메인 예외 발생 시 상태코드/메시지는 핸들러 정책을 따름

## 7. 참고
- 본 문서는 `Controller` 기준으로 작성된 운영/개발용 API 개요 문서입니다.
- DTO 상세 필드 스키마는 각 `*.dto` 클래스 참고.
