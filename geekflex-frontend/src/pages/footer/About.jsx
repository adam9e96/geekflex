import React from "react";
import "../../styles/footer/about.css";

/**
 * 사용정보 페이지 컴포넌트
 * GeekFlex에 대한 간단한 소개를 제공합니다.
 */
const About = () => {
  return (
    <div className="about-page">
      <header className="about-page__header">
        <h1 className="about-page__title">GeekFlex 소개</h1>
        <p className="about-page__subtitle">영화와 드라마를 사랑하는 모든 이를 위한 리뷰 플랫폼</p>
      </header>

      <main className="about-page__content">
        {/* 서비스 소개 */}
        <section className="about-page__section">
          <h2 className="about-page__section-title">서비스 소개</h2>
          <p className="about-page__text">
            GeekFlex는 영화와 드라마를 사랑하는 모든 이를 위한 리뷰 플랫폼입니다. 
            최신 작품부터 클래식까지, 다양한 콘텐츠에 대한 리뷰를 작성하고 공유할 수 있습니다.
          </p>
        </section>

        {/* 주요 기능 */}
        <section className="about-page__section">
          <h2 className="about-page__section-title">주요 기능</h2>
          <ul className="about-page__list">
            <li className="about-page__list-item">
              <strong>영화 및 드라마 검색:</strong> TMDB API를 활용한 풍부한 콘텐츠 정보 제공
            </li>
            <li className="about-page__list-item">
              <strong>리뷰 작성 및 공유:</strong> 다양한 형식의 리뷰 작성 및 다른 사용자와 공유
            </li>
            <li className="about-page__list-item">
              <strong>컬렉션 관리:</strong> 좋아하는 작품들을 모아 나만의 컬렉션 만들기
            </li>
            <li className="about-page__list-item">
              <strong>사용자 프로필:</strong> 다른 사용자의 리뷰와 컬렉션 탐색
            </li>
          </ul>
        </section>

        {/* 기술 스택 */}
        <section className="about-page__section">
          <h2 className="about-page__section-title">기술 스택</h2>
          <div className="about-page__tech-grid">
            <div className="about-page__tech-card">
              <h3 className="about-page__tech-title">React</h3>
              <p className="about-page__tech-description">프론트엔드 프레임워크</p>
            </div>
            <div className="about-page__tech-card">
              <h3 className="about-page__tech-title">Spring Boot</h3>
              <p className="about-page__tech-description">백엔드 프레임워크</p>
            </div>
            <div className="about-page__tech-card">
              <h3 className="about-page__tech-title">TMDB API</h3>
              <p className="about-page__tech-description">영화/드라마 데이터 제공</p>
            </div>
          </div>
        </section>

        {/* 문의 */}
        <section className="about-page__section">
          <h2 className="about-page__section-title">문의</h2>
          <p className="about-page__text">
            문의사항이나 제안사항이 있으시면 언제든지 연락해 주세요.
          </p>
          <div className="about-page__contact">
            <p className="about-page__contact-item">
              <strong>이메일:</strong>{" "}
              <a href="mailto:adam9e96@gmail.com" className="about-page__link">
                adam9e96@gmail.com
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
