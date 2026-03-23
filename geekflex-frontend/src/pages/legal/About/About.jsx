import React from "react";
import styles from "./About.module.css";

/**
 * 사용정보 페이지 컴포넌트
 * GeekFlex에 대한 간단한 소개를 제공합니다.
 */
const About = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>GeekFlex 소개</h1>
        <p className={styles.subtitle}>영화와 드라마를 사랑하는 모든 이를 위한 리뷰 플랫폼</p>
      </header>

      <main>
        {/* 서비스 소개 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>서비스 소개</h2>
          <p className={styles.text}>
            GeekFlex는 영화와 드라마를 사랑하는 모든 이를 위한 리뷰 플랫폼입니다. 최신 작품부터
            클래식까지, 다양한 콘텐츠에 대한 리뷰를 작성하고 공유할 수 있습니다.
          </p>
        </section>

        {/* 주요 기능 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>주요 기능</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <strong>영화 및 드라마 검색:</strong> TMDB API를 활용한 풍부한 콘텐츠 정보 제공
            </li>
            <li className={styles.listItem}>
              <strong>리뷰 작성 및 공유:</strong> 다양한 형식의 리뷰 작성 및 다른 사용자와 공유
            </li>
            <li className={styles.listItem}>
              <strong>컬렉션 관리:</strong> 좋아하는 작품들을 모아 나만의 컬렉션 만들기
            </li>
            <li className={styles.listItem}>
              <strong>사용자 프로필:</strong> 다른 사용자의 리뷰와 컬렉션 탐색
            </li>
          </ul>
        </section>

        {/* 기술 스택 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기술 스택</h2>
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <h3 className={styles.techTitle}>React</h3>
              <p className={styles.techDescription}>프론트엔드 프레임워크</p>
            </div>
            <div className={styles.techCard}>
              <h3 className={styles.techTitle}>Spring Boot</h3>
              <p className={styles.techDescription}>백엔드 프레임워크</p>
            </div>
            <div className={styles.techCard}>
              <h3 className={styles.techTitle}>TMDB API</h3>
              <p className={styles.techDescription}>영화/드라마 데이터 제공</p>
            </div>
          </div>
        </section>

        {/* 문의 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>문의</h2>
          <p className={styles.text}>문의사항이나 제안사항이 있으시면 언제든지 연락해 주세요.</p>
          <div className={styles.contact}>
            <p className={styles.contactItem}>
              <strong>이메일:</strong>{" "}
              <a href="mailto:adam9e96@gmail.com" className={styles.link}>
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
