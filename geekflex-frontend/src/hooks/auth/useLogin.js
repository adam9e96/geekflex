import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, clearTokens } from "@utils/auth";
import { validateUsername, validatePassword } from "@utils/auth/loginValidation";
import { useAuthStore } from "@stores/authStore";

/**
 * 로그인 기능 관리 커스텀 훅
 */
export const useLogin = () => {
  // 초기화
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loginError = useAuthStore((state) => state.loginError);
  const logoutMessage = useAuthStore((state) => state.logoutMessage);
  const setLoginError = useAuthStore((state) => state.setLoginError);
  const clearLoginError = useAuthStore((state) => state.clearLoginError);
  const setLogoutMessage = useAuthStore((state) => state.setLogoutMessage);

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  // UI 상태
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Refs
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // URL 파라미터에서 에러 메시지 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const logout = urlParams.get("logout");
    const expired = urlParams.get("expired");

    // 비동기로 상태 업데이트하여 cascading renders 방지
    const timeoutId = setTimeout(() => {
      if (error) {
        setLoginError("아이디(이메일) 또는 비밀번호가 올바르지 않습니다.");
      }

      if (logout) {
        setLogoutMessage("로그아웃되었습니다.");
        clearTokens();
      }

      if (expired) {
        setLoginError("세션이 만료되었습니다. 다시 로그인해주세요.");
        clearTokens();
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [setLoginError, setLogoutMessage]);

  // 로그인 상태 확인
  // 로그인 상태일 때 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // 첫 번째 입력 필드에 포커스
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // 실시간 유효성 검사
      if (name === "username") {
        const result = validateUsername(value);
        if (!result.valid && value.trim()) {
          setErrors((prev) => ({
            ...prev,
            username: result.message,
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.username;
            return newErrors;
          });
        }
      } else if (name === "password") {
        const result = validatePassword(value);
        if (!result.valid && value) {
          setErrors((prev) => ({
            ...prev,
            password: result.message,
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.password;
            return newErrors;
          });
        }
      }
    }
  };

  // 필드별 유효성 검사
  const validateField = (name, value) => {
    let result = { valid: true, message: "" };

    if (name === "username") {
      result = validateUsername(value);
    } else if (name === "password") {
      result = validatePassword(value);
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

    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.valid) {
      newErrors.password = passwordResult.message;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 비밀번호 표시/숨기기 토글
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  // 비밀번호 찾기 처리 (페이지로 이동)
  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  // Google 로그인 처리
  const handleGoogleLogin = () => {
    alert("Google 로그인 기능은 준비 중입니다.");
  };

  // Kakao 로그인 처리
  const handleKakaoLogin = () => {
    alert("Kakao 로그인 기능은 준비 중입니다.");
  };


  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setErrors({});
    clearLoginError();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const username = formData.username.trim();
    const password = formData.password;

    try {
      // authStore의 login 함수 호출 (API 호출 및 상태 업데이트 포함)
      const result = await login(username, password);

      if (result.success) {
        // 성공 시 상태 초기화
        setIsSubmitting(false);

        // 리다이렉트 전 약간의 지연 (사용자 경험 개선)
        // 리다이렉트 시 컴포넌트가 언마운트되므로 timeout은 자동으로 정리됨
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      } else {
        // 에러 메시지는 authStore에서 이미 설정됨
        setIsSubmitting(false);

        setFormData((prev) => ({
          ...prev,
          password: "",
        }));

        // ref를 사용하여 포커스 설정
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setIsSubmitting(false);
    }
  };

  // Enter 키 핸들러 (입력 필드에서 Enter 키 입력 시 폼 제출)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSubmitting) {
      e.preventDefault();
      // 폼 제출
      const form = e.target.closest("form");
      if (form && form.id === "loginForm") {
        handleSubmit(e);
      }
    }
  };

  // Escape 키 핸들러 (에러 메시지 초기화)
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setErrors({});
        clearLoginError();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [clearLoginError]);

  return {
    // 상태
    formData,
    isPasswordVisible,
    isSubmitting,
    errors,
    serverError: loginError, // Zustand에서 가져온 값
    logoutMessage, // Zustand에서 가져온 값
    // Refs
    usernameInputRef,
    passwordInputRef,
    // 핸들러
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
