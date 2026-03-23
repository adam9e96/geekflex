import React, { useState } from "react";
import { authenticatedApi } from "@services/apiClient";
import LoadingSpinner from "@components/ui/LoadingSpinner/LoadingSpinner";
import styles from "./ApiSchedulerSection.module.css";

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
      // authenticatedApi가 토큰을 자동 관리하므로 수동으로 getAccessToken() 할 필요 없음
      const response = await authenticatedApi.post(task.endpoint);

      const data = response.data;

      setResults((prev) => ({
        ...prev,
        [task.id]: {
          success: true,
          message: data.message || "성공적으로 실행되었습니다.",
          data: data,
        },
      }));
    } catch (error) {
      // axios 에러 객체 처리
      const errorMessage =
        error.response?.data?.message || error.message || "알 수 없는 오류가 발생했습니다.";
      setErrors((prev) => ({
        ...prev,
        [task.id]: errorMessage,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [task.id]: false }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>API 스케줄러 관리</h2>
        <p className={styles.description}>
          수동으로 API 스케줄러를 실행하여 데이터를 업데이트할 수 있습니다.
        </p>
      </div>

      <div className={styles.taskList}>
        {schedulerTasks.map((task) => (
          <div key={task.id} className={styles.task}>
            <div className={styles.taskHeader}>
              <div className={styles.taskIcon}>{task.icon}</div>
              <div className={styles.taskInfo}>
                <h3 className={styles.taskName}>{task.name}</h3>
                <p className={styles.taskDescription}>{task.description}</p>
              </div>
            </div>

            <div className={styles.taskActions}>
              <button
                className={styles.taskButton}
                onClick={() => handleExecute(task)}
                disabled={loading[task.id]}
              >
                {loading[task.id] ? (
                  <>
                    <span className={styles.spinnerSmall}></span>
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
              <div className={styles.taskError}>
                <span className={styles.errorIcon}>❌</span>
                {errors[task.id]}
              </div>
            )}

            {results[task.id] && (
              <div className={styles.taskResult}>
                <span className={styles.successIcon}>✅</span>
                {results[task.id].message}
                {results[task.id].data?.count && (
                  <span className={styles.resultCount}>
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
