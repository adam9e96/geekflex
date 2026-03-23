import React from "react";
import PropTypes from "prop-types";
import { FaUser, FaFilm, FaTv } from "react-icons/fa6";
import styles from "./styles/SearchModal.module.css";

/**
 * 검색 결과 탭 컴포넌트
 */
const SearchTabs = ({ tabs }) => {
  const { activeTab, counts, onChange } = tabs;

  const items = [
    { id: "movie", label: "영화", count: counts.movie || 0, icon: FaFilm },
    { id: "tv", label: "드라마", count: counts.tv || 0, icon: FaTv },
    { id: "user", label: "유저", count: counts.user || 0, icon: FaUser },
  ];

  return (
    <div className={styles.tabs}>
      {items.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => onChange(tab.id)}
          >
            <Icon className={styles.tabIcon} />
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.count > 0 && <span className={styles.tabCount}>{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
};

SearchTabs.propTypes = {
  tabs: PropTypes.shape({
    activeTab: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    counts: PropTypes.shape({
      movie: PropTypes.number,
      tv: PropTypes.number,
      user: PropTypes.number,
    }).isRequired,
  }).isRequired,
};

export default SearchTabs;
