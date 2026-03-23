import React from "react";
import PropTypes from "prop-types";
import { FaXmark } from "react-icons/fa6";
import styles from "./styles/SearchModal.module.css";

/**
 * 검색 입력 필드 컴포넌트
 */
const SearchInput = React.forwardRef(({ input, placeholder = "통합 검색" }, ref) => {
  const { value, onChange, onKeyDown, onClear } = input;

  return (
    <div className={styles.inputWrapper}>
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      {value && (
        <button
          className={styles.inputClear}
          onClick={onClear}
          aria-label="검색어 지우기"
          type="button"
        >
          <FaXmark />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = "SearchInput";

SearchInput.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
  }).isRequired,
  placeholder: PropTypes.string,
};

export default SearchInput;
