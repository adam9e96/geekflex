import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@stores/authStore";
import { useUserStore } from "@stores/userStore";

export const useMyPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { currentUser, currentUserStatus, fetchCurrentUser, updateCurrentUser, verifyPassword } =
    useUserStore();
  const { loading: isLoading, error } = currentUserStatus;

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // 인증 상태 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/mypage");
    }
  }, [isAuthenticated, navigate]);

  // 사용자 데이터 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      const state = useUserStore.getState();
      if (state.clearErrors) state.clearErrors();
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  // 컴포넌트 언마운트 시 에러 초기화
  useEffect(() => {
    return () => {
      const state = useUserStore.getState();
      if (state.clearErrors) state.clearErrors();
    };
  }, []);

  // 소셜 로그인 여부 확인 및 초기화
  useEffect(() => {
    if (currentUser && !isCheckingPassword) {
      const isOAuthUser = currentUser.oauthProvider != null;
      if (isOAuthUser) {
        setIsPasswordVerified(true);
      }
      setIsCheckingPassword(true);
    }
  }, [currentUser, isCheckingPassword]);

  // 프로필 이미지가 변경되면 에러 상태 리셋
  useEffect(() => {
    setProfileImageError(false);
  }, [currentUser?.profileImage]);

  // 핸들러들
  const handleEditStart = useCallback(() => {
    if (isPasswordVerified) {
      setIsEditing(true);
    } else {
      setIsEditing(true);
      setIsPasswordVerified(false);
    }
  }, [isPasswordVerified]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setIsPasswordVerified(false);
  }, []);

  const handlePasswordVerified = useCallback(() => {
    setIsPasswordVerified(true);
  }, []);

  const handlePasswordVerificationCancel = useCallback(() => {
    navigate("/login?redirect=/mypage");
  }, [navigate]);

  const handleProfileImageError = useCallback(() => {
    setProfileImageError(true);
  }, []);

  // 프로필 수정 핸들러
  const handleSave = async (updateData) => {
    setIsSubmitting(true);
    try {
      const result = await updateCurrentUser(updateData);
      if (result) {
        setIsEditing(false);
        // authStore의 userProfile 업데이트
        useAuthStore.getState().setUserProfile({
          nickname: result.nickname,
          profileImage: result.profileImage,
        });
        alert("프로필이 성공적으로 수정되었습니다.");
      } else {
        const currentError = useUserStore.getState().currentUserStatus.error;
        alert(currentError || "프로필 수정 중 오류가 발생했습니다.");
      }
    } catch (err) {
      alert(err.message || "프로필 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentUser,
    isLoading,
    error,
    isEditing,
    isSubmitting,
    isPasswordVerified,
    profileImageError,
    isAuthenticated,
    fetchCurrentUser,
    verifyPassword,
    handleEditStart,
    handleCancel,
    handleSave,
    handlePasswordVerified,
    handlePasswordVerificationCancel,
    handleProfileImageError,
  };
};
