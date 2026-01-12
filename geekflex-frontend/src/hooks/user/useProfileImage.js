import { useState, useMemo, useEffect } from "react";
import { getProfileImageUrl } from "@utils/imageUtils";

/**
 * 프로필 이미지 관리 커스텀 훅
 * 
 * @param {string|null} profileImagePath - 프로필 이미지 경로
 * @returns {Object} { profileImageUrl, hasProfileImage, setImageError }
 *   - profileImageUrl: 완전한 프로필 이미지 URL 또는 null
 *   - hasProfileImage: 프로필 이미지가 있는지 여부
 *   - setImageError: 이미지 로딩 에러 발생 시 호출할 함수
 */
export const useProfileImage = (profileImagePath) => {
  const [imageError, setImageError] = useState(false);

  // profileImagePath가 변경되면 에러 상태 초기화
  useEffect(() => {
    setImageError(false);
  }, [profileImagePath]);

  // 프로필 이미지 URL 생성
  const profileImageUrl = useMemo(() => {
    if (!profileImagePath || imageError) {
      return null;
    }
    return getProfileImageUrl(profileImagePath);
  }, [profileImagePath, imageError]);

  // 프로필 이미지 존재 여부 확인
  const hasProfileImage = useMemo(() => {
    return !!profileImagePath && !imageError && !!profileImageUrl;
  }, [profileImagePath, imageError, profileImageUrl]);

  return {
    profileImageUrl,
    hasProfileImage,
    setImageError,
  };
};
