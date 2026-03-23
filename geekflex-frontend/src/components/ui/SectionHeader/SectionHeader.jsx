import React, { memo } from "react";
import PropTypes from "prop-types";
import styles from "./SectionHeader.module.css";

const SectionHeader = memo(({ title, icon, moreLink, moreText = "더보기" }) => {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>
        {icon && <i className={icon}></i>}
        {title}
      </h2>
      {moreLink && (
        <a href={moreLink} className={styles.moreLink}>
          {moreText} <i className="fas fa-chevron-right"></i>
        </a>
      )}
    </div>
  );
});

SectionHeader.displayName = "SectionHeader";

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  moreLink: PropTypes.string,
  moreText: PropTypes.string,
};

export default SectionHeader;
