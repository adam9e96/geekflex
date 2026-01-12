import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@stores/authStore";
import { useUserStore } from "@stores/userStore";
import MyReviewsSection from "@components/mypage/MyReviewsSection";
import EditProfileForm from "@components/mypage/EditProfileForm";
import PasswordVerification from "@components/mypage/PasswordVerification";
import { getProfileImageUrl } from "@utils/imageUtils";
import { formatDate, formatDateTime } from "@utils/user/myPageUtils";
import "@styles/my-page/my-page.css";

/**
 * 마이페이지 컴포넌트
 * 로그인한 사용자의 정보를 표시합니다
 */
const MyPage = () => {
  const navigate = useNavigate();
  // Zustand 스토어에서 필요한 상태와 함수만 선택적으로 구독
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { currentUser, isLoading, error, fetchCurrentUser, updateCurrentUser, verifyPassword } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // 인증 상태 확인
  useEffect(() => {
    if (!isAuthenticated) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      navigate("/login?redirect=/mypage");
    }
  }, [isAuthenticated, navigate]);

  // 사용자 데이터 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      // 에러 초기화 후 데이터 가져오기
      useUserStore.getState().error = null;
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  // 컴포넌트 언마운트 시 에러 초기화
  useEffect(() => {
    return () => {
      useUserStore.getState().error = null;
    };
  }, []);

  // 사용자 데이터가 로드되면 소셜 로그인 여부 확인
  useEffect(() => {
    if (currentUser && !isCheckingPassword) {
      // 소셜 로그인 사용자는 비밀번호 확인 없이 바로 접근 가능
      const isOAuthUser = currentUser.oauthProvider != null;
      if (isOAuthUser) {
        setIsPasswordVerified(true);
      }
      setIsCheckingPassword(true);
    }
  }, [currentUser, isCheckingPassword]);

  // 프로필 이미지 URL 처리
  const profileImageUrl = currentUser?.profileImage
    ? getProfileImageUrl(currentUser.profileImage)
    : null;

  // 프로필 이미지가 변경되면 에러 상태 리셋
  useEffect(() => {
    setProfileImageError(false);
  }, [currentUser?.profileImage]);

  // 프로필 이미지가 있고 에러가 없을 때만 이미지 표시
  const hasProfileImage = profileImageUrl && !profileImageError;

  // 로딩 중이거나 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="my-page-container">
        <div className="my-page-loading">
          <div className="spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className="my-page-container">
        <div className="my-page-error">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={fetchCurrentUser} className="retry-btn">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터 로딩 중
  if (isLoading || !currentUser) {
    return (
      <div className="my-page-container">
        <div className="my-page-loading">
          <div className="spinner"></div>
          <p>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 프로필 수정 핸들러
  const handleSave = async (updateData) => {
    setIsSubmitting(true);
    try {
      const result = await updateCurrentUser(updateData);
      if (result) {
        setIsEditing(false);
        // authStore의 userProfile도 업데이트 (동기화)
        useAuthStore.getState().setUserProfile({
          nickname: result.nickname,
          profileImage: result.profileImage,
        });
        alert("프로필이 성공적으로 수정되었습니다.");
      } else {
        // updateCurrentUser가 null을 반환하면 error 상태에 메시지가 있음
        const currentError = useUserStore.getState().error;
        alert(currentError || "프로필 수정 중 오류가 발생했습니다.");
      }
    } catch (err) {
      alert(err.message || "프로필 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수정 취소 핸들러
  const handleCancel = () => {
    setIsEditing(false);
    setIsPasswordVerified(false);
  };

  // 프로필 수정 시작 핸들러
  const handleEditStart = () => {
    // 이미 비밀번호 확인이 완료된 경우 바로 수정 폼으로
    if (isPasswordVerified) {
      setIsEditing(true);
    } else {
      // 비밀번호 확인이 필요한 경우
      setIsEditing(true);
      setIsPasswordVerified(false);
    }
  };

  // 비밀번호 확인 성공 핸들러
  const handlePasswordVerified = () => {
    setIsPasswordVerified(true);
  };

  // 비밀번호 확인 취소 핸들러 (마이페이지 접근 시)
  const handlePasswordVerificationCancel = () => {
    // 비밀번호 확인 취소 시 로그인 페이지로 리다이렉트
    navigate("/login?redirect=/mypage");
  };

  // 마이페이지 접근 시 비밀번호 확인이 필요한지 체크
  const needsPasswordVerification = currentUser && !currentUser.oauthProvider && !isPasswordVerified;

  return (
    <div className="my-page-container">
      <div className="my-page-card">
        {/* 마이페이지 헤더 */}
        <div className="my-page-header">
          <h1 className="my-page-title">내 정보</h1>
          <p className="my-page-subtitle">프로필 및 계정 정보를 확인하세요</p>
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
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={handleEditStart}>
                <i className="fas fa-edit"></i> 프로필 수정
              </button>
            </div>
            {/* 프로필 섹션 */}
            <div className="profile-image-section">
              <div className="profile-image-wrapper">
                {hasProfileImage ? (
                  <img
                    src={profileImageUrl}
                    alt="프로필 이미지"
                    className="profile-image"
                    onError={() => {
                      setProfileImageError(true);
                    }}
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              <h2 className="profile-nickname">{currentUser.nickname || currentUser.userId}</h2>
              {currentUser.bio && <p className="profile-bio">{currentUser.bio}</p>}
            </div>
            <div className="info-sections">
              {/* 기본 정보 섹션 */}
              <div className="info-section">
                <h3 className="section-title">
                  <i className="fas fa-user-circle"></i>
                  기본 정보
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">사용자 ID</span>
                    <span className="info-value">{currentUser.userId}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">닉네임</span>
                    <span className="info-value">{currentUser.nickname || "-"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">이메일</span>
                    <span className="info-value">{currentUser.userEmail || "-"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">생년월일</span>
                    <span className="info-value">
                      {currentUser.birthDate ? formatDate(currentUser.birthDate) : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 계정 정보 섹션 */}
              <div className="info-section">
                <h3 className="section-title">
                  <i className="fas fa-cog"></i>
                  계정 정보
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Public ID</span>
                    <span className="info-value code">{currentUser.publicId}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">역할</span>
                    <span className="info-value">
                      <span className="role-badge">{currentUser.role || "USER"}</span>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">활동 점수</span>
                    <span className="info-value">
                      <span className="activity-score">{currentUser.activityScore || 0}</span>
                    </span>
                  </div>
                  {currentUser.oauthProvider && (
                    <div className="info-item">
                      <span className="info-label">소셜 로그인</span>
                      <span className="info-value">
                        <span className="oauth-badge">{currentUser.oauthProvider}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 약관 동의 정보 섹션 */}
              <div className="info-section">
                <h3 className="section-title">
                  <i className="fas fa-check-circle"></i>
                  약관 동의
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">이용약관 동의</span>
                    <span className="info-value">
                      {currentUser.termsAgreement ? (
                        <span className="agreement-badge agreed">
                          <i className="fas fa-check"></i> 동의함
                        </span>
                      ) : (
                        <span className="agreement-badge not-agreed">
                          <i className="fas fa-times"></i> 미동의
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">마케팅 동의</span>
                    <span className="info-value">
                      {currentUser.marketingAgreement ? (
                        <span className="agreement-badge agreed">
                          <i className="fas fa-check"></i> 동의함
                        </span>
                      ) : (
                        <span className="agreement-badge not-agreed">
                          <i className="fas fa-times"></i> 미동의
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 가입 정보 섹션 */}
              <div className="info-section">
                <h3 className="section-title">
                  <i className="fas fa-clock"></i>
                  가입 정보
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">가입일</span>
                    <span className="info-value">{formatDateTime(currentUser.joinedAt)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">최종 수정일</span>
                    <span className="info-value">{formatDateTime(currentUser.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <MyReviewsSection />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyPage;

