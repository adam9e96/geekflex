import React, { useState, useEffect, useCallback } from "react";
import { getAccessToken } from "@utils/auth";
import LoadingSpinner from "@components/ui/LoadingSpinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import "../styles/user-management.css";

/**
 * 회원 관리 섹션
 *
 * 기능:
 * - 회원 목록 조회
 * - 회원 검색
 * - 회원 상세 정보
 * - 회원 상태 변경 (활성화/비활성화)
 */
const UserManagementSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      const params = new URLSearchParams({
        page: currentPage - 1,
        size: usersPerPage,
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/v1/admin/users?${params.toString()}`, {
        method: "GET",
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
      setUsers(data.content || data.users || []);
      setTotalPages(data.totalPages || Math.ceil((data.totalElements || 0) / usersPerPage));
    } catch (err) {
      setError(err.message || "회원 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, usersPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleUserAction = async (userId, action) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch(`/api/v1/admin/users/${userId}/${action}`, {
        method: "PUT",
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

      // 사용자 목록 새로고침
      await fetchUsers();

      if (selectedUser?.id === userId) {
        const updatedUser = await fetchUserDetail(userId);
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      alert(err.message || "작업 실행 중 오류가 발생했습니다.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("사용자 정보를 불러올 수 없습니다.");
      }

      return await response.json();
    } catch (err) {
      console.error("사용자 상세 정보 조회 오류:", err);
      return null;
    }
  };

  const handleUserClick = async (user) => {
    const detail = await fetchUserDetail(user.id);
    setSelectedUser(detail || user);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="user-management-section">
      <div className="user-management-section__header">
        <h2 className="user-management-section__title">회원 관리</h2>
        <p className="user-management-section__description">
          회원 목록을 조회하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="user-management-section__search">
        <form onSubmit={handleSearch} className="user-search-form">
          <input
            type="text"
            className="user-search-form__input"
            placeholder="이메일, 닉네임으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="user-search-form__button">
            검색
          </button>
        </form>
      </div>

      {loading && <LoadingSpinner message="회원 목록을 불러오는 중..." />}

      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          <div className="user-management-section__content">
            <div className="user-list">
              <div className="user-list__header">
                <div className="user-list__header-cell">이메일</div>
                <div className="user-list__header-cell">닉네임</div>
                <div className="user-list__header-cell">가입일</div>
                <div className="user-list__header-cell">상태</div>
                <div className="user-list__header-cell">작업</div>
              </div>

              <div className="user-list__body">
                {users.length === 0 ? (
                  <div className="user-list__empty">회원이 없습니다.</div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className={`user-list__row ${selectedUser?.id === user.id ? "selected" : ""}`}
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="user-list__cell">{user.email || "-"}</div>
                      <div className="user-list__cell">{user.nickname || "-"}</div>
                      <div className="user-list__cell">
                        {formatDate(user.createdAt || user.joinDate)}
                      </div>
                      <div className="user-list__cell">
                        <span
                          className={`user-status ${user.enabled !== false ? "active" : "inactive"}`}
                        >
                          {user.enabled !== false ? "활성" : "비활성"}
                        </span>
                      </div>
                      <div className="user-list__cell">
                        <div className="user-actions">
                          <button
                            className={`user-action-button ${user.enabled !== false ? "disable" : "enable"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserAction(
                                user.id,
                                user.enabled !== false ? "disable" : "enable",
                              );
                            }}
                            disabled={actionLoading[user.id]}
                          >
                            {actionLoading[user.id] ? (
                              <span className="spinner-small"></span>
                            ) : user.enabled !== false ? (
                              "비활성화"
                            ) : (
                              "활성화"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedUser && (
              <div className="user-detail">
                <div className="user-detail__header">
                  <h3 className="user-detail__title">회원 상세 정보</h3>
                  <button className="user-detail__close" onClick={() => setSelectedUser(null)}>
                    ✕
                  </button>
                </div>
                <div className="user-detail__content">
                  <div className="user-detail__field">
                    <label>이메일</label>
                    <div>{selectedUser.email || "-"}</div>
                  </div>
                  <div className="user-detail__field">
                    <label>닉네임</label>
                    <div>{selectedUser.nickname || "-"}</div>
                  </div>
                  <div className="user-detail__field">
                    <label>가입일</label>
                    <div>{formatDate(selectedUser.createdAt || selectedUser.joinDate)}</div>
                  </div>
                  <div className="user-detail__field">
                    <label>상태</label>
                    <div>
                      <span
                        className={`user-status ${selectedUser.enabled !== false ? "active" : "inactive"}`}
                      >
                        {selectedUser.enabled !== false ? "활성" : "비활성"}
                      </span>
                    </div>
                  </div>
                  {selectedUser.role && (
                    <div className="user-detail__field">
                      <label>권한</label>
                      <div>{selectedUser.role}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="user-management-section__pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                이전
              </button>
              <span className="pagination-info">
                {currentPage} / {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserManagementSection;
