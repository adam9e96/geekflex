import { useState, useEffect, useRef } from "react";
import { getProfileImageUrl } from "@utils/imageUtils";
import { validateProfileForm, validateProfileImage } from "@utils/validationUtils";

export const useEditProfile = (userData, onSave) => {
  const [formData, setFormData] = useState({
    nickname: "",
    userEmail: "",
    bio: "",
    marketingAgreement: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const fileInputRef = useRef(null);
  const previewImageRef = useRef(null);

  const isOAuthUser = userData?.oauthProvider != null;

  // 초기 데이터 설정
  useEffect(() => {
    if (userData) {
      setTimeout(() => {
        setFormData({
          nickname: userData.nickname || "",
          userEmail: userData.userEmail || "",
          bio: userData.bio || "",
          marketingAgreement: userData.marketingAgreement || false,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        if (userData.profileImage) {
          const imageUrl = getProfileImageUrl(userData.profileImage);
          setPreviewImage(imageUrl);
        } else {
          setPreviewImage(null);
        }
      }, 0);
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      if (file) {
        const errorMsg = validateProfileImage(file);
        if (errorMsg) {
          setErrors((prev) => ({ ...prev, profileImage: errorMsg }));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.onerror = () =>
          setErrors((prev) => ({ ...prev, profileImage: "파일을 읽는 중 오류가 발생했습니다." }));
        reader.readAsDataURL(file);

        setFormData((prev) => ({ ...prev, profileImage: file }));
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.profileImage;
          return newErrors;
        });
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: null }));
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.profileImage;
      return newErrors;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationData = { ...formData };
    if (!showPasswordChange) {
      delete validationData.currentPassword;
      delete validationData.newPassword;
      delete validationData.confirmPassword;
    }

    const newErrors = validateProfileForm(validationData, isOAuthUser);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updateData = {
      nickname: formData.nickname.trim(),
      userEmail: formData.userEmail.trim(),
      bio: formData.bio?.trim() || "",
      marketingAgreement: formData.marketingAgreement,
      profileImage: formData.profileImage,
    };

    if (!isOAuthUser && formData.newPassword && formData.newPassword.trim().length > 0) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword.trim();
    }

    onSave(updateData);
  };

  const togglePasswordChange = () => {
    setShowPasswordChange(!showPasswordChange);
  };

  return {
    formData,
    previewImage,
    errors,
    showPasswordChange,
    fileInputRef,
    previewImageRef,
    isOAuthUser,
    handleInputChange,
    handleRemoveImage,
    handleSubmit,
    togglePasswordChange,
  };
};
