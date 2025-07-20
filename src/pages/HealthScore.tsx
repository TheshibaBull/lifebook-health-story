
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  TrendingUp, 
  Activity, 
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { BackToHome } from '@/components/BackToHome';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const HealthScore = () => {
  const [healthScore, setHealthScore] = useState(87);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadHealthData();
    }
  }, [user]);

  const loadHealthData = async () => {
    try {
      const { data: records } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id);
      
      setHealthRecords(records || []);
      
      // Calculate health score based on records
      const recordsCount = records?.length || 0;
      const baseScore = Math.min(50 + recordsCount * 5, 95);
      setHealthScore(baseScore);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <AppLayout title="Health Score">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Health Score">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <BackToHome />
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Health Score</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your overall health status and get personalized insights
            </p>
          </div>

          {/* Main Health Score Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
                    <Heart className="w-8 h-8" />
                    Overall Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className={`text-6xl font-bold mb-4`}>
                    {healthScore}
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2 mb-6">
                    {getScoreStatus(healthScore)}
                  </Badge>
                  <Progress value={healthScore} className="w-full h-3 mb-4" />
                  <p className="text-blue-100">
                    Based on {healthRecords.length} health records and assessments
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Health Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Records Uploaded</span>
                      <span className="font-semibold">{healthRecords.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Completeness</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="font-semibold">Today</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Update Health Metrics</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-green-500" />
                        <span className="text-sm">View Achievements</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">Health Reminders</span>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Physical Health</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">92</div>
                <Progress value={92} className="mb-2" />
                <p className="text-sm text-gray-600">Excellent condition</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Mental Wellness</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">78</div>
                <Progress value={78} className="mb-2" />
                <p className="text-sm text-gray-600">Good balance</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Preventive Care</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">65</div>
                <Progress value={65} className="mb-2" />
                <p className="text-sm text-gray-600">Room for improvement</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HealthScore;
