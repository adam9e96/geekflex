import React from "react";
import TopRatedMovies from "@components/home/TopRatedMovies/TopRatedMovies.jsx";
import NowPlayingMovies from "@components/home/NowPlayingMovies/NowPlayingMovies.jsx";
import styles from "./Home.module.css";

/**
 * 홈페이지 메인 컴포넌트
 */
const Home = () => {
  return (
    <div className={styles.homePage}>
      <section className={styles.homeBanner}>
        <div className={styles.homeBannerContent}>
          <h1 className={styles.homeBannerTitle}>GeekFlex</h1>
          <p className={styles.homeBannerSubtitle}>당신이 찾던 모든 영화와 드라마</p>
          <p className={styles.homeBannerDescription}>
            최신 영화부터 클래식까지, 다양한 콘텐츠를 만나보세요
          </p>
        </div>
        <div className={styles.homeBannerOverlay}></div>
      </section>
      <TopRatedMovies />
      <NowPlayingMovies />
    </div>
  );
};

export default Home;
