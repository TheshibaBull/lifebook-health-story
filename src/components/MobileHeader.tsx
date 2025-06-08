
import { Button } from '@/components/ui/button';
import { Heart, Menu, Bell } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

const MobileHeader = ({ title, showMenu = true, onMenuClick }: MobileHeaderProps) => {
  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button variant="ghost" size="sm" onClick={onMenuClick}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="font-bold text-lg">{title}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export { MobileHeader };
