
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAppLayout } from '@/components/MobileAppLayout';
import { MobileGestureWrapper } from '@/components/MobileGestureWrapper';
import { MobileDeviceIntegration } from '@/components/MobileDeviceIntegration';
import { EnhancedOfflineSync } from '@/components/EnhancedOfflineSync';
import { MobileAppShell } from '@/components/MobileAppShell';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user should be redirected to onboarding or dashboard
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed');
    const isAuthenticated = localStorage.getItem('user-authenticated');
    
    if (!hasCompletedOnboarding) {
      navigate('/onboarding');
    } else if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRefresh = async () => {
    // Simulate refresh action
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.reload();
  };

  if (isMobile) {
    return (
      <MobileAppLayout title="Welcome" showTabBar={false}>
        <MobileGestureWrapper 
          onPullToRefresh={handleRefresh}
          enablePullToRefresh={true}
          className="min-h-screen"
        >
          <div className="p-4 space-y-6">
            {/* Welcome Section */}
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Lifebook Health</h1>
              <p className="text-lg font-medium text-blue-600 mb-4">
                MediVault: Your lifetime health record vault—secure, smart, accessible anytime, anywhere.
              </p>
              <p className="text-gray-600 mb-6">
                Your lifelong health record, now optimized for mobile
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Mobile Features */}
            <div className="space-y-4">
              <MobileAppShell />
              <MobileDeviceIntegration />
              <EnhancedOfflineSync />
            </div>

            <div className="text-center py-6">
              <p className="text-sm text-gray-500">
                Pull down to refresh • Swipe for navigation
              </p>
            </div>
          </div>
        </MobileGestureWrapper>
      </MobileAppLayout>
    );
  }

  // Desktop version remains simple
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">Welcome to Lifebook Health</h1>
        <p className="text-xl font-semibold text-blue-600 mb-4">
          MediVault: Your lifetime health record vault—secure, smart, accessible anytime, anywhere.
        </p>
        <p className="text-xl text-muted-foreground mb-6">
          Your lifelong health record, all in one place
        </p>
        <Button onClick={() => navigate('/auth')} size="lg">
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
