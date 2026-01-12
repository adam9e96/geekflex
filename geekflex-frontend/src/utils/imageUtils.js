/**
 * 이미지 관련 유틸리티 함수
 */

// 백엔드 서버 URL 설정
// 개발 환경: 프록시를 통해 자동으로 처리 (상대 경로 사용)
// 프로덕션 환경: 필요시 백엔드 서버 URL 설정
// vite.config.js와 동일한 환경 변수 사용 (VITE_API_URL)
// 개발 환경(import.meta.env.DEV)에서는 항상 프록시 사용 (상대 경로)
// 프로덕션 환경에서만 VITE_API_URL 사용
const BACKEND_SERVER_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "";

/**
 * 프로필 이미지 URL 생성
 * 백엔드에서 반환하는 프로필 이미지 경로를 완전한 URL로 변환
 *
 * DB에 저장된 경로 예시: /uploads/users/01K9Y25T0JDT9W2JD3AEMH8NBY/d21070be-0c28-467c-8b6e-58010742fea9.png
 * 실제 물리 경로: C:/dev/GeekFlex/uploads/users/...
 *
 * 백엔드에서 정적 리소스로 제공하므로 /uploads 경로를 그대로 사용
 * Vite 프록시가 /uploads 요청을 백엔드 서버로 전달
 *
 * @param {string} profileImagePath - 프로필 이미지 경로 (상대 경로 또는 전체 URL)
 * @returns {string} 완전한 이미지 URL 또는 null
 */
export const getProfileImageUrl = (profileImagePath) => {
  if (!profileImagePath) {
    return null;
  }

  // 이미 전체 URL인 경우 그대로 반환
  if (profileImagePath.startsWith("http://") || profileImagePath.startsWith("https://")) {
    return profileImagePath;
  }

  // DB에 저장된 경로가 /uploads/users/... 형식인 경우
  // 프록시를 통해 백엔드 서버의 정적 리소스로 접근
  if (profileImagePath.startsWith("/uploads")) {
    // 개발 환경: 프록시를 통해 자동 처리 (상대 경로 그대로 사용)
    // 프로덕션 환경: BACKEND_SERVER_URL이 설정되어 있으면 전체 URL로 변환
    if (BACKEND_SERVER_URL) {
      return `${BACKEND_SERVER_URL}${profileImagePath}`;
    }
    // 개발 환경: 프록시 사용 시 상대 경로 그대로 반환
    // Vite 프록시가 /uploads 요청을 백엔드로 자동 전달
    // 예: /uploads/users/... → Vite 프록시 → http://localhost:8080/uploads/users/...
    return profileImagePath;
  }

  // /로 시작하는 절대 경로인 경우
  if (profileImagePath.startsWith("/")) {
    if (BACKEND_SERVER_URL) {
      return `${BACKEND_SERVER_URL}${profileImagePath}`;
    }
    return profileImagePath;
  }

  // 상대 경로인 경우 (예: uploads/users/...)
  const normalizedPath = profileImagePath.startsWith("/")
    ? profileImagePath
    : `/${profileImagePath}`;

  if (BACKEND_SERVER_URL) {
    return `${BACKEND_SERVER_URL}${normalizedPath}`;
  }

  return normalizedPath;
};

/**
 * 닉네임의 첫 글자를 반환하는 함수
 * 프로필 아바타에 사용되는 초기 문자를 생성
 *
 * @param {string} nickname - 사용자 닉네임
 * @returns {string} 첫 글자 (대문자) 또는 "U"
 */
export const getInitial = (nickname) => {
  if (!nickname) {
    return "U";
  }
  return nickname.charAt(0).toUpperCase();
};
