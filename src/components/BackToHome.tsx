
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export const BackToHome = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBackToHome = () => {
    navigate('/');
  };

  // Don't show on mobile as it has tab navigation
  if (isMobile) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      onClick={handleBackToHome}
      className="group mb-6 text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-muted/50 px-3 py-2 h-auto"
    >
      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
      <Home className="w-4 h-4 mr-2 opacity-60" />
      <span className="font-medium">Back to Home</span>
    </Button>
  );
};
