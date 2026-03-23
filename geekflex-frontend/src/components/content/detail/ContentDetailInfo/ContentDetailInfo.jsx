import React from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import RatingModal from "@components/review/RatingModal/RatingModal";
import { useReviewStore } from "@stores/reviewStore";
import ContentOverview from "@components/content/detail/ContentOverview/ContentOverview";
import styles from "./ContentDetailInfo.module.css";

/**
 * 콘텐츠 상세 페이지 정보 섹션 컴포넌트
 */
const ContentDetailInfo = ({ content, contentType = "movie", genres, likeCount }) => {
  const { id } = useParams();
  const { openRatingModal } = useReviewStore();

  const dbId = content.contentId || content.id || content.content_id;
  const rating = content.voteAverage || content.vote_average;
  const date = content.releaseDate || content.release_date;
  const votes = content.voteCount || content.vote_count;

  return (
    <div className={styles.container}>
      {/* 메타 정보 */}
      <div className={styles.meta}>
        {rating && (
          <div className={styles.rating}>
            <i className="fas fa-star"></i>
            <span>{rating.toFixed(1)}</span>
            {votes && <span className={styles.voteCount}>({votes.toLocaleString()})</span>}
          </div>
        )}
        {date && (
          <div className={styles.releaseDate}>
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date(date).toLocaleDateString("ko-KR")}</span>
          </div>
        )}
        {content.runtime && (
          <div className={styles.runtime}>
            <i className="fas fa-clock"></i>
            <span>{content.runtime}분</span>
          </div>
        )}
        {content.status && (
          <div className={styles.status}>
            <i className="fas fa-info-circle"></i>
            <span>{content.status === "Released" ? "개봉완료" : content.status}</span>
          </div>
        )}
        {likeCount !== undefined && likeCount !== null && (
          <div className={styles.likeCount}>
            <i className="fas fa-heart"></i>
            <span>{likeCount.toLocaleString()}</span>
          </div>
        )}
        {content.adult !== undefined && (
          <div className={styles.adult}>
            <i className="fas fa-exclamation-triangle"></i>
            <span>{content.adult ? "성인 콘텐츠" : "전체 관람가"}</span>
          </div>
        )}
      </div>

      {/* 줄거리 */}
      <ContentOverview />

      {/* 장르 */}
      {genres && genres.length > 0 && (
        <div className={styles.genres}>
          <h3>장르</h3>
          <div className={styles.genresList}>
            {genres.map((genre) => (
              <span key={genre.id} className={styles.genreTag}>
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 제작사 */}
      {(content.productionCompanies || content.production_companies) &&
        (content.productionCompanies || content.production_companies).length > 0 && (
          <div className={styles.production}>
            <h3>제작사</h3>
            <div className={styles.productionList}>
              {(content.productionCompanies || content.production_companies).map((company) => {
                const logoPath = company.logoPath || company.logo_path;
                return (
                  <div key={company.id} className={styles.productionCompany}>
                    {logoPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${logoPath}`}
                        alt={company.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "inline-block";
                        }}
                      />
                    ) : null}
                    <span style={{ display: logoPath ? "none" : "inline-block" }}>
                      {company.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* 버튼 액션 */}
      <div className={styles.actions}>
        <button
          className={styles.ratingBtn}
          onClick={() => openRatingModal({ contentId: id, dbId: dbId })}
        >
          <i className="fas fa-star"></i>
          평점만 매기기
        </button>
        <Link to={`/${contentType}/${id}/review`} className={styles.reviewBtn}>
          <i className="fas fa-pen"></i>
          상세 리뷰 작성하기
        </Link>
      </div>

      <RatingModal />
    </div>
  );
};

ContentDetailInfo.propTypes = {
  content: PropTypes.shape({
    contentId: PropTypes.number,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    content_id: PropTypes.number,
    voteAverage: PropTypes.number,
    vote_average: PropTypes.number,
    releaseDate: PropTypes.string,
    release_date: PropTypes.string,
    voteCount: PropTypes.number,
    vote_count: PropTypes.number,
    runtime: PropTypes.number,
    status: PropTypes.string,
    adult: PropTypes.bool,
    productionCompanies: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        logoPath: PropTypes.string,
        logo_path: PropTypes.string,
      }),
    ),
    production_companies: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        logoPath: PropTypes.string,
        logo_path: PropTypes.string,
      }),
    ),
  }).isRequired,
  contentType: PropTypes.string,
  genres: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ),
  likeCount: PropTypes.number,
};

export default ContentDetailInfo;
