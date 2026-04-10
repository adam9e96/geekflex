import React from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import RatingModal from "@components/review/RatingModal/RatingModal";
import { useReviewStore } from "@stores/reviewStore";
import styles from "./TvDetailInfo.module.css";

/**
 * TV 상세 페이지 정보 섹션 컴포넌트
 */
const TvDetailInfo = ({ content, onReviewSuccess, genres, likeCount }) => {
  const { id } = useParams();
  const { openRatingModal } = useReviewStore();

  // snake_case와 camelCase 모두 처리
  const dbId = content.contentId || content.id || content.content_id;
  const rating = content.voteAverage || content.vote_average;
  const firstAirDate = content.firstAirDate || content.first_air_date;
  const lastAirDate = content.lastAirDate || content.last_air_date;
  const votes = content.voteCount || content.vote_count;
  const numberOfSeasons = content.numberOfSeasons || content.number_of_seasons;
  const numberOfEpisodes = content.numberOfEpisodes || content.number_of_episodes;
  const episodeRunTime = content.episodeRunTime || content.episode_run_time;

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
        {firstAirDate && (
          <div>
            <i className="fas fa-calendar-alt"></i>
            <span>첫 방송: {new Date(firstAirDate).toLocaleDateString("ko-KR")}</span>
          </div>
        )}
        {lastAirDate && (
          <div>
            <i className="fas fa-calendar-check"></i>
            <span>마지막 방송: {new Date(lastAirDate).toLocaleDateString("ko-KR")}</span>
          </div>
        )}
        {numberOfSeasons && (
          <div>
            <i className="fas fa-tv"></i>
            <span>시즌 {numberOfSeasons}개</span>
          </div>
        )}
        {numberOfEpisodes && (
          <div>
            <i className="fas fa-list"></i>
            <span>에피소드 {numberOfEpisodes}개</span>
          </div>
        )}
        {episodeRunTime && Array.isArray(episodeRunTime) && episodeRunTime.length > 0 && (
          <div>
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
          <div>
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
          <div>
            <i className="fas fa-heart"></i>
            <span>{likeCount.toLocaleString()}</span>
          </div>
        )}
        {content.adult !== undefined && (
          <div>
            <i className="fas fa-exclamation-triangle"></i>
            <span>{content.adult ? "성인 콘텐츠" : "전체 관람가"}</span>
          </div>
        )}
      </div>

      {/* 줄거리 */}
      {content.overview && (
        <div className={styles.overview}>
          <h2>줄거리</h2>
          <p>{content.overview}</p>
        </div>
      )}

      {/* 원제 및 언어 */}
      {(content.originalName ||
        content.original_name ||
        content.originalLanguage ||
        content.original_language) && (
        <div className={styles.originalInfo}>
          {content.originalName || content.original_name ? (
            <div className={styles.originalTitle}>
              <h3>원제</h3>
              <p>{content.originalName || content.original_name}</p>
            </div>
          ) : null}
          {content.originalLanguage || content.original_language ? (
            <div className={styles.originalLanguage}>
              <i className="fas fa-language"></i>
              <span>원어: {content.originalLanguage || content.original_language}</span>
            </div>
          ) : null}
        </div>
      )}

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

      {/* 방송 네트워크 */}
      {(content.networks || content.network) &&
        (content.networks?.length > 0 || content.network) && (
          <div className={styles.networks}>
            <h3>방송 네트워크</h3>
            <div className={styles.networksList}>
              {(content.networks || (content.network ? [content.network] : [])).map((network) => {
                const logoPath = network.logoPath || network.logo_path;
                return (
                  <div key={network.id} className={styles.networkItem}>
                    {logoPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${logoPath}`}
                        alt={network.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "inline-block";
                        }}
                      />
                    ) : null}
                    <span style={{ display: logoPath ? "none" : "inline-block" }}>
                      {network.name}
                    </span>
                  </div>
                );
              })}
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

      {/* 제작 국가 */}
      {(content.productionCountries || content.production_countries) &&
        (content.productionCountries || content.production_countries).length > 0 && (
          <div className={styles.productionCountries}>
            <h3>제작 국가</h3>
            <div className={styles.productionCountriesList}>
              {(content.productionCountries || content.production_countries).map(
                (country, index) => (
                  <span key={country.iso3166_1 || index} className={styles.countryTag}>
                    {country.name}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

      {/* 사용 언어 */}
      {(content.spokenLanguages || content.spoken_languages) &&
        (content.spokenLanguages || content.spoken_languages).length > 0 && (
          <div className={styles.spokenLanguages}>
            <h3>사용 언어</h3>
            <div className={styles.spokenLanguagesList}>
              {(content.spokenLanguages || content.spoken_languages).map((language, index) => (
                <span key={language.iso639_1 || index} className={styles.languageTag}>
                  {language.name || language.englishName}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* 시즌 정보 */}
      {content.seasons && Array.isArray(content.seasons) && content.seasons.length > 0 && (
        <div className={styles.seasons}>
          <h3>시즌 정보</h3>
          <div className={styles.seasonsList}>
            {content.seasons.map((season) => {
              const airDate = season.airDate || season.air_date;
              const episodeCount = season.episodeCount || season.episode_count;
              const posterPath = season.posterPath || season.poster_path;
              const seasonNumber = season.seasonNumber || season.season_number;
              const voteAverage = season.voteAverage || season.vote_average;

              const posterUrl = posterPath
                ? posterPath.startsWith("http")
                  ? posterPath
                  : `https://image.tmdb.org/t/p/w300${posterPath}`
                : null;

              return (
                <div key={season.id || seasonNumber} className={styles.seasonItem}>
                  <div className={styles.seasonPoster}>
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={season.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={styles.seasonPosterPlaceholder}
                      style={{ display: posterUrl ? "none" : "flex" }}
                    >
                      <i className="fas fa-tv"></i>
                    </div>
                  </div>
                  <div className={styles.seasonInfo}>
                    <h4>
                      {season.name ||
                        (seasonNumber === 0 ? "스페셜" : `시즌 ${seasonNumber || ""}`)}
                    </h4>
                    {airDate && (
                      <p className={styles.seasonAirDate}>
                        <i className="fas fa-calendar"></i>
                        {new Date(airDate).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                    {episodeCount && (
                      <p className={styles.seasonEpisodeCount}>
                        <i className="fas fa-list"></i>
                        {episodeCount}개 에피소드
                      </p>
                    )}
                    {voteAverage && (
                      <p className={styles.seasonRating}>
                        <i className="fas fa-star"></i>
                        {voteAverage.toFixed(1)}
                      </p>
                    )}
                    {season.overview && <p className={styles.seasonOverview}>{season.overview}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 추가 메타 정보 */}
      {content.popularity && (
        <div className={styles.extraInfo}>
          <div className={styles.extraInfoItem}>
            <i className="fas fa-fire"></i>
            <span>인기도: {content.popularity.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* 버튼 액션 */}
      <div className={styles.actions}>
        <button
          className={styles.ratingBtn}
          onClick={() => openRatingModal({ contentId: dbId, onSuccess: onReviewSuccess })}
        >
          <i className="fas fa-star"></i>
          평점만 매기기
        </button>
        <Link to={`/tv/${id}/review`} className={styles.reviewBtn}>
          <i className="fas fa-pen"></i>
          상세 리뷰 작성하기
        </Link>
      </div>

      <RatingModal />
    </div>
  );
};

TvDetailInfo.propTypes = {
  content: PropTypes.shape({
    contentId: PropTypes.number,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    content_id: PropTypes.number,
    voteAverage: PropTypes.number,
    vote_average: PropTypes.number,
    firstAirDate: PropTypes.string,
    first_air_date: PropTypes.string,
    lastAirDate: PropTypes.string,
    last_air_date: PropTypes.string,
    voteCount: PropTypes.number,
    vote_count: PropTypes.number,
    numberOfSeasons: PropTypes.number,
    number_of_seasons: PropTypes.number,
    numberOfEpisodes: PropTypes.number,
    number_of_episodes: PropTypes.number,
    episodeRunTime: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
    episode_run_time: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
    status: PropTypes.string,
    adult: PropTypes.bool,
    overview: PropTypes.string,
    originalName: PropTypes.string,
    original_name: PropTypes.string,
    originalLanguage: PropTypes.string,
    original_language: PropTypes.string,
    popularity: PropTypes.number,
    networks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        logoPath: PropTypes.string,
        logo_path: PropTypes.string,
      }),
    ),
    network: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      logoPath: PropTypes.string,
      logo_path: PropTypes.string,
    }),
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
    productionCountries: PropTypes.arrayOf(
      PropTypes.shape({
        iso3166_1: PropTypes.string,
        name: PropTypes.string,
      }),
    ),
    production_countries: PropTypes.arrayOf(
      PropTypes.shape({
        iso3166_1: PropTypes.string,
        name: PropTypes.string,
      }),
    ),
    spokenLanguages: PropTypes.arrayOf(
      PropTypes.shape({
        iso639_1: PropTypes.string,
        name: PropTypes.string,
        englishName: PropTypes.string,
      }),
    ),
    spoken_languages: PropTypes.arrayOf(
      PropTypes.shape({
        iso639_1: PropTypes.string,
        name: PropTypes.string,
        englishName: PropTypes.string,
      }),
    ),
    seasons: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        seasonNumber: PropTypes.number,
        season_number: PropTypes.number,
        episodeCount: PropTypes.number,
        episode_count: PropTypes.number,
        airDate: PropTypes.string,
        air_date: PropTypes.string,
        posterPath: PropTypes.string,
        poster_path: PropTypes.string,
        voteAverage: PropTypes.number,
        vote_average: PropTypes.number,
        overview: PropTypes.string,
      }),
    ),
  }).isRequired,
  onReviewSuccess: PropTypes.func,
  genres: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ),
  likeCount: PropTypes.number,
};

export default TvDetailInfo;
