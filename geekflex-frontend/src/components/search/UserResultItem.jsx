import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa6";
import { getProfileImageUrl } from "@utils/imageUtils";
import styles from "./styles/SearchModal.module.css";

/**
 * 유저 검색 결과 아이템
 */
const UserResultItem = ({ user, isActive, onClick }) => {
  const profileImageUrl = user.profileImage ? getProfileImageUrl(user.profileImage) : null;

  return (
    <Link
      to={`/user/${user.publicId}`}
      className={`${styles.userItem} ${isActive ? styles.resultItemActive : ""}`}
      onClick={onClick}
    >
      <div className={styles.userContent}>
        {profileImageUrl ? (
          <div className={styles.userAvatar}>
            <img
              src={profileImageUrl}
              alt={user.nickname}
              onError={(e) => {
                const img = e.target;
                const placeholder = img.nextElementSibling;
                if (img && placeholder) {
                  img.style.display = "none";
                  placeholder.style.display = "flex";
                }
              }}
            />
            <div className={styles.userAvatarPlaceholder} style={{ display: "none" }}>
              <FaUser />
            </div>
          </div>
        ) : (
          <div className={styles.userAvatar}>
            <div className={styles.userAvatarPlaceholder}>
              {user.nickname ? (
                <span className={styles.userInitial}>{user.nickname.charAt(0).toUpperCase()}</span>
              ) : (
                <FaUser />
              )}
            </div>
          </div>
        )}
        <div className={styles.userInfo}>
          <div className={styles.userNickname}>{user.nickname}</div>
          {user.activityScore !== undefined && (
            <div className={styles.userMeta}>
              <span className={styles.userScore}>활동 점수: {user.activityScore}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

UserResultItem.propTypes = {
  user: PropTypes.shape({
    publicId: PropTypes.string,
    nickname: PropTypes.string,
    profileImage: PropTypes.string,
    activityScore: PropTypes.number,
  }).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default UserResultItem;
