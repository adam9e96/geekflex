import React, { useRef } from "react";
import { Dialog } from "@headlessui/react";
import { FaXmark } from "react-icons/fa6";
import styles from "./styles/SearchModal.module.css";
import { useSearchModal } from "@hooks/useSearchModal";
import SearchInput from "./SearchInput";
import SearchTabs from "./SearchTabs";
import SearchHistory from "./SearchHistory";
import SearchResults from "./SearchResults";

/**
 * 검색 모달 컴포넌트
 * @headlessui/react의 Dialog를 사용하여 구현
 */
const SearchModal = () => {
  const searchInputRef = useRef(null);
  const searchModalRef = useRef(null);

  const { isOpen, searchQuery, onClose, input, tabs, resultsView, history } =
    useSearchModal(searchInputRef);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      initialFocus={searchInputRef}
      id="searchModal"
      ref={searchModalRef}
      className={styles.dialog}
    >
      <div className={styles.overlay} />

      <div className={styles.modalWrapper}>
        <div className={styles.modalLayout}>
          <div
            className={styles.content}
            onTransitionEnd={() => {
              if (isOpen && searchInputRef?.current) {
                requestAnimationFrame(() => {
                  searchInputRef.current?.focus();
                });
              }
            }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>통합 검색</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label="검색 모달 닫기">
                <FaXmark />
              </button>
            </div>

            <SearchInput ref={searchInputRef} input={input} />

            {searchQuery && (
              <>
                <SearchTabs tabs={tabs} />
                <SearchResults resultsView={resultsView} />
              </>
            )}

            {!searchQuery && <SearchHistory history={history} />}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SearchModal;
