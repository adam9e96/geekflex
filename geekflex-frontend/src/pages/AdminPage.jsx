import React, { useState } from "react";
import ApiSchedulerSection from "@components/admin/components/ApiSchedulerSection";
import UserManagementSection from "@components/admin/components/UserManagementSection";
import "@styles/admin/admin.css";

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
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">
          <span className="admin-page__icon">⚙️</span>
          관리자 페이지
        </h1>
        <p className="admin-page__subtitle">시스템 관리 및 모니터링</p>
      </div>

      <div className="admin-page__tabs">
        <button
          className={`admin-page__tab ${activeTab === "scheduler" ? "active" : ""}`}
          onClick={() => setActiveTab("scheduler")}
        >
          <span className="admin-page__tab-icon">🔄</span>
          API 스케줄러
        </button>
        <button
          className={`admin-page__tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <span className="admin-page__tab-icon">👥</span>
          회원 관리
        </button>
      </div>

      <div className="admin-page__content">
        {activeTab === "scheduler" && <ApiSchedulerSection />}
        {activeTab === "users" && <UserManagementSection />}
      </div>
    </div>
  );
};

export default AdminPage;
