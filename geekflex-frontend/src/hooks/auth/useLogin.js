import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@utils/auth";
import { validateUsername, validatePassword } from "@utils/auth/loginValidation";
import { useAuthStore } from "@stores/authStore";
import { useAuthUrlParams } from "./useAuthUrlParams";

/**
 * 로그인 기능 관리 커스텀 훅
 */
export const useLogin = () => {
  const navigate = useNavigate();

  const { login, loginError, logoutMessage, setLoginError, clearLoginError, setLogoutMessage } =
    useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // 1 Error, Logout, Expired
  useAuthUrlParams({ setLoginError, setLogoutMessage });

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setErrors({});
        clearLoginError();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [clearLoginError]);

  const getValidationResult = (name, value) => {
    switch (name) {
      case "username":
        return validateUsername(value);
      case "password":
        return validatePassword(value);
      default:
        return { valid: true };
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // 실시간 유효성 검사
    if (type !== "checkbox") {
      const result = getValidationResult(name, newValue);

      setErrors((prev) => {
        const newErrors = { ...prev };
        if (!result.valid && newValue) {
          // Show error if invalid and not empty (or depends on UX)
          // loginValidation.js의 validateUsername은 빈 값일 때도 에러를 리턴하지만,
          // 입력 중일 때는 빈 값이면 에러를 지우는 것이 자연스러울 수 있음.
          // 기존 로직: if (!result.valid && value.trim()) ...
          if (name === "username" && !newValue.trim()) {
            delete newErrors[name];
            return newErrors;
          }
          newErrors[name] = result.message;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  }, []);

  const validateField = useCallback((name, value) => {
    const result = getValidationResult(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: result.valid ? undefined : result.message,
    }));
    return result.valid;
  }, []);

  const validateForm = () => {
    const usernameResult = validateUsername(formData.username);
    const passwordResult = validatePassword(formData.password);

    const newErrors = {};
    if (!usernameResult.valid) newErrors.username = usernameResult.message;
    if (!passwordResult.valid) newErrors.password = passwordResult.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    clearLoginError();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await login(formData.username.trim(), formData.password);

      if (result.success) {
        // Successful login
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      } else {
        // Failed login
        setFormData((prev) => ({ ...prev, password: "" }));
        passwordInputRef.current?.focus();
      }
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  const handleGoogleLogin = () => alert("Google 로그인 기능은 준비 중입니다.");
  const handleKakaoLogin = () => alert("Kakao 로그인 기능은 준비 중입니다.");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSubmitting) {
      // Only submit if it's the login form
      if (e.target.closest("#loginForm")) {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  return {
    formData,
    isPasswordVisible,
    isSubmitting,
    errors,
    serverError: loginError,
    logoutMessage,
    usernameInputRef,
    passwordInputRef,
    handleInputChange,
    validateField,
    togglePasswordVisibility,
    handleForgotPassword,
    handleGoogleLogin,
    handleKakaoLogin,
    handleSubmit,
    handleKeyDown,
  };
};
