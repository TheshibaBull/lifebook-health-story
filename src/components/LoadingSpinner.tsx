import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  textClassName?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className,
  text,
  textClassName
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      {text && (
        <p className={cn("mt-2 text-sm text-muted-foreground", textClassName)}>{text}</p>
      )}
    </div>
  );
};

export const PageLoader = ({ text = 'Loading...', className }: { text?: string, className?: string }) => (
  <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-card", className)}>
    <LoadingSpinner size="xl" text={text} />
  </div>
);