/**
 * 로그인 폼 유효성 검사 유틸리티
 */

/**
 * 아이디 또는 이메일 유효성 검사
 * @param {string} username - 검사할 아이디 또는 이메일
 * @returns {Object} { valid: boolean, message?: string, type?: 'email' | 'userId' }
 */
export const validateUsername = (username) => {
  const trimmed = username.trim();

  if (!trimmed) {
    return { valid: false, message: "아이디 또는 이메일을 입력해주세요." };
  }

  // 이메일 형식인지 확인
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return { valid: true, type: "email" };
  }

  // 아이디 형식인지 확인 (영문, 숫자 4-50자)
  const userIdRegex = /^[a-zA-Z0-9]{4,50}$/;
  if (userIdRegex.test(trimmed)) {
    return { valid: true, type: "userId" };
  }

  return { valid: false, message: "올바른 아이디 또는 이메일 형식을 입력해주세요." };
};

/**
 * 비밀번호 유효성 검사
 * @param {string} password - 검사할 비밀번호
 * @returns {Object} { valid: boolean, message?: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: "비밀번호를 입력해주세요." };
  }
  if (password.length < 8) {
    return { valid: false, message: "비밀번호는 8자 이상이어야 합니다." };
  }
  return { valid: true };
};
