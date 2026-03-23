import { useEffect, useRef } from "react";
import { clearTokens } from "@utils/auth";

/**
 * URL 쿼리 파라미터(error, logout, expired)를 확인하고
 * 그에 따른 적절한 메시지를 설정하는 커스텀 훅
 *
 * @param {Object} actions - 상태 업데이트 함수들
 * @param {Function} actions.setLoginError - 로그인 에러 메시지 설정 함수
 * @param {Function} actions.setLogoutMessage - 로그아웃 메시지 설정 함수
 */
export const useAuthUrlParams = ({ setLoginError, setLogoutMessage }) => {
  // useEffect가 마운트 될 때 한 번만 실행되도록 보장하기 위해 ref 사용 (Strict Mode 대응 등)
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const performChecks = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get("error");
      const logout = urlParams.get("logout");
      const expired = urlParams.get("expired");

      let hasUpdates = false;

      if (error) {
        setLoginError("아이디(이메일) 또는 비밀번호가 올바르지 않습니다.");
        hasUpdates = true;
      }

      if (logout) {
        setLogoutMessage("로그아웃되었습니다.");
        clearTokens();
        hasUpdates = true;
      }

      if (expired) {
        setLoginError("세션이 만료되었습니다. 다시 로그인해주세요.");
        clearTokens();
        hasUpdates = true;
      }

      if (hasUpdates) {
        // URL을 정리하여 새로고침 시 메시지가 다시 뜨지 않도록 함 (선택적 UX 개선)
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    };

    // 비동기로 실행하여 렌더링 사이클과 분리
    const timeoutId = setTimeout(() => {
      performChecks();
      processedRef.current = true;
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [setLoginError, setLogoutMessage]);
};
