import React from "react";
import MyReviewsSection from "@components/mypage/MyReviewsSection/MyReviewsSection";
import EditProfileForm from "@components/mypage/EditProfileForm/EditProfileForm";
import PasswordVerification from "@components/mypage/PasswordVerification/PasswordVerification";
import InfoSection from "@components/mypage/InfoSection/InfoSection";
import InfoItem from "@components/mypage/InfoItem/InfoItem";
import { getProfileImageUrl } from "@utils/imageUtils";
import { formatDate, formatDateTime } from "@utils/user/myPageUtils";
import styles from "./MyPage.module.css";
import { useMyPage } from "@hooks/useMyPage";

/**
 * 마이페이지 컴포넌트
 * 로그인한 사용자의 정보를 표시합니다
 */
const MyPage = () => {
  const {
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
  } = useMyPage();

  // 프로필 이미지 URL 처리
  const profileImageUrl = currentUser?.profileImage
    ? getProfileImageUrl(currentUser.profileImage)
    : null;

  // 프로필 이미지가 있고 에러가 없을 때만 이미지 표시
  const hasProfileImage = profileImageUrl && !profileImageError;

  // 로딩 중이거나 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={fetchCurrentUser} className={styles.retryBtn}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터 로딩 중
  if (isLoading || !currentUser) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 마이페이지 접근 시 비밀번호 확인이 필요한지 체크
  const needsPasswordVerification =
    currentUser && !currentUser.oauthProvider && !isPasswordVerified;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* 마이페이지 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.title}>내 정보</h1>
          <p className={styles.subtitle}>프로필 및 계정 정보를 확인하세요</p>
        </div>

        {/* 마이페이지 접근 시 비밀번호 확인이 필요한 경우 */}
        {needsPasswordVerification ? (
          <PasswordVerification
            userData={currentUser}
            onVerify={handlePasswordVerified}
            onCancel={handlePasswordVerificationCancel}
            verifyPassword={verifyPassword}
          />
        ) : isEditing ? (
          // 프로필 수정 모드
          <EditProfileForm
            userData={currentUser}
            onSave={handleSave}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        ) : (
          // 일반 마이페이지 보기 모드
          <>
            <div className={styles.profileActions}>
              <button className={styles.editProfileBtn} onClick={handleEditStart}>
                <i className="fas fa-edit"></i> 프로필 수정
              </button>
            </div>
            {/* 프로필 섹션 */}
            <div className={styles.profileSection}>
              <div className={styles.profileImageWrapper}>
                {hasProfileImage ? (
                  <img
                    src={profileImageUrl}
                    alt="프로필 이미지"
                    className={styles.profileImage}
                    onError={handleProfileImageError}
                  />
                ) : (
                  <div className={styles.profilePlaceholder}>
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              <h2 className={styles.nickname}>{currentUser.nickname || currentUser.userId}</h2>
              {currentUser.bio && <p className={styles.bio}>{currentUser.bio}</p>}
            </div>
            <div className={styles.sections}>
              {/* 기본 정보 섹션 */}
              <InfoSection title="기본 정보" icon="fas fa-user-circle">
                <InfoItem label="사용자 ID">{currentUser.userId}</InfoItem>
                <InfoItem label="닉네임">{currentUser.nickname || "-"}</InfoItem>
                <InfoItem label="이메일">{currentUser.userEmail || "-"}</InfoItem>
                <InfoItem label="생년월일">
                  {currentUser.birthDate ? formatDate(currentUser.birthDate) : "-"}
                </InfoItem>
              </InfoSection>

              {/* 계정 정보 섹션 */}
              <InfoSection title="계정 정보" icon="fas fa-cog">
                <InfoItem label="Public ID" code>
                  {currentUser.publicId}
                </InfoItem>
                <InfoItem label="역할">
                  <span className={styles.roleBadge}>{currentUser.role || "USER"}</span>
                </InfoItem>
                <InfoItem label="활동 점수">
                  <span className={styles.activityScore}>{currentUser.activityScore || 0}</span>
                </InfoItem>
                {currentUser.oauthProvider && (
                  <InfoItem label="소셜 로그인">
                    <span className={styles.oauthBadge}>{currentUser.oauthProvider}</span>
                  </InfoItem>
                )}
              </InfoSection>

              {/* 약관 동의 정보 섹션 */}
              <InfoSection title="약관 동의" icon="fas fa-check-circle">
                <InfoItem label="이용약관 동의">
                  {currentUser.termsAgreement ? (
                    <span className={`${styles.agreementBadge} ${styles.agreed}`}>
                      <i className="fas fa-check"></i> 동의함
                    </span>
                  ) : (
                    <span className={`${styles.agreementBadge} ${styles.notAgreed}`}>
                      <i className="fas fa-times"></i> 미동의
                    </span>
                  )}
                </InfoItem>
                <InfoItem label="마케팅 동의">
                  {currentUser.marketingAgreement ? (
                    <span className={`${styles.agreementBadge} ${styles.agreed}`}>
                      <i className="fas fa-check"></i> 동의함
                    </span>
                  ) : (
                    <span className={`${styles.agreementBadge} ${styles.notAgreed}`}>
                      <i className="fas fa-times"></i> 미동의
                    </span>
                  )}
                </InfoItem>
              </InfoSection>

              {/* 가입 정보 섹션 */}
              <InfoSection title="가입 정보" icon="fas fa-clock">
                <InfoItem label="가입일">{formatDateTime(currentUser.joinedAt)}</InfoItem>
                <InfoItem label="최종 수정일">{formatDateTime(currentUser.updatedAt)}</InfoItem>
              </InfoSection>

              <MyReviewsSection />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyPage;
