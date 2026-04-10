import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContentCard from "@components/home/ContentCard";
import { collectionService } from "@services/collectionService";
import { getRandomContent, getRandomContentSuggestions } from "@services/contentService";
import { publicApi, getResponseData } from "@services/apiClient";
import { useSearchStore } from "@stores/searchStore";
import styles from "./Home.module.css";

const FALLBACK_QUERIES = ["오징어 게임", "인터스텔라", "듄", "미생"];
const QUICK_SEARCH_CACHE_KEY = "geekflex.quickSearch.v1";

const Home = () => {
  const navigate = useNavigate();
  const openSearch = useSearchStore((state) => state.handleSearchClick);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);

  const [spotlight, setSpotlight] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTv, setPopularTv] = useState([]);
  const [collections, setCollections] = useState([]);
  const [quickSearches, setQuickSearches] = useState(FALLBACK_QUERIES);
  const [searchDraft, setSearchDraft] = useState("");
  const [isRandomLoading, setIsRandomLoading] = useState(false);

  const spotlightPath = useMemo(() => getContentPath(spotlight), [spotlight]);
  const spotlightImage = spotlight?.backdropUrl || spotlight?.posterUrl;

  useEffect(() => {
    const loadHome = async () => {
      const [randomResult, movieResult, tvResult, collectionResult] = await Promise.allSettled([
        getRandomContent(),
        fetchContentList("/api/v1/movies/popular"),
        fetchContentList("/api/v1/tv/popular"),
        collectionService.fetchPublicCollections({ sortBy: "latest", page: 0, size: 4 }),
      ]);

      if (randomResult.status === "fulfilled") {
        setSpotlight(randomResult.value);
      }
      if (movieResult.status === "fulfilled") {
        setPopularMovies(movieResult.value.slice(0, 6));
      }
      if (tvResult.status === "fulfilled") {
        setPopularTv(tvResult.value.slice(0, 6));
      }
      if (collectionResult.status === "fulfilled") {
        setCollections(normalizeCollectionPage(collectionResult.value).slice(0, 4));
      }
    };

    loadHome();
  }, []);

  useEffect(() => {
    loadDailyQuickSearches().then(setQuickSearches).catch(() => {
      setQuickSearches(FALLBACK_QUERIES);
    });
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    openSearch();
    setSearchQuery(searchDraft.trim());
  };

  const handleFeaturedQueryClick = (query) => {
    setSearchDraft(query);
    openSearch();
    setSearchQuery(query);
  };

  const handleRandomClick = async () => {
    if (isRandomLoading) return;

    setIsRandomLoading(true);
    try {
      const content = await getRandomContent();
      setSpotlight(content);
      const path = getContentPath(content);
      if (path) {
        navigate(path);
      }
    } finally {
      setIsRandomLoading(false);
    }
  };

  return (
    <div className={styles.homePage}>
      <section
        className={styles.spotlight}
        style={spotlightImage ? { backgroundImage: `url(${spotlightImage})` } : undefined}
      >
        <div className={styles.spotlightShade} />

        <div className={styles.spotlightContent}>
          <p className={styles.eyebrow}>오늘의 GeekFlex</p>
          <h1 className={styles.spotlightTitle}>
            {spotlight?.title || spotlight?.name || "오늘 밤 볼 작품을 고르자"}
          </h1>
          <p className={styles.spotlightText}>
            {spotlight?.overview ||
              "영화와 드라마를 검색하고, 별점을 남기고, 오래 기억할 작품을 컬렉션으로 묶어두세요."}
          </p>

          <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="영화, 드라마, 유저 검색"
              aria-label="검색어"
            />
            <button type="submit">검색</button>
          </form>

          <div className={styles.actionRow}>
            {spotlightPath && (
              <Link className={styles.primaryAction} to={spotlightPath}>
                작품 보기
              </Link>
            )}
            <button className={styles.secondaryAction} onClick={handleRandomClick} type="button">
              {isRandomLoading ? "고르는 중" : "랜덤 작품"}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.quickSearch} aria-label="빠른 검색어">
        <span>지금 찾아보기</span>
        {quickSearches.map((query) => (
          <button key={query} type="button" onClick={() => handleFeaturedQueryClick(query)}>
            {query}
          </button>
        ))}
      </section>

      <ContentRail title="인기 있는 영화" moreLink="/movies/popular" items={popularMovies} />
      <ContentRail title="인기 있는 드라마" moreLink="/tv-list/popular" items={popularTv} />

      <section className={styles.collectionSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Collection</p>
            <h2>취향으로 묶은 작품들</h2>
          </div>
          <Link to="/collection">컬렉션 보기</Link>
        </div>

        <div className={styles.collectionGrid}>
          {collections.length > 0 ? (
            collections.map((collection) => (
              <Link
                className={styles.collectionItem}
                key={collection.id}
                to={`/collection/${collection.id}`}
              >
                <strong>{collection.title}</strong>
                <p>{collection.description || "다음에 볼 작품을 발견해보세요."}</p>
                <span>
                  {collection.author?.nickname || "GeekFlex"} · 작품 {collection.itemCount || 0}개
                </span>
              </Link>
            ))
          ) : (
            <div className={styles.collectionEmpty}>
              <strong>첫 컬렉션을 기다리는 중</strong>
              <p>좋아하는 작품들을 묶어 나만의 추천 목록으로 남겨보세요.</p>
              <Link to="/collection">컬렉션으로 이동</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ContentRail = ({ title, moreLink, items }) => (
  <section className={styles.railSection}>
    <div className={styles.sectionHeading}>
      <div>
        <p className={styles.eyebrow}>Now</p>
        <h2>{title}</h2>
      </div>
      <Link to={moreLink}>더 보기</Link>
    </div>

    <div className={styles.railGrid}>
      {items.map((item) => (
        <ContentCard key={`${item.contentType}-${item.id}`} content={item} />
      ))}
    </div>
  </section>
);

const fetchContentList = async (path) => {
  const response = await publicApi.get(path);
  const data = getResponseData(response);
  return Array.isArray(data) ? data : [];
};

const normalizeCollectionPage = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const getContentPath = (content) => {
  if (!content?.tmdbId) return "";
  return content.contentType === "TV" ? `/tv/${content.tmdbId}` : `/movie/${content.tmdbId}`;
};

const loadDailyQuickSearches = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const cached = readQuickSearchCache();

  if (cached?.date === today && Array.isArray(cached.queries) && cached.queries.length === 4) {
    return cached.queries;
  }

  const suggestions = await getRandomContentSuggestions();
  const queries = suggestions
    .map((content) => content.title || content.name)
    .filter(Boolean)
    .slice(0, 4);

  const nextQueries = queries.length === 4 ? queries : FALLBACK_QUERIES;
  localStorage.setItem(
    QUICK_SEARCH_CACHE_KEY,
    JSON.stringify({
      date: today,
      queries: nextQueries,
    }),
  );

  return nextQueries;
};

const readQuickSearchCache = () => {
  try {
    return JSON.parse(localStorage.getItem(QUICK_SEARCH_CACHE_KEY));
  } catch {
    return null;
  }
};

export default Home;
