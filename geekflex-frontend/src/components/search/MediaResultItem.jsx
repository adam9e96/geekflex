import React from "react";
import PropTypes from "prop-types";
import { FaStar } from "react-icons/fa6";
import styles from "./styles/SearchModal.module.css";

/**
 * 영화/드라마 검색 결과 아이템
 */
const MediaResultItem = ({ result, isActive, onClick }) => {
  return (
    <div
      className={`${styles.resultItem} ${isActive ? styles.resultItemActive : ""}`}
      onClick={() => onClick(result)}
    >
      <div className={styles.resultContent}>
        {result.poster && (
          <div className={styles.resultPoster}>
            <img src={result.poster} alt={result.title} />
          </div>
        )}
        <div className={styles.resultInfo}>
          <div className={styles.resultTitle}>{result.title}</div>
          <div className={styles.resultMeta}>
            {result.rating && (
              <div className={styles.resultRating}>
                <FaStar />
                <span>{result.rating}</span>
              </div>
            )}
            {result.year && <div className={styles.resultYear}>{result.year}</div>}
          </div>
          {result.overview && <div className={styles.resultOverview}>{result.overview}</div>}
          {result.genres && result.genres.length > 0 && (
            <div className={styles.resultGenres}>
              {result.genres.map((genre, idx) => (
                <span key={idx} className={styles.genreTag}>
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

MediaResultItem.propTypes = {
  result: PropTypes.shape({
    title: PropTypes.string,
    poster: PropTypes.string,
    rating: PropTypes.string,
    year: PropTypes.number,
    overview: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default MediaResultItem;
