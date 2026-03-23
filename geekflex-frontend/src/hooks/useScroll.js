import { useEffect, useState } from "react";
import { throttle } from "@utils/commonUtils";

/**
 * 스크롤 위치에 따라 상태를 반환하는 커스텀 훅
 * @param {number} threshold - 스크롤 임계값 (기본값: 50px)
 * @returns {boolean} isScrolled - 임계값을 넘었는지 여부
 * 2026.02.03 검토완료
 */
export const useScroll = (threshold = 50) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > threshold);
    }, 100);

    // 초기 상태 확인
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
};
