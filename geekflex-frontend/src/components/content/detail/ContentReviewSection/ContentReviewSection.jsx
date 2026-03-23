import React from "react";
import PropTypes from "prop-types";
import { FaStar } from "react-icons/fa6";
import ReviewList from "@components/review/ReviewList/ReviewList";
import ReviewWriteForm from "@components/review/ReviewWriteForm/ReviewWriteForm";
import styles from "./ContentReviewSection.module.css";

/**
 * 콘텐츠 리뷰 섹션 컴포넌트
 */
const ContentReviewSection = ({ tmdbId, contentId }) => {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>
        <FaStar className={styles.starIcon} />
        리뷰 작성
      </h2>

      {/* 리뷰 작성 폼 */}
      <ReviewWriteForm tmdbId={tmdbId} contentId={contentId} />

      {/* 리뷰 목록 */}
      <div className={styles.listContainer}>
        <ReviewList contentId={contentId} />
      </div>
    </div>
  );
};

ContentReviewSection.propTypes = {
  tmdbId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  contentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ContentReviewSection;
