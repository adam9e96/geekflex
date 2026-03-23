import { useEffect } from "react";

/**
 * 모달 등이 열려있을 때 body 스크롤을 막는 훅
 * @param {boolean} isLocked - 스크롤 잠금 여부
 */
export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;

      // html과 body 스크롤 막기
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.position = "fixed";
      document.documentElement.style.top = `-${scrollY}px`;
      document.documentElement.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // 스크롤 복원
      const scrollY = document.documentElement.style.top;

      document.documentElement.style.overflow = "";
      document.documentElement.style.position = "";
      document.documentElement.style.top = "";
      document.documentElement.style.width = "";
      document.body.style.overflow = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // cleanup: 컴포넌트 언마운트 시 항상 복원
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.position = "";
      document.documentElement.style.top = "";
      document.documentElement.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isLocked]);
};
