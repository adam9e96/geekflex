import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@stores/authStore";

/**
 * 로그아웃 로직을 처리하는 커스텀 훅
 * @returns {{ handleLogout: (e: React.MouseEvent) => void }}
 * 2026.02.03 검토완료
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = (e) => {
    if (e) e.preventDefault();

    try {
      logout();
      navigate("/");
      // 페이지 새로고침하여 상태 완전히 초기화
      window.location.reload();
    } catch (error) {
      console.error("로그아웃 오류:", error);
      navigate("/");
    }
  };

  return { handleLogout };
};
