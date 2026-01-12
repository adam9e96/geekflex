import { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  validateUserId,
  validatePassword,
  validateConfirmPassword,
  validatePasswordsMatch,
  validateNickname,
  validateUserEmail,
  validateBio,
  validateBirthDate,
  validateTermsAgreement,
} from "@utils/auth/signupValidation";
import { publicApi, getErrorMessage, getResponseData } from "@services/apiClient";

/**
 * 회원가입 기능 관리 커스텀 훅
 */
export const useSignup = () => {
  const navigate = useNavigate();

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    userId: "",
    nickname: "",
    userEmail: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    bio: "",
    termsAgreement: false,
    marketingAgreement: false,
    profileImage: null,
  });

  // UI 상태
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  
  // 아이디 중복 검사 상태
  const [userIdCheckStatus, setUserIdCheckStatus] = useState({
    isChecking: false,
    isChecked: false,
    available: null,
    message: "",
  });

  // Refs
  const fileInputRef = useRef(null);
  const previewImageRef = useRef(null);

  // 자기소개 글자 수 계산 (useMemo로 변경하여 useEffect 제거)
  const bioCharCount = useMemo(() => formData.bio.length, [formData.bio]);

  // 필드별 유효성 검사
  const validateField = useCallback(
    (name, value) => {
      let result = { valid: true, message: "" };

      switch (name) {
        case "userId":
          result = validateUserId(value);
          break;
        case "nickname":
          result = validateNickname(value);
          break;
        case "userEmail":
          result = validateUserEmail(value);
          break;
        case "birthDate":
          result = validateBirthDate(value);
          break;
        case "password":
          result = validatePassword(value);
          if (result.valid && formData.confirmPassword) {
            const matchResult = validatePasswordsMatch(value, formData.confirmPassword);
            if (!matchResult.valid) {
              setErrors((prev) => ({
                ...prev,
                confirmPassword: matchResult.message,
              }));
            } else {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.confirmPassword;
                return newErrors;
              });
            }
          }
          break;
        case "confirmPassword":
          result = validateConfirmPassword(value);
          if (result.valid && formData.password) {
            const matchResult = validatePasswordsMatch(formData.password, value);
            if (!matchResult.valid) {
              result = matchResult;
            }
          }
          break;
        case "bio":
          result = validateBio(value);
          break;
        default:
          return;
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
    },
    [formData.password, formData.confirmPassword],
  );

  // 입력 필드 변경 핸들러
  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked, files } = e.target;

      if (type === "checkbox") {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      } else if (type === "file") {
        const file = files?.[0];
        if (file) {
          // 파일 크기 검사 (5MB 제한)
          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            setErrors((prev) => ({
              ...prev,
              profileImage: "파일 크기는 5MB 이하여야 합니다.",
            }));
            return;
          }

          // 파일 타입 검사 (jpg, jpeg, png, webp만 허용)
          const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
          const fileExtension = file.name.split(".").pop().toLowerCase();
          const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

          if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            setErrors((prev) => ({
              ...prev,
              profileImage: "jpg, jpeg, png, webp 형식의 이미지 파일만 업로드 가능합니다.",
            }));
            return;
          }

          // 미리보기 생성
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviewImage(e.target.result);
          };
          reader.onerror = () => {
            setErrors((prev) => ({
              ...prev,
              profileImage: "파일을 읽는 중 오류가 발생했습니다.",
            }));
          };
          reader.readAsDataURL(file);

          setFormData((prev) => ({
            ...prev,
            profileImage: file,
          }));

          // 에러 초기화
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.profileImage;
            return newErrors;
          });
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));

        // 아이디가 변경되면 중복 검사 상태 초기화
        if (name === "userId") {
          setUserIdCheckStatus({
            isChecking: false,
            isChecked: false,
            available: null,
            message: "",
          });
        }

        // 실시간 유효성 검사
        validateField(name, value);
      }
    },
    [validateField],
  );

  // 약관 동의 변경 핸들러
  const handleTermsChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));

    if (name === "termsAgreement") {
      const result = validateTermsAgreement(checked);
      if (!result.valid) {
        setErrors((prev) => ({
          ...prev,
          termsAgreement: result.message,
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.termsAgreement;
          return newErrors;
        });
      }
    }
  };

  // 비밀번호 표시/숨기기 토글
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev);
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
    }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.profileImage;
      return newErrors;
    });
  };

  // 아이디 중복 검사
  const checkUserIdAvailability = useCallback(async (userId) => {
    // 아이디가 비어있거나 유효하지 않으면 검사하지 않음
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      setUserIdCheckStatus({
        isChecking: false,
        isChecked: false,
        available: null,
        message: "",
      });
      return;
    }

    setUserIdCheckStatus((prev) => ({
      ...prev,
      isChecking: true,
      isChecked: false,
      available: null,
      message: "",
    }));

    try {
      const response = await publicApi.get("/api/v1/users/check/user-id", {
        params: { userId: userId.trim() },
      });

      const data = getResponseData(response);

      if (data?.available !== undefined) {
        const { available, message } = data;
        setUserIdCheckStatus({
          isChecking: false,
          isChecked: true,
          available,
          message,
        });

        // 중복된 아이디인 경우 에러 설정
        if (!available) {
          setErrors((prev) => ({
            ...prev,
            userId: message,
          }));
        } else {
          // 사용 가능한 경우 userId 에러 제거
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.userId && newErrors.userId === message) {
              delete newErrors.userId;
            }
            return newErrors;
          });
        }
      } else {
        throw new Error("아이디 중복 검사 응답 형식이 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("아이디 중복 검사 오류:", error);
      setUserIdCheckStatus({
        isChecking: false,
        isChecked: false,
        available: null,
        message: getErrorMessage(error),
      });
    }
  }, []);

  // 폼 전체 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const userIdResult = validateUserId(formData.userId);
    if (!userIdResult.valid) {
      newErrors.userId = userIdResult.message;
      isValid = false;
    }

    const nicknameResult = validateNickname(formData.nickname);
    if (!nicknameResult.valid) {
      newErrors.nickname = nicknameResult.message;
      isValid = false;
    }

    const userEmailResult = validateUserEmail(formData.userEmail);
    if (!userEmailResult.valid) {
      newErrors.userEmail = userEmailResult.message;
      isValid = false;
    }

    const birthDateResult = validateBirthDate(formData.birthDate);
    if (!birthDateResult.valid) {
      newErrors.birthDate = birthDateResult.message;
      isValid = false;
    }

    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.valid) {
      newErrors.password = passwordResult.message;
      isValid = false;
    }

    const confirmPasswordResult = validateConfirmPassword(formData.confirmPassword);
    if (!confirmPasswordResult.valid) {
      newErrors.confirmPassword = confirmPasswordResult.message;
      isValid = false;
    }

    const passwordsMatchResult = validatePasswordsMatch(
      formData.password,
      formData.confirmPassword,
    );
    if (!passwordsMatchResult.valid) {
      newErrors.confirmPassword = passwordsMatchResult.message;
      isValid = false;
    }

    const bioResult = validateBio(formData.bio);
    if (!bioResult.valid) {
      newErrors.bio = bioResult.message;
      isValid = false;
    }

    const termsResult = validateTermsAgreement(formData.termsAgreement);
    if (!termsResult.valid) {
      newErrors.termsAgreement = termsResult.message;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          errorElement.focus();
        }
      }
      return;
    }

    setIsSubmitting(true);

    // FormData 생성
    const submitData = new FormData();

    // UserJoinRequest 객체를 JSON으로 생성
    const userJoinRequest = {
      userId: formData.userId,
      nickname: formData.nickname,
      userEmail: formData.userEmail,
      birthDate: formData.birthDate,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      bio: formData.bio || "",
      termsAgreement: formData.termsAgreement,
      marketingAgreement: formData.marketingAgreement,
    };

    // "data" 필드에 JSON 객체를 Blob으로 추가 (Content-Type: application/json)
    const jsonBlob = new Blob([JSON.stringify(userJoinRequest)], {
      type: "application/json",
    });
    submitData.append("data", jsonBlob);

    // "profile" 필드에 파일 추가 (있는 경우)
    if (formData.profileImage) {
      submitData.append("profile", formData.profileImage);
    }

    try {
      console.log("회원가입 요청 객체 submitData", submitData);
      console.log("UserJoinRequest 데이터:", userJoinRequest);
      
      const response = await publicApi.post("/api/v1/signup", submitData);
      const responseData = response.data;
      
      console.log("회원가입 요청 결과 데이터 responseData", responseData);

      alert("회원가입이 완료되었습니다.");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("회원가입 오류:", error);
      
      const responseData = error.response?.data || {};
      const newErrors = {};

      if (responseData.errors) {
        Object.keys(responseData.errors).forEach((field) => {
          newErrors[field] = responseData.errors[field];
        });
      }

      if (responseData.field) {
        newErrors[responseData.field] = responseData.message;
      }

      if (responseData.message && !responseData.field) {
        newErrors.submit = responseData.message;
      }

      if (Object.keys(newErrors).length === 0) {
        newErrors.submit = getErrorMessage(error);
      }

      setErrors((prev) => ({ ...prev, ...newErrors }));
      setIsSubmitting(false);

      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField && firstErrorField !== "submit") {
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          errorElement.focus();
        }
      }
    }
  };

  return {
    // 상태
    formData,
    isPasswordVisible,
    isConfirmPasswordVisible,
    isSubmitting,
    previewImage,
    errors,
    bioCharCount,
    userIdCheckStatus,
    // Refs
    fileInputRef,
    previewImageRef,
    // 핸들러
    handleInputChange,
    validateField,
    handleTermsChange,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleRemoveImage,
    handleSubmit,
    checkUserIdAvailability,
  };
};
