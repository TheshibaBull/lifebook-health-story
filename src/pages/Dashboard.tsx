import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  if (isMobile) {
    return (
      <MobileAppLayout title="Health Dashboard" showTabBar={true}>
        <div className="px-4 py-6 space-y-4 bg-gradient-to-b from-blue-50/30 to-white min-h-screen">
          {/* Health Stats Cards - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative p-3">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <CardContent className="p-0 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <Heart className="w-4 h-4 mb-1" />
                  <div className="text-lg font-bold">87</div>
                  <div className="text-xs opacity-90">Health</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative p-3">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <CardContent className="p-0 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="w-4 h-4 mb-1" />
                  <div className="text-lg font-bold">↗ 5%</div>
                  <div className="text-xs opacity-90">Trends</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative p-3">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <CardContent className="p-0 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <Calendar className="w-4 h-4 mb-1" />
                  <div className="text-lg font-bold">3</div>
                  <div className="text-xs opacity-90">Upcoming</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Score Card */}
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-4">
              <HealthScore />
            </CardContent>
          </Card>

          {/* Emergency Access */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2 justify-center">
                <Shield className="w-5 h-5 text-red-500" />
                Emergency Access
              </CardTitle>
              <p className="text-gray-600 text-xs mt-1">Quick access to critical health information</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <QuickEmergencyAccess />
            </CardContent>
          </Card>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Health Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your comprehensive health overview at a glance
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Health Metrics */}
          <div className="xl:col-span-2 space-y-8">
            {/* Health Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <div className="text-3xl font-bold mb-2">87</div>
                  <p className="text-sm text-white/90">Excellent condition</p>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <div className="text-3xl font-bold mb-2">↗ 5%</div>
                  <p className="text-sm text-white/90">Improving daily</p>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <div className="text-3xl font-bold mb-2">3</div>
                  <p className="text-sm text-white/90">This week</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Health Score */}
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                <HealthScore />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Emergency Access */}
          <div className="xl:col-span-1">
            <Card className="border-0 shadow-lg bg-white sticky top-6">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3 justify-center">
                  <Shield className="w-6 h-6 text-red-500" />
                  Emergency Access
                </CardTitle>
                <p className="text-gray-600 text-sm mt-2">Quick access to critical health information</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <QuickEmergencyAccess />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
