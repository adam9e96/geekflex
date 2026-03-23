/**
 * 콘텐츠 데이터 정규화 유틸리티
 * Movie와 TV Show의 서로 다른 필드명을 통일된 인터페이스로 변환합니다.
 * 이를 사용하면 컴포넌트에서 content.title || content.name 와 같은 분기 처리를 하지 않아도 됩니다.
 */

export const formatContent = (content) => {
  if (!content) return null;

  // media_type이 있으면 사용하고, 없으면 필드 유무로 추론 (name이 있고 title이 없으면 TV일 확률 높음)
  const isTv =
    content.media_type === "tv" || (content.name && !content.title) || !!content.first_air_date; // first_air_date는 TV 고유 필드

  return {
    // 1. 식별자
    id: content.id || content.contentId,
    // API에서 media_type이 오지 않는 경우도 있어 추론된 타입 사용
    type: isTv ? "tv" : "movie",

    // 2. 표시 정보 (제목, 이미지, 설명)
    // 영화는 title, TV는 name
    title: content.title || content.name,
    originalTitle: content.original_title || content.original_name,
    overview: content.overview || "",
    tagline: content.tagline || "",
    // snake_case (API) -> camelCase 변환 지원
    posterPath: content.poster_path || content.posterPath,
    backdropPath: content.backdrop_path || content.backdropPath,

    // 3. 날짜 정보
    // 영화는 release_date, TV는 first_air_date
    date: content.release_date || content.first_air_date,
    year: (content.release_date || content.first_air_date)?.substring(0, 4) || "",

    // 4. 통계 정보
    voteAverage: content.vote_average || content.voteAverage || 0,
    voteCount: content.vote_count || content.voteCount || 0,
    popularity: content.popularity || 0,

    // 5. 상세 정보
    adult: content.adult || false,
    status: content.status || "",
    // 영화는 runtime(분), TV는 episode_run_time(분 배열)
    runtime:
      content.runtime ||
      (content.episode_run_time?.length > 0 ? content.episode_run_time[0] : null),
    genres: content.genres || [],

    // 6. 제작 정보
    productionCompanies: content.production_companies || content.productionCompanies || [],
    productionCountries: content.production_countries || content.productionCountries || [],
    spokenLanguages: content.spoken_languages || content.spokenLanguages || [],

    // 7. TV 전용 필드
    networks: content.networks || [],
    numberOfSeasons: content.number_of_seasons || content.numberOfSeasons,
    numberOfEpisodes: content.number_of_episodes || content.numberOfEpisodes,
    seasons: content.seasons || [],

    // 8. 기타
    homepage: content.homepage,

    // 원본 데이터 보존 (필요 시 비상용)
    _raw: content,
  };
};

/**
 * 포스터 전체 URL 생성 헬퍼 (기존 movieUtils 대체 가능)
 */
export const makePosterUrl = (path, size = "w500") => {
  if (!path) return "/no-image.png"; // 혹은 적절한 fallback 이미지
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * 백드롭 전체 URL 생성 헬퍼
 */
export const makeBackdropUrl = (path, size = "original") => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
