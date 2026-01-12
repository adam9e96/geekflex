import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/ui.css";

/**
 * 공통 뒤로가기 버튼 컴포넌트
 * 입력: 클래스 이름, 자식 요소
 * 처리:
 *  1. 뒤로가기 버튼을 클릭하면 이전 페이지로 이동하는 기능
 *  2. 자식 요소가 전달되면 그 요소를 버튼 내부에 표시
 */
const BackButton = ({ className = "", children }) => {
  const navigate = useNavigate();

  return (
    <button className={`back-button ${className}`} onClick={() => navigate(-1)}>
      {children || (
        <>
          <i className="fas fa-arrow-left"></i> 돌아가기
        </>
      )}
    </button>
  );
};

export default BackButton;
