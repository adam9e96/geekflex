import { useEffect, useRef } from "react";
import { useAuthStore } from "@stores/authStore";

/**
 * 인증 상태 초기화 컴포넌트
 * 
 * 역할:
 * 1. 컴포넌트 마운트 시 인증 상태 확인 및 프로필 정보 가져오기
 * 2. Zustand store의 인증 상태 변경을 구독하여 자동으로 상태 동기화
 * 
 * 실행 순서:
 * 1. 컴포넌트 마운트 시 비동기로 checkAuth() 호출
 * 2. Zustand store의 isAuthenticated 상태 변경을 구독
 * 3. 언마운트 시 구독 해제
 */
const AuthInitializer = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const prevIsAuthenticated = useRef(null);

  /**
   * 초기 마운트 시 인증 상태 확인
   * 
   * 실행 순서:
   * 1. 컴포넌트 마운트 시 1회 실행
   * 2. 비동기로 checkAuth() 호출하여 인증 상태 확인 및 프로필 정보 가져오기
   */
  useEffect(() => {
    // 비동기로 처리하여 렌더링 사이클과 분리
    const timer = setTimeout(() => {
      checkAuth();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkAuth]);

  /**
   * 인증 상태 동기화를 위한 Zustand store 구독
   * 
   * 실행 순서:
   * 1. 컴포넌트 마운트 시 실행
   * 2. Zustand store의 isAuthenticated 상태 변경을 구독
   * 3. 언마운트 시 구독 해제
   * 
   * 동작:
   * - isAuthenticated 상태가 변경될 때마다 checkAuth() 자동 호출
   * - 로그인/로그아웃 시 상태 변경 감지하여 인증 상태 재확인
   * - 무한 루프 방지를 위해 이전 값과 비교
   */
  useEffect(() => {
    // 초기값 설정
    const currentState = useAuthStore.getState();
    prevIsAuthenticated.current = currentState.isAuthenticated;

    // Zustand store 구독
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        // 이전 값과 동일하면 무시 (무한 루프 방지)
        if (prevIsAuthenticated.current === isAuthenticated) {
          return;
        }

        // 상태가 변경되었을 때만 checkAuth() 호출
        prevIsAuthenticated.current = isAuthenticated;
        checkAuth();
      },
      {
        equalityFn: (a, b) => a === b,
      }
    );

    return () => {
      unsubscribe();
    };
  }, [checkAuth]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};

export default AuthInitializer;