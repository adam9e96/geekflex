import { useMemo, useState } from "react";
import { getProfileImageUrl } from "@utils/imageUtils";

/**
 * 프로필 이미지 관리 커스텀 훅
 *
 * @param {string|null} profileImagePath - 프로필 이미지 경로
 * @returns {Object} { profileImageUrl, hasProfileImage, setImageError }
 *   - profileImageUrl: 완전한 프로필 이미지 URL 또는 null
 *   - hasProfileImage: 프로필 이미지가 있는지 여부
 *   - setImageError: 이미지 로딩 에러 발생 시 호출할 함수
 * 2026.02.03 검토완료
 */
export const useProfileImage = (profileImagePath) => {
  // profileImagePath 변경 감지를 위한 이전 값 저장
  const [prevProfileImagePath, setPrevProfileImagePath] = useState(profileImagePath);
  const [imageError, setImageError] = useState(false);

  // Prop이 변경되면 렌더링 도중에 상태를 업데이트 (Cascading Render 방지)
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (profileImagePath !== prevProfileImagePath) {
    setPrevProfileImagePath(profileImagePath);
    setImageError(false);
  }

  // 프로필 이미지 URL 생성
  const profileImageUrl = useMemo(() => {
    if (!profileImagePath || imageError) {
      return null;
    }
    return getProfileImageUrl(profileImagePath);
  }, [profileImagePath, imageError]);

  // 프로필 이미지 존재 여부 확인
  const hasProfileImage = useMemo(() => {
    return !!profileImageUrl;
  }, [profileImageUrl]);

  return {
    profileImageUrl,
    hasProfileImage,
    setImageError,
  };
};
