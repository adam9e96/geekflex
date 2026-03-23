import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "./HeaderProfile.module.css";

/**
 * 헤더 우측 프로필 영역 컴포넌트
 * - 아바타 / 닉네임 표시 전용 (비즈니스 로직 없음)
 * 2026.02.03 검토완료
 */
const HeaderProfile = ({ nickname, profileImageUrl, hasProfileImage, onImageError }) => {
  return (
    <div className={styles.profile}>
      <Link to="/mypage" className={styles.link}>
        {hasProfileImage ? (
          <img
            src={profileImageUrl}
            alt={`${nickname}의 프로필`}
            className={styles.image}
            onError={onImageError}
          />
        ) : (
          <div className={styles.avatar}>
            {nickname ? (
              <span className={styles.initial}>{nickname[0]}</span>
            ) : (
              <i className="fas fa-user"></i>
            )}
          </div>
        )}

        {nickname && <span className={styles.nickname}>{nickname}</span>}
      </Link>
    </div>
  );
};

HeaderProfile.propTypes = {
  nickname: PropTypes.string,
  profileImageUrl: PropTypes.string,
  hasProfileImage: PropTypes.bool,
  onImageError: PropTypes.func,
};

export default HeaderProfile;
