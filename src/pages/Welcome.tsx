
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-12 h-12 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Lifebook Health</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Welcome to Lifebook Health</p>
          <p className="text-lg text-gray-500">Your lifelong health record, all in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
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
            className="px-8 py-6 text-lg"
            onClick={() => navigate('/auth')}
          >
            Get Started
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Secure • Private • HIPAA Compliant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
