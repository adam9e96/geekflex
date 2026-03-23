import { memo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { getPosterUrl } from "@utils/content/movieUtils";
import styles from "./ContentCard.module.css";

/**
 * 콘텐츠(영화/TV) 카드 컴포넌트
 * 영화와 TV 프로그램 데이터를 모두 표시할 수 있습니다.
 */
const ContentCard = memo(({ content }) => {
  const navigate = useNavigate();

  // 데이터 정규화: 영화와 TV의 속성 차이 처리
  const {
    id,
    tmdbId,
    title,
    name, // TV용
    overview,
    posterPath,
    posterUrl,
    voteAverage,
    releaseDate, // 영화용
    firstAirDate, // TV용
    contentType, // "MOVIE" or "TV"
  } = content;

  // 표시할 제목 (영화: title, TV: name)
  const displayTitle = title || name || "제목 없음";

  // 표시할 날짜 (영화: releaseDate, TV: firstAirDate)
  const displayDate = releaseDate || firstAirDate;
  const releaseYear = displayDate ? new Date(displayDate).getFullYear() : null;

  // 포스터 이미지 URL
  const posterImage = getPosterUrl(posterPath || posterUrl);

  const handleClick = (e) => {
    // 터치/드래그 중에는 클릭 이벤트 무시
    if (e.defaultPrevented) return;

    // tmdbId가 없으면 id 사용 (fallback)
    const targetId = tmdbId || id;

    if (targetId) {
      const type = contentType?.toUpperCase() || (name ? "TV" : "MOVIE");

      if (type === "TV") {
        navigate(`/tv/${targetId}`);
      } else {
        navigate(`/movie/${targetId}`);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick(e);
    }
  };

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${displayTitle} 상세 페이지로 이동`}
    >
      <div className={styles.poster}>
        <img
          src={posterImage}
          alt={displayTitle}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
          }}
          loading="lazy"
          draggable="false"
        />
        <div className={styles.overlay}>
          <div className={styles.rating}>
            <i className="fas fa-star"></i>
            <span>{voteAverage ? voteAverage.toFixed(1) : "N/A"}</span>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{displayTitle}</h3>
        <p className={styles.overview}>{overview || "줄거리 정보가 없습니다."}</p>

        {releaseYear && (
          <div className={styles.releaseDate}>
            <i className="fas fa-calendar-alt"></i>
            <span>{releaseYear}</span>
          </div>
        )}
      </div>
    </div>
  );
});

ContentCard.displayName = "ContentCard";

ContentCard.propTypes = {
  content: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tmdbId: PropTypes.number,
    title: PropTypes.string,
    name: PropTypes.string,
    overview: PropTypes.string,
    posterPath: PropTypes.string,
    posterUrl: PropTypes.string,
    voteAverage: PropTypes.number,
    releaseDate: PropTypes.string,
    firstAirDate: PropTypes.string,
    contentType: PropTypes.string,
  }).isRequired,
};

export default ContentCard;
