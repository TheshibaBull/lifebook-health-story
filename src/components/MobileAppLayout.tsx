
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileTabBar } from './MobileTabBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileAppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showTabBar?: boolean;
  showHeader?: boolean;
  className?: string;
}

const MobileAppLayout = ({ 
  children, 
  title, 
  showTabBar = true, 
  showHeader = true,
  className 
}: MobileAppLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-generate title from route
  const getPageTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    switch (path) {
      case '/dashboard': return 'Health Dashboard';
      case '/upload-record': return 'Upload Record';
      case '/settings': return 'Settings';
      case '/family': return 'Family Health';
      case '/search': return 'Search Records';
      default: return 'Lifebook Health';
    }
  };

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && (
        <MobileHeader 
          title={getPageTitle()}
          className={cn(
            "transition-all duration-200",
            isScrolled && "shadow-sm bg-white/95 backdrop-blur-sm"
          )}
        />
      )}
      
      <main className={cn(
        "flex-1 overflow-x-hidden",
        showTabBar && "pb-20", // Account for tab bar height
        className
      )}>
        <div className="safe-area-inset">
          {children}
        </div>
      </main>

      {showTabBar && <MobileTabBar />}
    </div>
  );
};

export { MobileAppLayout };
