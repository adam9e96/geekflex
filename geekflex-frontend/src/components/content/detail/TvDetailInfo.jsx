import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import RatingModal from "@components/review/components/RatingModal";

/**
 * TV 상세 페이지 정보 섹션 컴포넌트
 *
 * 입력: content (TV 콘텐츠 객체), genres (장르 배열), likeCount (좋아요 개수)
 * 처리: TV 콘텐츠 정보를 받아서 메타 정보, 줄거리, 장르, 시즌 정보를 조합하여 표시
 * 반환: TV 콘텐츠 정보가 포함된 JSX 요소
 */
const TvDetailInfo = ({ content, onReviewSuccess, genres, likeCount }) => {
  const { id } = useParams();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // snake_case와 camelCase 모두 처리
  const rating = content.voteAverage || content.vote_average;
  const firstAirDate = content.firstAirDate || content.first_air_date;
  const lastAirDate = content.lastAirDate || content.last_air_date;
  const votes = content.voteCount || content.vote_count;
  const numberOfSeasons = content.numberOfSeasons || content.number_of_seasons;
  const numberOfEpisodes = content.numberOfEpisodes || content.number_of_episodes;
  const episodeRunTime = content.episodeRunTime || content.episode_run_time;

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
        {firstAirDate && (
          <div className="content-detail__first-air-date">
            <i className="fas fa-calendar-alt"></i>
            <span>첫 방송: {new Date(firstAirDate).toLocaleDateString("ko-KR")}</span>
          </div>
        )}
        {lastAirDate && (
          <div className="content-detail__last-air-date">
            <i className="fas fa-calendar-check"></i>
            <span>마지막 방송: {new Date(lastAirDate).toLocaleDateString("ko-KR")}</span>
          </div>
        )}
        {numberOfSeasons && (
          <div className="content-detail__seasons-count">
            <i className="fas fa-tv"></i>
            <span>시즌 {numberOfSeasons}개</span>
          </div>
        )}
        {numberOfEpisodes && (
          <div className="content-detail__episodes-count">
            <i className="fas fa-list"></i>
            <span>에피소드 {numberOfEpisodes}개</span>
          </div>
        )}
        {episodeRunTime && Array.isArray(episodeRunTime) && episodeRunTime.length > 0 && (
          <div className="content-detail__episode-runtime">
            <i className="fas fa-clock"></i>
            <span>
              회당{" "}
              {episodeRunTime.length === 1
                ? `${episodeRunTime[0]}분`
                : `${episodeRunTime[0]}-${episodeRunTime[episodeRunTime.length - 1]}분`}
            </span>
          </div>
        )}
        {content.status && (
          <div className="content-detail__status">
            <i className="fas fa-info-circle"></i>
            <span>
              {content.status === "Returning Series"
                ? "방영 중"
                : content.status === "Ended"
                ? "종영"
                : content.status === "Canceled"
                ? "취소"
                : content.status === "Planned"
                ? "예정"
                : content.status}
            </span>
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
      {(content.originalName || content.original_name || content.originalLanguage || content.original_language) && (
        <div className="content-detail__original-info">
          {content.originalName || content.original_name ? (
            <div className="content-detail__original-title">
              <h3>원제</h3>
              <p>{content.originalName || content.original_name}</p>
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

      {/* 방송 네트워크 정보 */}
      {(content.networks || content.network) && 
       (content.networks?.length > 0 || content.network) && (
        <div className="content-detail__networks">
          <h3>방송 네트워크</h3>
          <div className="content-detail__networks-list">
            {(content.networks || (content.network ? [content.network] : [])).map((network) => {
              const logoPath = network.logoPath || network.logo_path;
              return (
                <div key={network.id} className="network-item">
                  {logoPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${logoPath}`}
                      alt={network.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span>{network.name}</span>
                  )}
                </div>
              );
            })}
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

      {/* 시즌 정보 */}
      {content.seasons && Array.isArray(content.seasons) && content.seasons.length > 0 && (
        <div className="content-detail__seasons">
          <h3>시즌 정보</h3>
          <div className="content-detail__seasons-list">
            {content.seasons.map((season) => {
              // season 필드명: camelCase와 snake_case 모두 처리
              const airDate = season.airDate || season.air_date;
              const episodeCount = season.episodeCount || season.episode_count;
              const posterPath = season.posterPath || season.poster_path;
              const seasonNumber = season.seasonNumber || season.season_number;
              const voteAverage = season.voteAverage || season.vote_average;
              
              // posterPath가 상대 경로인 경우만 TMDB URL 추가
              const posterUrl = posterPath
                ? posterPath.startsWith("http")
                  ? posterPath
                  : `https://image.tmdb.org/t/p/w300${posterPath}`
                : null;

              return (
                <div key={season.id || seasonNumber} className="content-detail__season-item">
                  <div className="season-poster">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={season.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="season-poster-placeholder">
                        <i className="fas fa-tv"></i>
                      </div>
                    )}
                  </div>
                  <div className="season-info">
                    <h4>
                      {season.name || 
                       (seasonNumber === 0 
                         ? "스페셜" 
                         : `시즌 ${seasonNumber || ""}`)}
                    </h4>
                    {airDate && (
                      <p className="season-air-date">
                        <i className="fas fa-calendar"></i>
                        {new Date(airDate).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                    {episodeCount && (
                      <p className="season-episode-count">
                        <i className="fas fa-list"></i>
                        {episodeCount}개 에피소드
                      </p>
                    )}
                    {voteAverage && (
                      <p className="season-rating">
                        <i className="fas fa-star"></i>
                        {voteAverage.toFixed(1)}
                      </p>
                    )}
                    {season.overview && (
                      <p className="season-overview">{season.overview}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 추가 메타 정보 */}
      {content.popularity && (
        <div className="content-detail__extra-info">
          <div className="extra-info-item">
            <i className="fas fa-fire"></i>
            <span>인기도: {content.popularity.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* 리뷰 작성 버튼 */}
      <div className="content-detail__actions">
        <button className="content-detail__rating-btn" onClick={() => setIsRatingModalOpen(true)}>
          <i className="fas fa-star"></i>
          평점만 매기기
        </button>
        <Link to={`/tv/${id}/review`} className="content-detail__review-btn">
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

export default TvDetailInfo;
