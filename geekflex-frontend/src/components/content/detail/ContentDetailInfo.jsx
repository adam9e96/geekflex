import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import RatingModal from "@components/review/components/RatingModal";

/**
 * 콘텐츠 상세 페이지 정보 섹션 컴포넌트
 *
 * 입력: content (콘텐츠 객체), contentType (콘텐츠 타입: "movie" | "tv"), genres (장르 배열), likeCount (좋아요 개수)
 * 처리: 콘텐츠 정보를 받아서 메타 정보, 줄거리, 장르를 조합하여 표시
 * 반환: 콘텐츠 정보가 포함된 JSX 요소
 */
const ContentDetailInfo = ({ content, onReviewSuccess, contentType = "movie", genres, likeCount }) => {
  const { id } = useParams();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // snake_case와 camelCase 모두 처리
  const rating = content.voteAverage || content.vote_average;
  const date = content.releaseDate || content.release_date;
  const votes = content.voteCount || content.vote_count;

  return (
    <div className="content-detail__info">
      {/* 메타 정보 섹션 */}
      <div className="content-detail__meta">
        {rating && (
          <div className="content-detail__rating">
            <i className="fas fa-star"></i>
            <span>{rating.toFixed(1)}</span>
            {votes && <span className="vote-count">({votes.toLocaleString()})</span>}
          </div>
        )}
        {date && (
          <div className="content-detail__release-date">
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date(date).toLocaleDateString("ko-KR")}</span>
          </div>
        )}
        {content.runtime && (
          <div className="content-detail__runtime">
            <i className="fas fa-clock"></i>
            <span>{content.runtime}분</span>
          </div>
        )}
        {content.status && (
          <div className="content-detail__status">
            <i className="fas fa-info-circle"></i>
            <span>{content.status === "Released" ? "개봉완료" : content.status}</span>
          </div>
        )}
        {likeCount !== undefined && likeCount !== null && (
          <div className="content-detail__like-count">
            <i className="fas fa-heart"></i>
            <span>{likeCount.toLocaleString()}</span>
          </div>
        )}
        {content.adult !== undefined && (
          <div className="content-detail__adult">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{content.adult ? "성인 콘텐츠" : "전체 관람가"}</span>
          </div>
        )}
      </div>

      {/* 줄거리 섹션 */}
      {content.overview && (
        <div className="content-detail__overview">
          <h2>줄거리</h2>
          <p>{content.overview}</p>
        </div>
      )}

      {/* 원제 및 언어 정보 */}
      {(content.originalTitle || content.original_title || content.originalLanguage || content.original_language) && (
        <div className="content-detail__original-info">
          {content.originalTitle || content.original_title ? (
            <div className="content-detail__original-title">
              <h3>원제</h3>
              <p>{content.originalTitle || content.original_title}</p>
            </div>
          ) : null}
          {content.originalLanguage || content.original_language ? (
            <div className="content-detail__original-language">
              <i className="fas fa-language"></i>
              <span>원어: {content.originalLanguage || content.original_language}</span>
            </div>
          ) : null}
        </div>
      )}

      {/* 장르 섹션 */}
      {genres && genres.length > 0 && (
        <div className="content-detail__genres">
          <h3>장르</h3>
          <div className="content-detail__genres-list">
            {genres.map((genre) => (
              <span key={genre.id} className="content-detail__genre-tag">
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 제작사 정보 */}
      {(content.productionCompanies || content.production_companies) &&
        (content.productionCompanies || content.production_companies).length > 0 && (
          <div className="content-detail__production">
            <h3>제작사</h3>
            <div className="content-detail__production-list">
              {(content.productionCompanies || content.production_companies).map((company) => {
                const logoPath = company.logoPath || company.logo_path;
                return (
                  <div key={company.id} className="production-company">
                    {logoPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${logoPath}`}
                        alt={company.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span>{company.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* 제작 국가 정보 */}
      {(content.productionCountries || content.production_countries) &&
        (content.productionCountries || content.production_countries).length > 0 && (
          <div className="content-detail__production-countries">
            <h3>제작 국가</h3>
            <div className="content-detail__production-countries-list">
              {(content.productionCountries || content.production_countries).map((country, index) => (
                <span key={country.iso3166_1 || index} className="content-detail__country-tag">
                  {country.name}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* 사용 언어 정보 */}
      {(content.spokenLanguages || content.spoken_languages) &&
        (content.spokenLanguages || content.spoken_languages).length > 0 && (
          <div className="content-detail__spoken-languages">
            <h3>사용 언어</h3>
            <div className="content-detail__spoken-languages-list">
              {(content.spokenLanguages || content.spoken_languages).map((language, index) => (
                <span key={language.iso639_1 || index} className="content-detail__language-tag">
                  {language.name || language.englishName}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* 제작 국가 (originCountry 배열) */}
      {content.originCountry && Array.isArray(content.originCountry) && content.originCountry.length > 0 && (
        <div className="content-detail__origin-countries">
          <h3>제작 국가</h3>
          <div className="content-detail__origin-countries-list">
            {content.originCountry.map((country, index) => (
              <span key={index} className="content-detail__country-tag">
                {country}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 추가 메타 정보 */}
      {(content.revenue || content.popularity || content.imdb_id) && (
        <div className="content-detail__extra-info">
          {content.revenue > 0 && (
            <div className="extra-info-item">
              <i className="fas fa-dollar-sign"></i>
              <span>수익: ${(content.revenue / 1000000).toFixed(1)}M</span>
            </div>
          )}
          {content.popularity && (
            <div className="extra-info-item">
              <i className="fas fa-fire"></i>
              <span>인기도: {content.popularity.toFixed(1)}</span>
            </div>
          )}
          {content.imdb_id && (
            <a
              href={`https://www.imdb.com/title/${content.imdb_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="extra-info-item imdb-link"
            >
              <i className="fab fa-imdb"></i>
              <span>IMDb</span>
            </a>
          )}
        </div>
      )}

      {/* 리뷰 작성 버튼 */}
      <div className="content-detail__actions">
        <button className="content-detail__rating-btn" onClick={() => setIsRatingModalOpen(true)}>
          <i className="fas fa-star"></i>
          평점만 매기기
        </button>
        <Link to={`/${contentType}/${id}/review`} className="content-detail__review-btn">
          <i className="fas fa-pen"></i>
          상세 리뷰 작성하기
        </Link>
      </div>

      {/* 평점만 매기기 모달 */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        contentId={id}
        onSuccess={onReviewSuccess}
      />
    </div>
  );
};

export default ContentDetailInfo;

