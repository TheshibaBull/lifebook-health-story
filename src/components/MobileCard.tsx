
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface MobileCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children?: React.ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const MobileCard = ({ 
  title, 
  subtitle, 
  icon, 
  badge, 
  badgeVariant = 'secondary',
  children, 
  onClick,
  showArrow,
  action 
}: MobileCardProps) => {
  return (
    <Card 
      className={`w-full ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-blue-500">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant={badgeVariant} className="text-xs">
                {badge}
              </Badge>
            )}
            {(onClick || showArrow) && <ChevronRight className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="pt-0">
          {children}
          {action && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.label}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export { MobileCard };
