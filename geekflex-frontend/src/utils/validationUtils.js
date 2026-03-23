/**
 * 이메일 유효성 검사
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 프로필 수정 폼 유효성 검사
 * @param {Object} data - 폼 데이터
 * @param {boolean} isOAuthUser - 소셜 로그인 사용자 여부
 * @returns {Object} 에러 객체 (에러가 없으면 빈 객체)
 */
export const validateProfileForm = (data, isOAuthUser) => {
  const errors = {};

  // 닉네임 검증
  if (!data.nickname || data.nickname.trim().length === 0) {
    errors.nickname = "닉네임을 입력해주세요.";
  } else if (data.nickname.trim().length > 50) {
    errors.nickname = "닉네임은 50자 이하여야 합니다.";
  }

  // 이메일 검증
  if (!data.userEmail || data.userEmail.trim().length === 0) {
    errors.userEmail = "이메일을 입력해주세요.";
  } else if (!validateEmail(data.userEmail.trim())) {
    errors.userEmail = "올바른 이메일 형식이 아닙니다.";
  }

  // 자기소개 검증
  if (data.bio && data.bio.length > 200) {
    errors.bio = "자기소개는 200자 이하여야 합니다.";
  }

  // 비밀번호 변경 검증 (소셜 로그인 사용자 제외, 비밀번호 제공 시에만)
  if (!isOAuthUser && data.newPassword && data.newPassword.trim().length > 0) {
    if (!data.currentPassword || data.currentPassword.trim().length === 0) {
      errors.currentPassword = "현재 비밀번호를 입력해주세요.";
    }
    if (data.newPassword.length < 8) {
      errors.newPassword = "비밀번호는 8자 이상이어야 합니다.";
    }
    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = "새 비밀번호가 일치하지 않습니다.";
    }
  }

  return errors;
};

/**
 * 프로필 이미지 파일 검증
 * @param {File} file
 * @returns {string|null} 에러 메시지 (없으면 null)
 */
export const validateProfileImage = (file) => {
  if (!file) return null;

  // 파일 크기 검사 (5MB 제한)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return "파일 크기는 5MB 이하여야 합니다.";
  }

  // 파일 타입 검사
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return "jpg, jpeg, png, webp 형식의 이미지 파일만 업로드 가능합니다.";
  }

  return null;
};
