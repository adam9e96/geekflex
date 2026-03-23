import React, { useState } from "react";
import { useContentDetailStore } from "@stores/contentDetailStore";
import styles from "./ContentOverview.module.css";

/**
 * 콘텐츠 줄거리 섹션 컴포넌트
 */
const ContentOverview = () => {
  const overview = useContentDetailStore((state) => state.content?.overview);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!overview) {
    return null;
  }

  const maxLength = 300;
  const shouldTruncate = overview.length > maxLength;

  const displayText =
    shouldTruncate && !isExpanded ? `${overview.slice(0, maxLength)}...` : overview;

  return (
    <div className={styles.container}>
      <h2>줄거리</h2>
      <p className={`${styles.text} ${isExpanded ? styles.expanded : ""}`}>{displayText}</p>
      {shouldTruncate && (
        <button className={styles.toggleBtn} onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "접기" : "더보기"}
        </button>
      )}
    </div>
  );
};

export default ContentOverview;
