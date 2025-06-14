
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  TrendingUp, 
  Calendar, 
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { HealthScore } from '@/components/HealthScore';
import { QuickEmergencyAccess } from '@/components/QuickEmergencyAccess';
import { MobileAppLayout } from '@/components/MobileAppLayout';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load health records from localStorage
    const stored = localStorage.getItem('health-records');
    if (stored) {
      setHealthRecords(JSON.parse(stored));
    }
  }, []);

  const handleEmergencyCall = () => {
    toast({
      title: "Emergency Call",
      description: "Calling emergency services...",
    });
  };

  const handleAddEmergencyContact = () => {
    toast({
      title: "Add Emergency Contact",
      description: "Adding a new emergency contact...",
    });
  };

  if (isMobile) {
    return (
      <MobileAppLayout title="Health Dashboard" showTabBar={true}>
        <div className="px-4 py-6 space-y-8 bg-gradient-to-b from-blue-50/30 to-white">
          {/* Health Score Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50">
            <CardContent className="p-6">
              <HealthScore />
            </CardContent>
          </Card>

          {/* Emergency Access */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <QuickEmergencyAccess />
            </CardContent>
          </Card>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Welcome Header */}
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Health Dashboard</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your comprehensive health overview at a glance
          </p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <HealthScore />
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                Health Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-sm text-white/90">Monitor your progress over time</p>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-0 text-white">
                View Trends
              </Button>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-sm text-white/90">Appointments and reminders</p>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-0 text-white">
                View Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Access */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3 justify-center">
              <Shield className="w-6 h-6 text-red-500" />
              Emergency Access
            </CardTitle>
            <p className="text-gray-600 text-center">Quick access to critical health information</p>
          </CardHeader>
          <CardContent>
            <QuickEmergencyAccess />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
