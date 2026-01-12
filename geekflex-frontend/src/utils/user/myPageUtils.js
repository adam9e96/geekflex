/**
 * 마이페이지 유틸리티 함수
 */

/**
 * 날짜를 포맷팅합니다 (예: 2025년 1월 1일)
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * 날짜와 시간을 포맷팅합니다 (예: 2025년 1월 1일 오후 2시 30분)
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷팅된 날짜 시간 문자열
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
