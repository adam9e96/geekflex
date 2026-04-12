import React from "react";
import styles from "./About.module.css";

const featureItems = [
  {
    title: "영화 및 드라마 탐색",
    description: "TMDB 기반의 작품 정보를 바탕으로 인기작부터 최신작까지 빠르게 탐색할 수 있습니다.",
  },
  {
    title: "리뷰 작성과 공유",
    description: "감상 직후의 생각을 별점과 함께 남기고, 다른 사용자와 의견을 나눌 수 있습니다.",
  },
  {
    title: "컬렉션 큐레이션",
    description: "취향에 맞는 작품을 모아 나만의 테마 컬렉션으로 정리하고 공개할 수 있습니다.",
  },
  {
    title: "프로필 기반 발견",
    description: "다른 사용자의 리뷰와 컬렉션을 둘러보며 새로운 작품과 취향을 발견할 수 있습니다.",
  },
];

const stackItems = [
  { name: "React + Vite", description: "빠른 화면 렌더링과 가벼운 프론트엔드 개발 환경" },
  { name: "Spring Boot", description: "인증, 리뷰, 컬렉션, 사용자 기능을 담당하는 백엔드" },
  { name: "TMDB API", description: "영화와 드라마 메타데이터를 안정적으로 제공하는 외부 데이터 소스" },
];

const About = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>GeekFlex 소개</h1>
        <p className={styles.subtitle}>
          작품을 소비하는 데서 끝나지 않고, 감상과 취향을 기록하고 연결하는 영화·드라마 커뮤니티
        </p>
      </header>

      <main>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>GeekFlex는 이런 서비스를 지향합니다</h2>
          <p className={styles.text}>
            GeekFlex는 영화와 드라마를 좋아하는 사람들이 자신의 감상을 더 쉽게 남기고, 다른 사람의 취향을
            탐색하며, 보고 싶은 작품을 더 풍부하게 발견할 수 있도록 만든 서비스입니다.
          </p>
          <p className={styles.text}>
            단순히 평점을 남기는 공간을 넘어, 리뷰와 컬렉션을 통해 취향이 드러나고 연결되는 경험을 목표로
            하고 있습니다.
          </p>
          <div className={styles.infoBox}>
            <h3 className={styles.infoTitle}>핵심 가치</h3>
            <p className={styles.text}>
              빠르게 찾고, 솔직하게 기록하고, 취향으로 연결되는 경험. GeekFlex는 이 세 가지 흐름을 가장
              중요하게 생각합니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>주요 기능</h2>
          <ul className={styles.list}>
            {featureItems.map((item) => (
              <li key={item.title} className={styles.listItem}>
                <strong>{item.title}:</strong> {item.description}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>이용 흐름</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>관심 있는 영화나 드라마를 검색하고 작품 정보를 확인합니다.</li>
            <li className={styles.listItem}>감상 후 리뷰를 남기고 별점으로 인상을 기록합니다.</li>
            <li className={styles.listItem}>마음에 드는 작품을 컬렉션으로 묶어 나만의 취향 지도를 만듭니다.</li>
            <li className={styles.listItem}>다른 사용자의 리뷰와 컬렉션을 보며 새로운 작품을 발견합니다.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기술 구성</h2>
          <div className={styles.techGrid}>
            {stackItems.map((item) => (
              <div key={item.name} className={styles.techCard}>
                <h3 className={styles.techTitle}>{item.name}</h3>
                <p className={styles.techDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>문의 및 제안</h2>
          <p className={styles.text}>
            서비스 이용 중 불편한 점이 있거나 기능 제안이 있다면 아래 메일로 보내주세요. 사용자 경험을 더
            나아지게 만드는 의견을 꾸준히 반영하고 있습니다.
          </p>
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
