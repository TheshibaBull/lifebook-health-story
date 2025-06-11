
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MobileGestureWrapperProps {
  children: React.ReactNode;
  onPullToRefresh?: () => Promise<void>;
  enablePullToRefresh?: boolean;
  className?: string;
}

const MobileGestureWrapper = ({
  children,
  onPullToRefresh,
  enablePullToRefresh = false,
  className
}: MobileGestureWrapperProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enablePullToRefresh) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enablePullToRefresh || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    
    // Only allow pull down when at top of page
    if (window.scrollY === 0 && diff > 0) {
      e.preventDefault();
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  };

  const handleTouchEnd = async () => {
    if (!enablePullToRefresh || isRefreshing) return;
    
    if (pullDistance > 60 && onPullToRefresh) {
      setIsRefreshing(true);
      try {
        await onPullToRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  useEffect(() => {
    if (isRefreshing) {
      setPullDistance(60);
      const timer = setTimeout(() => {
        setPullDistance(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {enablePullToRefresh && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 text-blue-600 transition-all duration-200 z-10"
          style={{
            height: pullDistance,
            transform: `translateY(${pullDistance - 60}px)`
          }}
        >
          {isRefreshing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Refreshing...</span>
            </div>
          ) : (
            <span className="text-sm">
              {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          )}
        </div>
      )}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  );
};

export { MobileGestureWrapper };
