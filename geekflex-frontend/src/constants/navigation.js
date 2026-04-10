import { FaFire, FaCalendarAlt, FaStar, FaPlayCircle, FaBookmark, FaTv } from "react-icons/fa";

// 2026.02.03 검토완료
export const MOVIE_DROPDOWN_ITEMS = [
  {
    path: "/movies/popular",
    category: "popular",
    label: "인기있는 작품",
    icon: FaFire,
  },
  {
    path: "/movies/upcoming",
    category: "upcoming",
    label: "개봉예정 작품",
    icon: FaCalendarAlt,
  },
  {
    path: "/movies/top_rated",
    category: "top_rated",
    label: "최고평점",
    icon: FaStar,
  },
  {
    path: "/movies/now-playing",
    category: "now-playing",
    label: "현재 상영중인",
    icon: FaPlayCircle,
  },
];

export const TV_DROPDOWN_ITEMS = [
  {
    path: "/tv-list/popular",
    category: "popular",
    label: "인기 드라마",
    icon: FaFire,
  },
  {
    path: "/tv-list/on-the-air",
    category: "on-the-air",
    label: "방영 중",
    icon: FaPlayCircle,
  },
  {
    path: "/tv-list/top-rated",
    category: "top-rated",
    label: "최고평점",
    icon: FaStar,
  },
  {
    path: "/tv-list/airing-today",
    category: "airing-today",
    label: "오늘 방영",
    icon: FaCalendarAlt,
  },
];

export const MAIN_NAV_ITEMS = [
  {
    id: "collection",
    path: "/collection",
    category: "collection",
    label: "유저 컬렉션",
    icon: FaBookmark,
  },
];
