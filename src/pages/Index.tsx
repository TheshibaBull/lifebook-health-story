import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check authentication and redirect accordingly
    const isAuthenticated = localStorage.getItem('user-authenticated');
    const hasCompletedProfile = localStorage.getItem('user-profile');
    
    // Only redirect if user is authenticated - let unauthenticated users see the landing page
    if (isAuthenticated) {
      if (hasCompletedProfile) {
        navigate('/dashboard');
      } else {
        navigate('/create-profile');
      }
    }
    // Remove the onboarding check - let users see the main landing page
  }, [navigate]);

  const handleGetStarted = () => {
    // Navigate directly to the dashboard (app homepage)
    navigate('/dashboard');
  };

  const content = isMobile ? (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
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
          <Button onClick={handleGetStarted} className="w-full">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Mobile Features */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-lg mb-2">Mobile Optimized</h3>
            <p className="text-gray-600 text-sm">Access your health records anywhere, anytime with our mobile-first design.</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-sm">Your health data is encrypted and secure, following healthcare privacy standards.</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600 text-sm">Get personalized health insights and recommendations powered by AI.</p>
          </div>
        </div>

        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            Your comprehensive health companion
          </p>
        </div>
      </div>
    </div>
  ) : (
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
        <Button onClick={handleGetStarted} size="lg">
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout title="Welcome" showTabBar={false}>
      {content}
    </AppLayout>
  );
};

export default Index;