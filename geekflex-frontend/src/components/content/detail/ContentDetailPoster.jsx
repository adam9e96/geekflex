import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { getPosterUrl } from "@utils/content/movieUtils";
import { getAccessToken } from "@utils/auth";
import "./styles/ContentDetailPoster.css";

/**
 * 콘텐츠 상세 페이지 포스터 컴포넌트
 *
 * 입력: posterUrl (포스터 URL), title (콘텐츠 제목), isAuthenticated (로그인 상태), likeCount (좋아요 개수)
 * 처리: 포스터 URL을 처리하여 이미지를 표시하고, 에러 시 기본 이미지로 대체
 *       모든 사용자에게 찜하기 버튼 제공 (클릭은 로그인한 사용자만 가능)
 * 반환: 포스터 이미지와 찜하기 버튼이 포함된 JSX 요소
 */
const ContentDetailPoster = ({ posterUrl, title, isAuthenticated, likeCount = 0 }) => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 찜하기 상태 확인
   */
  const checkFavoriteStatus = useCallback(async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setIsFavorite(false);
        return;
      }

      // GET /api/v1/likes/{targetType}/{targetId}
      const response = await fetch(`/api/v1/likes/CONTENT/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setIsFavorite(data.data.liked || false);
        } else {
          setIsFavorite(false);
        }
      } else if (response.status === 404) {
        // 찜하기가 없으면 false
        setIsFavorite(false);
      } else {
        // 500 등 다른 에러의 경우에도 false로 설정 (백엔드 문제일 수 있음)
        console.warn("찜하기 상태 확인 실패:", response.status);
        setIsFavorite(false);
      }
    } catch (error) {
      console.error("찜하기 상태 확인 실패:", error);
      setIsFavorite(false);
    }
  }, [id]);

  // 찜하기 상태 확인 (로그인한 사용자만)
  useEffect(() => {
    if (isAuthenticated && id) {
      checkFavoriteStatus();
    } else {
      // 비로그인 사용자는 항상 false
      setIsFavorite(false);
    }
  }, [isAuthenticated, id, checkFavoriteStatus]);

  /**
   * 찜하기 토글
   */
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation(); // 이벤트 전파 방지

    if (!isAuthenticated) {
      // 비로그인 사용자에게는 로그인 필요 메시지 표시 (선택사항)
      // 또는 로그인 페이지로 리다이렉트
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return;
      }

      // 찜하기 토글 (추가/제거 모두 POST)
      // POST /api/v1/likes/{targetType}/{targetId}
      const response = await fetch(`/api/v1/likes/CONTENT/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // 응답의 liked 상태에 따라 업데이트
        if (data.success && data.data) {
          setIsFavorite(data.data.liked || false);
        } else {
          // 응답 형식이 다를 경우 기존 토글 방식 사용
          setIsFavorite(!isFavorite);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("찜하기 처리 실패:", errorData.message || errorData.error);
      }
    } catch (error) {
      console.error("찜하기 처리 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-detail__poster sticky top-8  ">
      <div className="content-detail__poster-wrapper">
        <img
          src={getPosterUrl(posterUrl)}
          alt={title}
          onError={(e) => {
            // 무한 루프 방지: onError를 null로 설정
            e.target.onerror = null;
            // 로컬 SVG 데이터 URL 사용 (네트워크 오류 방지)
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750'%3E%3Crect fill='%23ddd' width='500' height='750'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
          }}
        />
        {/* 찜하기 버튼 - 모든 사용자에게 표시 (클릭은 로그인한 사용자만 가능) */}
        <button
          className={`content-detail__favorite-btn ${isFavorite ? "content-detail__favorite-btn--active" : ""} ${!isAuthenticated ? "content-detail__favorite-btn--disabled" : ""}`}
          onClick={handleFavoriteToggle}
          disabled={isLoading || !isAuthenticated}
          aria-label={isAuthenticated ? (isFavorite ? "찜하기 해제" : "찜하기") : "로그인이 필요합니다"}
          title={isAuthenticated ? (isFavorite ? "찜하기 해제" : "찜하기") : "로그인이 필요합니다"}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
          {likeCount !== undefined && likeCount !== null && (
            <span className="content-detail__favorite-count">{likeCount.toLocaleString()}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContentDetailPoster;
