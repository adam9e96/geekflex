import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { getPosterUrl } from "@utils/content/movieUtils";

/**
 * 영화 카드 컴포넌트
 * @param {Object} movie - 영화 데이터 객체
 * @param {number} movie.id - 영화 DB ID
 * @param {number} movie.tmdbId - TMDB 영화 ID (상세 페이지 이동용)
 * @param {string} movie.title - 영화 제목
 * @param {string} movie.overview - 영화 줄거리
 * @param {string} movie.posterUrl - 포스터 이미지 URL
 * @param {number} movie.voteAverage - 평균 평점
 * @param {string} movie.releaseDate - 개봉일
 */
const MovieCard = memo(({ movie }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // 터치/드래그 중에는 클릭 이벤트 무시
    if (e.defaultPrevented) return;
    
    // tmdbId를 사용하여 상세 페이지로 이동
    if (movie.tmdbId) {
      // contentType에 따라 다른 경로로 이동
      // TV면 /tv/{tmdbId}, MOVIE면 /movie/{tmdbId}
      const contentType = movie.contentType;
      if (contentType === "TV" || contentType === "tv") {
        navigate(`/tv/${movie.tmdbId}`);
      } else {
        // 기본값은 영화로 처리
        navigate(`/movie/${movie.tmdbId}`);
      }
    }
  };

  return (
    <div 
      className="home-movie-card" 
      onClick={handleClick} 
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e);
        }
      }}
    >
      <div className="home-movie-card__poster">
        <img
          src={getPosterUrl(movie.posterPath || movie.posterUrl)}
          alt={movie.title}
          onError={(e) => {
            // 무한 루프 방지: onError를 null로 설정
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
          }}
          draggable="false"
        />
        <div className="home-movie-card__overlay">
          <div className="home-movie-card__rating">
            <i className="fas fa-star"></i>
            <span>{movie.voteAverage?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
      </div>
      <div className="home-movie-card__info">
        <h3 className="home-movie-card__title">{movie.title}</h3>
        <p className="home-movie-card__overview">
          {movie.overview || "줄거리 정보가 없습니다."}
        </p>
        {movie.releaseDate && (
          <div className="home-movie-card__release-date">
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
          </div>
        )}
      </div>
    </div>
  );
});

MovieCard.displayName = "MovieCard";

export default MovieCard;

