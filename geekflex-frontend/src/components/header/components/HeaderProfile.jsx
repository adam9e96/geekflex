import React from "react";
import { Link } from "react-router-dom";

/**
 * 헤더 우측 프로필 영역 컴포넌트
 * - 아바타 / 닉네임 표시 전용 (비즈니스 로직 없음)
 */
const HeaderProfile = ({
  nickname,
  profileImageUrl,
  hasProfileImage,
  onImageError,
}) => {
  return (
    <div className="flex items-center mr-2 geekflex-header__profile">
      <Link
        to="/mypage"
        className="flex gap-2 items-center px-1 py-1 rounded-md geekflex-header__profile-link"
      >
        {hasProfileImage ? (
          <img
            src={profileImageUrl}
            alt={`${nickname}의 프로필`}
            className="geekflex-header__profile-image"
            onError={onImageError}
          />
        ) : (
          <div className="flex justify-center items-center geekflex-header__profile-avatar">
            {nickname ? (
              <span className="font-semibold geekflex-header__profile-initial">
                {nickname[0]}
              </span>
            ) : (
              <i className="fas fa-user"></i>
            )}
          </div>
        )}

        {nickname && (
          <span className="text-sm font-medium geekflex-header__profile-nickname">
            {nickname}
          </span>
        )}
      </Link>
    </div>
  );
};

export default HeaderProfile;
