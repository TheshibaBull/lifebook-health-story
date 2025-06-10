
import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileGestureWrapperProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => Promise<void>;
  className?: string;
  enablePullToRefresh?: boolean;
}

const MobileGestureWrapper = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPullToRefresh,
  className,
  enablePullToRefresh = false
}: MobileGestureWrapperProps) => {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enablePullToRefresh) return;
    
    const currentY = e.touches[0].clientY;
    const container = containerRef.current;
    
    if (container && container.scrollTop === 0 && currentY > startY) {
      const distance = Math.min((currentY - startY) * 0.5, 100);
      setPullDistance(distance);
      
      if (distance > 0) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && onPullToRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onPullToRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {enablePullToRefresh && (pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-500 text-white transition-all duration-200 z-10"
          style={{ 
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            transform: `translateY(-${Math.max(60 - pullDistance, isRefreshing ? 0 : 60)}px)`
          }}
        >
          {isRefreshing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Refreshing...</span>
            </div>
          ) : (
            <span className="text-sm">
              {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          )}
        </div>
      )}
      
      <div 
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export { MobileGestureWrapper };
