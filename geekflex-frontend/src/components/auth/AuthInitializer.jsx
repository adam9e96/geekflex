import { useEffect } from "react";
import { useAuthStore } from "@stores/authStore";

/**
 * 인증 상태 초기화 컴포넌트
 *
 * 역할:
 * 컴포넌트 마운트 시 인증 상태를 확인하고 필요한 초기 데이터(프로필 등)를 가져옵니다.
 * Zustand Store의 액션들이 상태 관리를 담당하므로, 여기서는 초기 트리거만 수행합니다.
 */
const AuthInitializer = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // 앱 시작 시 한 번만 인증 상태 체크
    checkAuth();
  }, [checkAuth]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};

export default AuthInitializer;
