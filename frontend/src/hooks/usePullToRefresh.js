import { useEffect, useRef, useState } from "react";

export function usePullToRefresh({ onRefresh, threshold = 80 }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    let touchStartY = 0;
    let touchMoveY = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        isDragging = true;
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging || window.scrollY > 0) {
        if (window.scrollY > 0) {
          isDragging = false;
          isPulling.current = false;
          setPullProgress(0);
        }
        return;
      }

      const deltaY = e.touches[0].clientY - touchStartY;

      if (deltaY > 10) {
        isPulling.current = true;
        e.preventDefault();
      }

      if (deltaY > 0) {
        const progress = Math.min(deltaY / threshold, 1);
        setPullProgress(progress);
        touchMoveY = deltaY;
      }
    };

    const handleTouchEnd = () => {
      if (isPulling.current && pullProgress >= 0.8) {
        setIsRefreshing(true);
        setPullProgress(1);
        onRefresh().finally(() => {
          setIsRefreshing(false);
          setPullProgress(0);
        });
      } else {
        setPullProgress(0);
      }

      isDragging = false;
      isPulling.current = false;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh, pullProgress, threshold]);

  const pullIndicator = pullProgress > 0 || isRefreshing;

  return {
    isRefreshing,
    pullProgress,
    pullIndicator,
  };
}
