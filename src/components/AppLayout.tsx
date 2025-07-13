import { useIsMobile } from '@/hooks/use-mobile';
import { MainNavigation } from './MainNavigation';
import { MobileAppLayout } from './MobileAppLayout';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showTabBar?: boolean;
  showHeader?: boolean;
  className?: string;
}

export const AppLayout = ({ 
  children, 
  title, 
  showTabBar = true, 
  showHeader = true,
  className 
}: AppLayoutProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileAppLayout 
        title={title}
        showTabBar={showTabBar} 
        showHeader={showHeader}
        className={className}
      >
        {children}
      </MobileAppLayout>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <MainNavigation />
      <main>
        {children}
      </main>
    </div>
  );
};
