
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface MobileHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const MobileHeader = ({ title, onMenuClick }: MobileHeaderProps) => {
  const [notificationCount] = useState(3); // Mock notification count

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button variant="ghost" size="sm" onClick={onMenuClick}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <NotificationDropdown 
              trigger={
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium min-w-[20px]"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { MobileHeader };
