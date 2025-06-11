
import { ArrowLeft, Menu, Bell, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

const MobileHeader = ({
  title = "Lifebook Health",
  showBack = false,
  showMenu = true,
  showNotifications = true,
  showSearch = false,
  onMenuClick,
  className
}: MobileHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationCount = 3; // Mock notification count

  const handleBackClick = () => {
    if (location.pathname === '/dashboard') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn(
      "lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : showMenu ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          ) : null}
          
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export { MobileHeader };
