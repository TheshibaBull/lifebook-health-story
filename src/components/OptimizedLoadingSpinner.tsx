import { memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  showText?: boolean;
}

const OptimizedLoadingSpinner = memo(({ 
  size = 'md', 
  className,
  text,
  showText = true
}: OptimizedLoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )}
        aria-label="Loading"
      />
      {showText && text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
});

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner';

export const OptimizedPageLoader = memo(({ text = 'Loading...' }: { text?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-card">
    <OptimizedLoadingSpinner size="lg" text={text} />
  </div>
));

OptimizedPageLoader.displayName = 'OptimizedPageLoader';

export { OptimizedLoadingSpinner };