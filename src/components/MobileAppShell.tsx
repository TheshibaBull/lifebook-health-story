
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Shield, Zap, Cloud } from 'lucide-react';

const MobileAppShell = () => {
  const features = [
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "Native-like Experience",
      description: "Touch gestures, animations, and mobile-optimized UI"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure Data Storage",
      description: "End-to-end encryption with local device security"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Offline Support",
      description: "Access your health records even without internet"
    },
    {
      icon: <Cloud className="w-5 h-5" />,
      title: "Auto Sync",
      description: "Seamlessly sync across all your devices"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="text-blue-500" />
          Mobile App Features
          <Badge variant="secondary" className="ml-auto">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {feature.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{feature.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Pro Tip:</strong> Add this app to your home screen for the best mobile experience!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export { MobileAppShell };
