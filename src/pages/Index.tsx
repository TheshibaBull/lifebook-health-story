import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Shield, Users, FileText, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="px-6 pt-16 pb-12 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Lifebook<br />
            <span className="text-blue-600">Health</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-sm mx-auto">
            Your lifetime health record vault—secure, smart, accessible anytime, anywhere.
          </p>
        </div>

        <Button 
          onClick={handleGetStarted} 
          size="lg"
          className="w-full max-w-xs mx-auto h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Features Section */}
      <div className="px-6 pb-16">
        <div className="space-y-6 max-w-sm mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Smart Records</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              AI-powered organization of all your medical documents and health data.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bank-level encryption with HIPAA compliance for your peace of mind.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Family Health</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Manage health records for your entire family in one secure place.
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Lifebook <span className="text-blue-600">Health</span>
            </h1>
            <p className="text-2xl text-gray-600 mb-4 font-medium">
              MediVault: Your lifetime health record vault
            </p>
            <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Secure, smart, accessible anytime, anywhere. Your comprehensive health companion for life.
            </p>
          </div>

          <Button 
            onClick={handleGetStarted} 
            size="lg"
            className="h-16 px-12 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Records</h3>
            <p className="text-gray-600 leading-relaxed">
              AI-powered organization and analysis of all your medical documents, lab results, and health data with intelligent categorization.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Private</h3>
            <p className="text-gray-600 leading-relaxed">
              Bank-level encryption with HIPAA compliance ensures your sensitive health information remains private and secure at all times.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Family Health</h3>
            <p className="text-gray-600 leading-relaxed">
              Comprehensive family health management with secure sharing, emergency access, and collaborative care coordination.
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16">
          <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Healthcare Grade</span>
            </div>
          </div>
        </div>
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