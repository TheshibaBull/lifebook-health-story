
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Heart, 
  Menu, 
  Home, 
  BarChart3, 
  Upload, 
  Search, 
  Users, 
  Settings,
  Bell,
  User
} from 'lucide-react';

const navigationItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Dashboard', path: '/dashboard', icon: Heart },
  { name: 'Health Score', path: '/health-score', icon: BarChart3 },
  { name: 'Upload Record', path: '/upload-record', icon: Upload },
  { name: 'Search', path: '/search', icon: Search },
  { name: 'Family', path: '/family', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

export const MainNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                <span className="text-lg font-semibold">Lifebook Health</span>
              </div>
            </div>
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      onClick={() => handleNavigate(item.path)}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  );
                })}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavigate('/')}
            >
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold">Lifebook Health</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className="gap-2"
                    onClick={() => handleNavigate(item.path)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('/notifications')}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('/settings')}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
