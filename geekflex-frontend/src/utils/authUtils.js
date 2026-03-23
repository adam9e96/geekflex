/**
 * 리소스 소유권 확인 유틸리티
 *
 * @param {string|number} currentUserPublicId - 현재 로그인한 사용자의 Public ID
 * @param {Object} resourceUser - 리소스(리뷰, 댓글 등) 작성자 객체
 * @returns {boolean} - 소유자 여부
 */
export const isResourceOwner = (currentUserPublicId, resourceUser) => {
  if (!currentUserPublicId || !resourceUser || !resourceUser.publicId) {
    return false;
  }
  return currentUserPublicId === resourceUser.publicId;
};
