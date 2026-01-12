import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { validateUsername } from "@utils/auth/loginValidation";
import { publicApi, getErrorMessage } from "@services/apiClient";

/**
 * 비밀번호 찾기 기능 관리 커스텀 훅
 */
export const useForgotPassword = () => {
  const navigate = useNavigate();

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  // UI 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Refs
  const usernameInputRef = useRef(null);

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { valid: false, message: "이메일을 입력해주세요." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: "올바른 이메일 형식을 입력해주세요." };
    }
    return { valid: true };
  };

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 서버 에러 및 성공 메시지 초기화
    if (serverError) setServerError("");
    if (successMessage) setSuccessMessage("");

    // 실시간 유효성 검사 (값이 있을 때만)
    if (value.trim()) {
      validateField(name, value);
    } else {
      // 값이 비어있으면 에러 제거
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 필드별 유효성 검사
  const validateField = (name, value) => {
    let result = { valid: true, message: "" };

    if (name === "username") {
      result = validateUsername(value);
    } else if (name === "email") {
      result = validateEmail(value);
    }

    if (!result.valid) {
      setErrors((prev) => ({
        ...prev,
        [name]: result.message,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    return result.valid;
  };

  // 폼 전체 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const usernameResult = validateUsername(formData.username);
    if (!usernameResult.valid) {
      newErrors.username = usernameResult.message;
      isValid = false;
    }

    const emailResult = validateEmail(formData.email);
    if (!emailResult.valid) {
      newErrors.email = emailResult.message;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 비밀번호 찾기 API 호출
  const requestPasswordReset = async (username, email) => {
    try {
      const response = await publicApi.post("/api/v1/auth/forgot-password", {
        username,
        email,
      });

      if (response.status === 200) {
        setSuccessMessage(
          "비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요."
        );
        setServerError("");
        // 폼 초기화
        setFormData({ username: "", email: "" });
        setErrors({});
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setServerError(errorMessage || "비밀번호 재설정 요청에 실패했습니다.");
      setSuccessMessage("");
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 서버 에러 및 성공 메시지 초기화
    setServerError("");
    setSuccessMessage("");

    // 유효성 검사
    if (!validateForm()) {
      // 첫 번째 에러 필드로 포커스
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField === "username" && usernameInputRef.current) {
        usernameInputRef.current.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset(formData.username.trim(), formData.email.trim());
    } catch (error) {
      console.error("비밀번호 찾기 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 키보드 이벤트 핸들러 (Enter 키 처리)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSubmitting) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 로그인 페이지로 돌아가기
  const handleBackToLogin = () => {
    navigate("/login");
  };

  return {
    formData,
    isSubmitting,
    errors,
    serverError,
    successMessage,
    usernameInputRef,
    handleInputChange,
    validateField,
    handleSubmit,
    handleKeyDown,
    handleBackToLogin,
  };
};
