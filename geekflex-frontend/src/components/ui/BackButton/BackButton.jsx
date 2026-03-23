import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import styles from "./BackButton.module.css";

const BackButton = ({ className, onClick }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button className={`${styles.backButton} ${className || ""}`} onClick={handleBack}>
      <i className="fas fa-arrow-left"></i>
      <span>뒤로가기</span>
    </button>
  );
};

BackButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default BackButton;
