import React from "react";
import PropTypes from "prop-types";
import { FaSpinner, FaMagnifyingGlass } from "react-icons/fa6";
import styles from "./styles/SearchModal.module.css";
import MediaResultItem from "./MediaResultItem";
import UserResultItem from "./UserResultItem";

/**
 * 검색 결과 목록 컴포넌트
 */
const SearchResults = ({ resultsView }) => {
  const { activeTab, items, loading, activeIndex, onSelect } = resultsView;

  if (loading) {
    return (
      <div className={`${styles.results} ${activeTab === "user" ? styles.resultsUser : ""}`}>
        <div className={styles.loading}>
          <FaSpinner className="animate-spin" />
          <span>검색 중...</span>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={`${styles.results} ${activeTab === "user" ? styles.resultsUser : ""}`}>
        <div className={styles.empty}>
          <FaMagnifyingGlass className={styles.emptyIcon} />
          <span>검색 결과가 없습니다.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.results} ${activeTab === "user" ? styles.resultsUser : ""}`}>
      {items.map((result, index) => {
        const isActive = index === activeIndex;

        if (activeTab === "user") {
          return (
            <UserResultItem
              key={result.publicId || index}
              user={result}
              isActive={isActive}
              onClick={() => onSelect(result)}
            />
          );
        }

        return (
          <MediaResultItem
            key={result.id || index}
            result={result}
            isActive={isActive}
            onClick={onSelect}
          />
        );
      })}
    </div>
  );
};

SearchResults.propTypes = {
  resultsView: PropTypes.shape({
    activeTab: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    activeIndex: PropTypes.number,
    onSelect: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchResults;
