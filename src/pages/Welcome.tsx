
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, Users, FileText, Accessibility } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('onboarding-completed');
    if (onboardingCompleted === 'true') {
      navigate('/auth');
    }

    // Apply accessibility settings if they exist
    const savedSettings = localStorage.getItem('user-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      if (settings.highContrast) {
        document.body.classList.add('high-contrast');
      }
      
      if (settings.largeText) {
        document.body.classList.add('large-text');
      }
      
      if (settings.reducedMotion) {
        document.body.classList.add('reduce-motion');
      }
    }
  }, [navigate]);

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: "Smart Health Records",
      description: "Upload and organize all your medical documents with AI-powered scanning and labeling."
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: "Family Health Vault", 
      description: "Manage health records for your entire family in one secure location."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Health Timeline",
      description: "View your complete medical history from birth to present day in an organized timeline."
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: "Emergency Access",
      description: "QR code for emergency access to critical health information when you need it most."
    }
  ];

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-12 h-12 text-red-500" aria-hidden="true" />
            <h1 className="text-4xl font-bold text-gray-900">Lifebook Health</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Welcome to Lifebook Health</p>
          <p className="text-lg text-gray-500">Your lifelong health record, all in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              tabIndex={0}
              role="article"
              aria-labelledby={`feature-title-${index}`}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div aria-hidden="true">{feature.icon}</div>
                  <CardTitle id={`feature-title-${index}`} className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg mb-4"
            onClick={handleGetStarted}
            aria-label="Start your health journey with Lifebook Health"
          >
            Get Started
          </Button>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Secure • Private • HIPAA Compliant</span>
            <div className="flex items-center gap-1">
              <Accessibility className="w-4 h-4" aria-hidden="true" />
              <span>Accessibility Ready</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
    </div>
  );
};

export default Welcome;
