/**
 * 영화 관련 유틸리티 함수
 */

// TMDB 이미지 베이스 URL
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

/**
 * 포스터 이미지 URL 생성
 * 상대 경로인 경우 TMDB 베이스 URL을 추가하고, 전체 URL인 경우 그대로 반환
 * @param {string} posterUrl - 포스터 이미지 URL (상대 경로 또는 전체 URL)
 * @returns {string} 완전한 이미지 URL
 */
export const getPosterUrl = (posterUrl) => {
  if (!posterUrl) {
    console.warn("⚠️ posterUrl이 없습니다");
    // 빈 데이터 URL 반환 (로컬 fallback)
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect fill='%23ddd' width='300' height='450'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
  }
  // 이미 전체 URL인 경우 그대로 반환
  if (posterUrl.startsWith("http://") || posterUrl.startsWith("https://")) {
    // console.log("🔗 전체 URL 사용:", posterUrl);
    return posterUrl;
  }
  // 상대 경로인 경우 TMDB 베이스 URL 추가
  const fullUrl = `${TMDB_IMAGE_BASE_URL}${posterUrl}`;
  // console.log("🖼️ TMDB 이미지 URL 생성:", fullUrl);
  return fullUrl;
};
