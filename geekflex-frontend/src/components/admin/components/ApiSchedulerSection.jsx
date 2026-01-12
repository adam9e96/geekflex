import React, { useState } from "react";
import { getAccessToken } from "@utils/auth";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import "../styles/api-scheduler.css";

/**
 * API 스케줄러 업데이트 섹션
 *
 * 기능:
 * - TMDB API now-playing 업데이트 요청
 * - 기타 API 스케줄러 수동 실행
 */
const ApiSchedulerSection = () => {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const schedulerTasks = [
    {
      id: "now-playing",
      name: "Now Playing 영화 업데이트",
      description: "TMDB API에서 현재 상영 중인 영화 정보를 가져옵니다.",
      endpoint: "/api/v1/admin/scheduler/now-playing",
      icon: "🎬",
    },
    {
      id: "popular",
      name: "인기 영화 업데이트",
      description: "TMDB API에서 인기 영화 정보를 가져옵니다.",
      endpoint: "/api/v1/admin/scheduler/popular",
      icon: "🔥",
    },
    {
      id: "top-rated",
      name: "평점 높은 영화 업데이트",
      description: "TMDB API에서 평점이 높은 영화 정보를 가져옵니다.",
      endpoint: "/api/v1/admin/scheduler/top-rated",
      icon: "⭐",
    },
    {
      id: "upcoming",
      name: "개봉 예정 영화 업데이트",
      description: "TMDB API에서 개봉 예정 영화 정보를 가져옵니다.",
      endpoint: "/api/v1/admin/scheduler/upcoming",
      icon: "📅",
    },
  ];

  const handleExecute = async (task) => {
    setLoading((prev) => ({ ...prev, [task.id]: true }));
    setErrors((prev) => ({ ...prev, [task.id]: null }));
    setResults((prev) => ({ ...prev, [task.id]: null }));

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch(task.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} 오류가 발생했습니다.`);
      }

      const data = await response.json();
      setResults((prev) => ({
        ...prev,
        [task.id]: {
          success: true,
          message: data.message || "성공적으로 실행되었습니다.",
          data: data,
        },
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [task.id]: error.message || "알 수 없는 오류가 발생했습니다.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [task.id]: false }));
    }
  };

  return (
    <div className="api-scheduler-section">
      <div className="api-scheduler-section__header">
        <h2 className="api-scheduler-section__title">API 스케줄러 관리</h2>
        <p className="api-scheduler-section__description">
          수동으로 API 스케줄러를 실행하여 데이터를 업데이트할 수 있습니다.
        </p>
      </div>

      <div className="api-scheduler-section__tasks">
        {schedulerTasks.map((task) => (
          <div key={task.id} className="api-scheduler-task">
            <div className="api-scheduler-task__header">
              <div className="api-scheduler-task__icon">{task.icon}</div>
              <div className="api-scheduler-task__info">
                <h3 className="api-scheduler-task__name">{task.name}</h3>
                <p className="api-scheduler-task__description">{task.description}</p>
              </div>
            </div>

            <div className="api-scheduler-task__actions">
              <button
                className="api-scheduler-task__button"
                onClick={() => handleExecute(task)}
                disabled={loading[task.id]}
              >
                {loading[task.id] ? (
                  <>
                    <span className="spinner-small"></span>
                    실행 중...
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    실행
                  </>
                )}
              </button>
            </div>

            {errors[task.id] && (
              <div className="api-scheduler-task__error">
                <span className="error-icon">❌</span>
                {errors[task.id]}
              </div>
            )}

            {results[task.id] && (
              <div className="api-scheduler-task__result">
                <span className="success-icon">✅</span>
                {results[task.id].message}
                {results[task.id].data?.count && (
                  <span className="result-count">
                    ({results[task.id].data.count}개 항목 업데이트됨)
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiSchedulerSection;
