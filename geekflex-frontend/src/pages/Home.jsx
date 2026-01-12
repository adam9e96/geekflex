import React from "react";
import TopRatedMovies from "@components/home/TopRatedMovies";
import NowPlayingMovies from "@components/home/NowPlayingMovies";
import "@styles/home/home.css";

/**
 * 홈페이지 메인 컴포넌트
 */
const Home = () => {
  return (
    <div className="home-page">
      <section className="home-banner">
        <div className="home-banner__content">
          <h1 className="home-banner__title">GeekFlex</h1>
          <p className="home-banner__subtitle">당신이 찾던 모든 영화와 드라마</p>
          <p className="home-banner__description">
            최신 영화부터 클래식까지, 다양한 콘텐츠를 만나보세요
          </p>
        </div>
        <div className="home-banner__overlay"></div>
      </section>
      <TopRatedMovies />
      <NowPlayingMovies />
    </div>
  );
};

export default Home;
