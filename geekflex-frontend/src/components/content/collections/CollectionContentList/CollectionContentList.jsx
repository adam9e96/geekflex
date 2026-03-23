import React from "react";
import PropTypes from "prop-types";
import styles from "./CollectionContentList.module.css";
import ContentCard from "@components/home/ContentCard.jsx";

const CollectionContentList = ({ contents }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>
          <i className="fas fa-list"></i> 포함된 작품
        </h2>
      </div>

      {!Array.isArray(contents) || contents.length === 0 ? (
        <div className={styles.empty}>
          <i className="fas fa-film"></i>
          <p>이 컬렉션에 포함된 작품이 없습니다.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {contents.map((content) => (
            <ContentCard
              key={content.id || content.tmdbId || content.contentId}
              content={content}
            />
          ))}
        </div>
      )}
    </div>
  );
};

CollectionContentList.propTypes = {
  contents: PropTypes.array,
};

export default CollectionContentList;
