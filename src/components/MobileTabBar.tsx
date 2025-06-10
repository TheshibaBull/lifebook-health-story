
import { Heart, FileText, Users, Settings, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: Heart, label: 'Health', path: '/dashboard' },
    { icon: FileText, label: 'Records', path: '/upload-record' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Users, label: 'Family', path: '/family' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                active 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { MobileTabBar };
