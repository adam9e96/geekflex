import React, { useState, useEffect, useCallback } from "react";
import { getProfileImageUrl } from "@utils/imageUtils";
import { getAccessToken } from "@utils/auth";
import "./styles/profile-popup.css";

/**
 * 프로필 팝업 컴포넌트
 *
 * 기능:
 * - 사용자 프로필 정보 표시
 * - 프로필 이미지, 닉네임, 간단한 통계 정보
 *
 * @param {boolean} isOpen - 팝업 열림 여부
 * @param {Function} onClose - 팝업 닫기 핸들러
 * @param {string} publicId - 사용자 publicId
 * @param {Object} initialData - 초기 데이터 (리뷰에서 가져온 기본 정보)
 */
const ProfilePopup = ({ isOpen, onClose, publicId, initialData = {} }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 프로필 데이터 가져오기
   *
   * ============================================
   * 백엔드 API 구현 필요
   * ============================================
   *
   * API 엔드포인트: GET /api/v1/users/{publicId}/profile
   *
   * 참고: 기존 API 패턴 확인
   * - GET /api/v1/users/me - 현재 로그인한 사용자 정보
   * - GET /api/v1/users/me/summary - 현재 로그인한 사용자 요약 정보
   * - GET /api/v1/users/{publicId}/profile - 특정 사용자 상세 프로필 (이 API)
   *
   * 요청 헤더:
   * - Content-Type: application/json
   * - Authorization: Bearer {accessToken} (선택사항, 로그인한 경우)
   *
   * 요청 파라미터:
   * - publicId (path parameter): 사용자 publicId
   *
   * 응답 상태 코드:
   * - 200: 성공
   * - 404: 사용자를 찾을 수 없음
   * - 500: 서버 오류
   *
   * 성공 응답 구조 (200):
   * {
   *   "publicId": "01KA3Y1MHDM203G1HGAP00DF6V",
   *   "nickname": "qwas12!@",
   *   "bio": "",                    // 자기소개 (빈 문자열 또는 null 가능)
   *   "joinedAt": "2025-11-15T23:17:29",  // 가입일
   *   "profileImage": "/uploads/users/.../image.jpg" 또는 null,
   *   "userReviewStats": {
   *     "totalReviews": 6,          // 작성한 리뷰 수
   *     "averageRating": 3.33333    // 평균 평점 (0.0 ~ 5.0)
   *   }
   * }
   *
   * 에러 응답 구조 (404):
   * {
   *   "error": "사용자를 찾을 수 없습니다.",
   *   "message": "User not found"
   * }
   */
  const fetchProfileData = useCallback(
    async (userId) => {
      setIsLoading(true);
      setError(null);

      try {
        // 실제 API 호출
        const accessToken = getAccessToken();
        const response = await fetch(`/api/v1/users/${userId}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("프로필 정보를 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error("프로필 데이터 로딩 실패:", err);
        setError(err.message || "프로필 정보를 불러오는데 실패했습니다.");

        // 에러 발생 시에도 초기 데이터로 표시
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

  // 팝업이 열릴 때 프로필 데이터 가져오기
  useEffect(() => {
    if (isOpen && publicId) {
      fetchProfileData(publicId);
    } else {
      // 팝업이 닫힐 때 초기화
      setProfileData(null);
      setError(null);
    }
  }, [isOpen, publicId, fetchProfileData]);

  // 팝업이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  const profileImageUrl = profileData?.profileImage
    ? getProfileImageUrl(profileData.profileImage)
    : null;

  // 가입일 포맷팅
  const formatJoinDate = (dateString) => {
    if (!dateString) return "알 수 없음";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="profile-popup-overlay" onClick={onClose}>
      <div className="profile-popup" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button className="profile-popup__close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {isLoading ? (
          <div className="profile-popup__loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>프로필 정보를 불러오는 중...</p>
          </div>
        ) : error && !profileData ? (
          <div className="profile-popup__error">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        ) : profileData ? (
          <>
            {/* 프로필 헤더 */}
            <div className="profile-popup__header">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={profileData.nickname}
                  className="profile-popup__avatar"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="profile-popup__avatar-placeholder"
                style={{ display: profileImageUrl ? "none" : "flex" }}
              >
                <i className="fas fa-user"></i>
              </div>
              <h3 className="profile-popup__nickname">{profileData.nickname}</h3>
              {profileData.bio && profileData.bio.trim() && (
                <p className="profile-popup__bio">{profileData.bio}</p>
              )}
            </div>

            {/* 통계 정보 */}
            <div className="profile-popup__stats">
              <div className="profile-popup__stat-item">
                <div className="profile-popup__stat-value">
                  {profileData.userReviewStats?.totalReviews || 0}
                </div>
                <div className="profile-popup__stat-label">리뷰</div>
              </div>
              <div className="profile-popup__stat-item">
                <div className="profile-popup__stat-value">
                  {profileData.userReviewStats?.averageRating
                    ? profileData.userReviewStats.averageRating.toFixed(1)
                    : "0.0"}
                </div>
                <div className="profile-popup__stat-label">평균 평점</div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="profile-popup__info">
              <div className="profile-popup__info-item">
                <i className="fas fa-calendar"></i>
                <span>가입일: {formatJoinDate(profileData.joinedAt)}</span>
              </div>
              <div className="profile-popup__info-item">
                <i className="fas fa-id-card"></i>
                <span>ID: {profileData.publicId}</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ProfilePopup;

