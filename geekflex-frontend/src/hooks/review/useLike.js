import { useState, useCallback, useRef } from "react";
import { getAccessToken } from "@utils/auth";

/**
 * 리뷰 좋아요 기능 관리 커스텀 훅
 * 
 * @param {boolean} isLoggedIn - 로그인 여부
 * @param {number} contentId - 콘텐츠 ID (선택사항)
 * @returns {Object} 좋아요 관련 상태 및 함수들
 */
export const useLike = (isLoggedIn, contentId) => {
  // 좋아요한 리뷰 ID Set
  const [likedReviews, setLikedReviews] = useState(new Set());
  
  // 처리 중인 리뷰 ID Set (중복 요청 방지)
  const [processingLikes, setProcessingLikes] = useState(new Set());
  
  // 좋아요 상태 확인 요청 중인지 여부
  const checkingStatusRef = useRef(false);

  /**
   * 리뷰 배열에서 좋아요 정보 초기화
   * @param {Array} reviews - 리뷰 배열
   */
  const initializeLikesFromReviews = useCallback((reviews) => {
    if (!Array.isArray(reviews)) return;
    
    // 리뷰 데이터에서 좋아요 개수 정보는 유지하되,
    // 사용자가 좋아요한 상태는 초기화 (나중에 checkLikesStatus로 확인)
    setLikedReviews(new Set());
  }, []);

  /**
   * 여러 리뷰의 좋아요 상태 확인
   * @param {Array<number>} reviewIds - 확인할 리뷰 ID 배열
   */
  const checkLikesStatus = useCallback(async (reviewIds) => {
    if (!isLoggedIn || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return;
    }

    // 이미 확인 중이면 중복 요청 방지
    if (checkingStatusRef.current) {
      return;
    }

    checkingStatusRef.current = true;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return;
      }

      // 여러 리뷰의 좋아요 상태를 한 번에 확인
      // API: GET /api/v1/likes/REVIEW?reviewIds=1,2,3
      const reviewIdsParam = reviewIds.join(",");
      const response = await fetch(
        `/api/v1/likes/REVIEW?reviewIds=${reviewIdsParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // 응답 형식에 따라 처리
        // 예: { likedReviewIds: [1, 2, 3] } 또는 { data: [1, 2, 3] }
        const likedIds = data.likedReviewIds || data.data || data || [];
        
        if (Array.isArray(likedIds)) {
          setLikedReviews(new Set(likedIds));
        } else if (typeof likedIds === "object") {
          // 객체 형식인 경우 (예: { 1: true, 2: false })
          const likedSet = new Set();
          Object.keys(likedIds).forEach((id) => {
            if (likedIds[id]) {
              likedSet.add(Number(id));
            }
          });
          setLikedReviews(likedSet);
        }
      } else if (response.status === 401 || response.status === 403) {
        // 인증 오류 시 좋아요 상태 초기화
        setLikedReviews(new Set());
      }
    } catch (error) {
      console.error("좋아요 상태 확인 실패:", error);
      // 에러 발생 시에도 기존 상태 유지
    } finally {
      checkingStatusRef.current = false;
    }
  }, [isLoggedIn]);

  /**
   * 리뷰 좋아요 토글
   * @param {number} reviewId - 리뷰 ID
   */
  const handleLikeToggle = useCallback(async (reviewId) => {
    if (!isLoggedIn) {
      // 비로그인 사용자는 로그인 페이지로 이동하거나 메시지 표시
      return;
    }

    // 이미 처리 중이면 무시
    if (processingLikes.has(reviewId)) {
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      return;
    }

    // 처리 중 상태 추가
    setProcessingLikes((prev) => new Set(prev).add(reviewId));

    // 현재 좋아요 상태 확인
    const isLiked = likedReviews.has(reviewId);

    try {
      // 좋아요 토글 API 호출
      // POST /api/v1/likes/REVIEW/{reviewId}
      const response = await fetch(`/api/v1/likes/REVIEW/${reviewId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        // 성공 시 좋아요 상태 업데이트
        setLikedReviews((prev) => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.delete(reviewId);
          } else {
            newSet.add(reviewId);
          }
          return newSet;
        });
      } else if (response.status === 401 || response.status === 403) {
        // 인증 오류 시 좋아요 상태 초기화
        setLikedReviews((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
      } else {
        // 다른 오류 발생 시 기존 상태 유지
        console.error("좋아요 토글 실패:", response.status);
      }
    } catch (error) {
      console.error("좋아요 토글 오류:", error);
      // 에러 발생 시 기존 상태 유지
    } finally {
      // 처리 중 상태 제거
      setProcessingLikes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  }, [isLoggedIn, likedReviews, processingLikes]);

  return {
    likedReviews,
    processingLikes,
    checkLikesStatus,
    handleLikeToggle,
    initializeLikesFromReviews,
  };
};
