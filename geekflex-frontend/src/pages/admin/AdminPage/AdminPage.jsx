import React, { useState } from "react";
import ApiSchedulerSection from "@components/admin/ApiSchedulerSection/ApiSchedulerSection";
import UserManagementSection from "@components/admin/UserManagementSection/UserManagementSection";
import styles from "./AdminPage.module.css";

/**
 * 관리자 페이지 컴포넌트
 *
 * 기능:
 * - API 스케줄러 업데이트 요청
 * - 회원 관리
 * - 기타 관리자 기능
 */
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("scheduler");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.icon}>⚙️</span>
          관리자 페이지
        </h1>
        <p className={styles.subtitle}>시스템 관리 및 모니터링</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "scheduler" ? styles.active : ""}`}
          onClick={() => setActiveTab("scheduler")}
        >
          <span className={styles.tabIcon}>🔄</span>
          API 스케줄러
        </button>
        <button
          className={`${styles.tab} ${activeTab === "users" ? styles.active : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <span className={styles.tabIcon}>👥</span>
          회원 관리
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "scheduler" && <ApiSchedulerSection />}
        {activeTab === "users" && <UserManagementSection />}
      </div>
    </div>
  );
};

export default AdminPage;
