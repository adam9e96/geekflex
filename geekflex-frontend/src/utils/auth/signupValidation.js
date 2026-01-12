/**
 * 회원가입 폼 유효성 검사 유틸리티
 */

/**
 * 나이 계산
 */
const calculateAge = (birthDate, today) => {
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

/**
 * 아이디 유효성 검사
 */
export const validateUserId = (userId) => {
  if (!userId || userId.trim() === "") {
    return { valid: false, message: "아이디는 필수 입력 항목입니다." };
  }
  const trimmed = userId.trim();
  if (trimmed.length < 4 || trimmed.length > 50) {
    return { valid: false, message: "아이디는 4 ~ 50자 사이여야 합니다." };
  }
  return { valid: true, message: "" };
};

/**
 * 비밀번호 유효성 검사
 */
export const validatePassword = (password) => {
  if (!password || password === "") {
    return { valid: false, message: "비밀번호는 필수입니다." };
  }
  if (password.length < 8 || password.length > 100) {
    return { valid: false, message: "비밀번호는 최소 8자 이상이어야 합니다." };
  }
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&+=]).*$/;
  if (!passwordRegex.test(password)) {
    return { valid: false, message: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다." };
  }
  return { valid: true, message: "" };
};

/**
 * 비밀번호 확인 유효성 검사
 */
export const validateConfirmPassword = (confirmPassword) => {
  if (!confirmPassword || confirmPassword === "") {
    return { valid: false, message: "비밀번호 확인을 입력해주세요." };
  }
  return { valid: true, message: "" };
};

/**
 * 비밀번호 일치 검사
 */
export const validatePasswordsMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) {
    return { valid: false, message: "비밀번호가 일치하지 않습니다!" };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: "비밀번호가 일치하지 않습니다!" };
  }
  return { valid: true, message: "" };
};

/**
 * 닉네임 유효성 검사
 */
export const validateNickname = (nickname) => {
  if (!nickname || nickname.trim() === "") {
    return { valid: false, message: "닉네임은 필수입니다." };
  }
  const trimmed = nickname.trim();
  if (trimmed.length > 20) {
    return { valid: false, message: "닉네임은 20자 이내로 입력해주세요." };
  }
  return { valid: true, message: "" };
};

/**
 * 이메일 유효성 검사
 */
export const validateUserEmail = (userEmail) => {
  if (!userEmail || userEmail.trim() === "") {
    return { valid: false, message: "이메일은 필수입니다." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail.trim())) {
    return { valid: false, message: "올바른 이메일 형식이 아닙니다." };
  }
  return { valid: true, message: "" };
};

/**
 * 자기소개 유효성 검사
 */
export const validateBio = (bio) => {
  if (!bio || bio.trim() === "") {
    return { valid: true, message: "" };
  }
  if (bio.length > 300) {
    return { valid: false, message: "자기소개는 300자 이내로 입력해주세요." };
  }
  return { valid: true, message: "" };
};

/**
 * 생년월일 유효성 검사
 */
export const validateBirthDate = (birthDate) => {
  if (!birthDate || birthDate === "") {
    return { valid: false, message: "생년월일은 필수입니다." };
  }
  const selectedDate = new Date(birthDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate >= today) {
    return { valid: false, message: "생년월일은 과거 날짜여야 합니다." };
  }

  const age = calculateAge(selectedDate, today);
  if (age < 14) {
    return { valid: false, message: "만 14세 이상만 가입 가능합니다." };
  }

  return { valid: true, message: "" };
};

/**
 * 이용약관 동의 검사
 */
export const validateTermsAgreement = (termsAgreement) => {
  if (!termsAgreement) {
    return { valid: false, message: "이용약관에 동의해야 회원가입이 가능합니다." };
  }
  return { valid: true, message: "" };
};
