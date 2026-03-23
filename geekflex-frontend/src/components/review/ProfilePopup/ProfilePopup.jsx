import React, { useState, useEffect, useCallback } from "react";
import { FaTimes, FaSpinner, FaUser, FaCalendar, FaIdCard } from "react-icons/fa";
import { getProfileImageUrl } from "@utils/imageUtils";
import { getUserProfile } from "@services/userService";
import { useProfileStore } from "@stores/profileStore";
import styles from "./ProfilePopup.module.css";

/**
 * 프로필 팝업 컴포넌트
 * @reviewed 2026-01-23 - 검토 완료
 */
const ProfilePopup = () => {
  const {
    isOpen,
    userPublicId: publicId,
    userData: initialData,
    closeProfilePopup: onClose,
  } = useProfileStore();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfileData = useCallback(
    async (userId) => {
      setIsLoading(true);

      try {
        const data = await getUserProfile(userId);
        setProfileData(data);
      } catch (err) {
        console.error("프로필 데이터 로딩 실패:", err);

        // 에러 시 초기 데이터 폴백
        setProfileData({
          publicId: publicId,
          nickname: initialData.nickname || "사용자",
          profileImage: initialData.profileImage || null,
          bio: "",
          joinedAt: null,
          userReviewStats: {
            totalReviews: 0,
            averageRating: 0,
          },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [publicId, initialData],
  );

  useEffect(() => {
    if (isOpen && publicId) {
      fetchProfileData(publicId);
    } else {
      setProfileData(null);
      // setError(null); removal
    }
  }, [isOpen, publicId, fetchProfileData]);

  if (!isOpen) return null;

  const profileImageUrl = profileData?.profileImage
    ? getProfileImageUrl(profileData.profileImage)
    : null;

  const formatJoinDate = (dateString) => {
    if (!dateString) return "알 수 없음";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>

        {isLoading ? (
          <div className={styles.loading}>
            <FaSpinner className="animate-spin" />
            <p>정보 로딩 중...</p>
          </div>
        ) : (
          profileData && (
            <>
              <div className={styles.header}>
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={profileData.nickname}
                    className={styles.avatar}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}

                <div
                  className={styles.avatarPlaceholder}
                  style={{ display: profileImageUrl ? "none" : "flex" }}
                >
                  <FaUser />
                </div>

                <h3 className={styles.nickname}>{profileData.nickname}</h3>
                {profileData.bio && <p className={styles.bio}>{profileData.bio}</p>}
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {profileData.userReviewStats?.totalReviews || 0}
                  </div>
                  <div className={styles.statLabel}>리뷰</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {profileData.userReviewStats?.averageRating?.toFixed(1) || "0.0"}
                  </div>
                  <div className={styles.statLabel}>평균 평점</div>
                </div>
              </div>

              <div className={styles.info}>
                <div className={styles.infoItem}>
                  <FaCalendar />
                  <span>가입일: {formatJoinDate(profileData.joinedAt)}</span>
                </div>
                <div className={styles.infoItem}>
                  <FaIdCard />
                  <span>ID: {profileData.publicId}</span>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default ProfilePopup;
