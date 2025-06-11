
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  showArrow?: boolean;
  className?: string;
  onClick?: () => void;
}

const MobileCard = ({
  title,
  subtitle,
  icon,
  children,
  showArrow = false,
  className,
  onClick
}: MobileCardProps) => {
  return (
    <Card 
      className={cn(
        "border-0 shadow-sm bg-white",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <div className="font-semibold">{title}</div>
              {subtitle && (
                <div className="text-xs text-gray-500 font-normal">{subtitle}</div>
              )}
            </div>
          </div>
          {showArrow && (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

export { MobileCard };
