import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  TrendingUp, 
  Calendar, 
  Shield,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { QuickEmergencyAccess } from '@/components/QuickEmergencyAccess';
import { AppLayout } from '@/components/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { UserProfileService } from '@/services/userProfileService';
import { RecentRecords } from '@/components/RecentRecords';

const Dashboard = () => {
  const [profile, setProfile] = useState<Tables<'user_profiles'> | null>(null);
  const [healthRecords, setHealthRecords] = useState<Tables<'health_records'>[]>([]);
  const [healthScore, setHealthScore] = useState(87);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    loadDashboardData();
  }, [user, isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Ensure user profile exists, create if needed
      const userProfile = await UserProfileService.ensureProfileExists(
        user.id, 
        user.email || '', 
        user.user_metadata
      );
      setProfile(userProfile);

      // Load health records
      const { data: records, error: recordsError } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;
      setHealthRecords(records || []);

      // Get unread notifications count
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('read', false);

      if (notificationsError) throw notificationsError;
      setUnreadNotifications(notifications?.length || 0);

      // Calculate basic health score based on available data
      const recordsCount = records?.length || 0;
      const baseScore = Math.min(50 + recordsCount * 5, 95);
      setHealthScore(baseScore);

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToHealthScore = () => {
    navigate('/health-score');
  };

  if (loading) {
    return (
      <AppLayout title="Health Dashboard" showTabBar={true}>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-card flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your health dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const dashboardContent = isMobile ? (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-card">
      {/* Welcome Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Good Morning{profile && profile.first_name ? `, ${profile.first_name}` : ''}!
          </h1>
          <p className="text-muted-foreground text-sm">Here's your health overview today</p>
        </div>
      </div>

      {/* Health Stats Cards - Mobile Optimized */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Card 
            className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white overflow-hidden relative cursor-pointer transform hover:scale-[1.02]"
            onClick={navigateToHealthScore}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <Heart className="w-8 h-8 mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">{healthScore}</div>
                  <div className="text-sm opacity-90">Health Score</div>
                  <div className="text-xs opacity-75 mt-1">
                    {healthScore >= 80 ? 'Excellent condition' : 
                     healthScore >= 60 ? 'Good condition' : 'Needs attention'}
                  </div>
                </div>
                <div className="text-right opacity-60">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <CardContent className="p-4 relative z-10">
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 mb-2 mx-auto opacity-90" />
                  <div className="text-xl font-bold mb-1">{healthRecords.length}</div>
                  <div className="text-xs opacity-90">Records</div>
                  <div className="text-xs opacity-75 mt-1">Total uploaded</div>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <CardContent className="p-4 relative z-10">
                <div className="text-center">
                  <Calendar className="w-6 h-6 mb-2 mx-auto opacity-90" />
                  <div className="text-xl font-bold mb-1">{unreadNotifications}</div>
                  <div className="text-xs opacity-90">Notifications</div>
                  <div className="text-xs opacity-75 mt-1">Unread</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Records */}
        <div className="px-6 mb-8">
          <RecentRecords />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Button 
            onClick={() => navigate('/records')}
            className="h-auto py-4 flex flex-col gap-2 bg-card text-card-foreground hover:bg-accent shadow-md"
            variant="outline"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">View Records</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/family')}
            className="h-auto py-4 flex flex-col gap-2 bg-card text-card-foreground hover:bg-accent shadow-md"
            variant="outline"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Family Health</span>
          </Button>
        </div>
      </div>

      {/* Emergency Access */}
      <div className="px-6 pb-8">
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2 justify-center">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              Emergency Access
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">Quick access to critical health information</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <QuickEmergencyAccess />
          </CardContent>
        </Card>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome back{profile && profile.first_name ? `, ${profile.first_name}` : ''}!
          </h1>
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
              <Card 
                className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative cursor-pointer"
                onClick={navigateToHealthScore}
              >
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
                  <div className="text-3xl font-bold mb-2">{healthScore}</div>
                  <p className="text-sm text-white/90">
                    {healthScore >= 80 ? 'Excellent condition' : 
                     healthScore >= 60 ? 'Good condition' : 'Needs attention'}
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <div className="text-3xl font-bold mb-2">{healthRecords.length}</div>
                  <p className="text-sm text-white/90">Total uploaded</p>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <div className="text-3xl font-bold mb-2">{unreadNotifications}</div>
                  <p className="text-sm text-white/90">Unread</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Records */}
            <RecentRecords className="shadow-lg" />
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

  return (
    <AppLayout title="Health Dashboard" showTabBar={true}>
      {dashboardContent}
    </AppLayout>
  );
};

export default Dashboard;