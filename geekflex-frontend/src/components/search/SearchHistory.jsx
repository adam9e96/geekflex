import React from "react";
import PropTypes from "prop-types";
import { FaClockRotateLeft, FaXmark } from "react-icons/fa6";
import styles from "./styles/SearchModal.module.css";

/**
 * 최근 검색 기록 컴포넌트
 */
const SearchHistory = ({ history }) => {
  const { items, onSelect, onRemove } = history;

  if (!items || items.length === 0) return null;

  return (
    <div className={styles.results}>
      <div className={styles.historyTitle}>
        <h4>최근 검색</h4>
      </div>
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className={styles.historyItem} onClick={() => onSelect(item)}>
          <FaClockRotateLeft />
          <span>{item}</span>
          <button
            className={styles.historyRemove}
            onClick={(e) => onRemove(e, item)}
            aria-label="검색 기록 삭제"
          >
            <FaXmark />
          </button>
        </div>
      ))}
    </div>
  );
};

SearchHistory.propTypes = {
  history: PropTypes.shape({
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchHistory;
