import { FaFire, FaCalendarAlt, FaStar, FaPlayCircle, FaBookmark } from "react-icons/fa";

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

export const MAIN_NAV_ITEMS = [
  {
    id: "collection",
    path: "/collection",
    category: "collection",
    label: "유저 컬렉션",
    icon: FaBookmark,
  },
];
