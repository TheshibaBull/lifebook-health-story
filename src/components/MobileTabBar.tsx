
import { Heart, FileText, Users, Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileTabBar = ({ activeTab, onTabChange }: MobileTabBarProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'timeline', label: 'Timeline', icon: FileText },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'emergency', label: 'Emergency', icon: Shield },
    { id: 'insights', label: 'Score', icon: TrendingUp },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { MobileTabBar };
