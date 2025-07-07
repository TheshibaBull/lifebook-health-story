
import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import { Users, TrendingUp, AlertTriangle, Calendar, Target, Activity, Heart, Smartphone, Watch, Wifi, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FamilyMembersService } from '@/services/familyMembersService';
import { useAuth } from '@/hooks/useAuth';
import type { FamilyMember } from '@/lib/supabase';

interface HealthMetrics {
  steps: number;
  heartRate: number;
  sleepHours: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  weight: number;
  glucose: number;
  exerciseMinutes: number;
}

interface FamilyHealthMember {
  name: string;
  age: number;
  metrics: HealthMetrics;
  devices: string[];
  lastSync: Date;
}

interface HealthTrendData {
  date: string;
  familyScore: number;
  you: number;
  steps: number;
  heartRate: number;
  sleep: number;
  [key: string]: any; // Allow dynamic family member keys
}

const FamilyHealthAnalytics = memo(() => {
  const [familyData, setFamilyData] = useState<FamilyHealthMember[]>([]);
  const [dbFamilyMembers, setDbFamilyMembers] = useState<FamilyMember[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();
  const { user } = useAuth();

  // Load family members from database
  const loadFamilyMembers = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const members = await FamilyMembersService.getFamilyMembers(user.id);
      setDbFamilyMembers(members);
    } catch (error) {
      console.error('Failed to load family members:', error);
    }
  }, [user?.id]);

  // Generate health data based on real family members
  const generateHealthDataFromDB = useCallback((): FamilyHealthMember[] => {
    const healthMembers: FamilyHealthMember[] = [];
    
    // Add user as first member
    healthMembers.push({
      name: 'You',
      age: 35, // Could calculate from date_of_birth if available
      metrics: {
        steps: 8500 + Math.floor(Math.random() * 3000),
        heartRate: 68 + Math.floor(Math.random() * 15),
        sleepHours: 7.2 + Math.random() * 1.5,
        bloodPressureSys: 118 + Math.floor(Math.random() * 20),
        bloodPressureDia: 78 + Math.floor(Math.random() * 15),
        weight: 70 + Math.random() * 5,
        glucose: 95 + Math.floor(Math.random() * 20),
        exerciseMinutes: 45 + Math.floor(Math.random() * 30)
      },
      devices: ['Apple Watch', 'iPhone Health', 'Fitbit'],
      lastSync: new Date(Date.now() - Math.floor(Math.random() * 3600000))
    });

    // Add real family members from database
    dbFamilyMembers.forEach((member) => {
      const age = member.date_of_birth 
        ? new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()
        : 30;
        
      healthMembers.push({
        name: member.name,
        age,
        metrics: {
          steps: 7000 + Math.floor(Math.random() * 4000),
          heartRate: 65 + Math.floor(Math.random() * 20),
          sleepHours: 6.5 + Math.random() * 2,
          bloodPressureSys: 115 + Math.floor(Math.random() * 25),
          bloodPressureDia: 75 + Math.floor(Math.random() * 20),
          weight: 65 + Math.random() * 20,
          glucose: 90 + Math.floor(Math.random() * 30),
          exerciseMinutes: 30 + Math.floor(Math.random() * 40)
        },
        devices: ['Samsung Health', 'Google Fit', 'Fitness Tracker'],
        lastSync: new Date(Date.now() - Math.floor(Math.random() * 7200000))
      });
    });

    return healthMembers;
  }, [dbFamilyMembers]);

  // Calculate dynamic health score based on multiple factors
  const calculateHealthScore = (metrics: HealthMetrics, age: number): number => {
    let score = 100;
    
    // Steps analysis (target: 10,000 steps)
    const stepsScore = Math.min(100, (metrics.steps / 10000) * 100);
    score = score * 0.2 + stepsScore * 0.2;

    // Heart rate analysis (resting HR: 60-100 bpm optimal: 60-80)
    const hrScore = metrics.heartRate >= 60 && metrics.heartRate <= 80 ? 100 : 
                   metrics.heartRate < 60 ? 90 : 
                   metrics.heartRate <= 100 ? 80 : 60;
    score = score * 0.8 + hrScore * 0.15;

    // Sleep analysis (target: 7-9 hours)
    const sleepScore = metrics.sleepHours >= 7 && metrics.sleepHours <= 9 ? 100 :
                      metrics.sleepHours >= 6 && metrics.sleepHours <= 10 ? 85 : 70;
    score = score * 0.85 + sleepScore * 0.15;

    // Blood pressure analysis
    const bpScore = metrics.bloodPressureSys < 120 && metrics.bloodPressureDia < 80 ? 100 :
                   metrics.bloodPressureSys < 130 && metrics.bloodPressureDia < 85 ? 85 :
                   metrics.bloodPressureSys < 140 && metrics.bloodPressureDia < 90 ? 70 : 50;
    score = score * 0.85 + bpScore * 0.2;

    // Exercise analysis (target: 150 min/week = ~22 min/day)
    const exerciseScore = Math.min(100, (metrics.exerciseMinutes / 30) * 100);
    score = score * 0.8 + exerciseScore * 0.15;

    // Glucose analysis (normal: 70-99 mg/dL)
    const glucoseScore = metrics.glucose >= 70 && metrics.glucose <= 99 ? 100 :
                        metrics.glucose <= 125 ? 80 : 60;
    score = score * 0.85 + glucoseScore * 0.15;

    // Age adjustment
    const ageAdjustment = age > 50 ? 0.95 : age > 40 ? 0.98 : 1.0;
    
    return Math.round(score * ageAdjustment);
  };

  // Generate health trend data with pattern analysis
  const generateHealthTrends = useCallback((familyHealthData: FamilyHealthMember[]): HealthTrendData[] => {
    const trends: HealthTrendData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic variations and trends
      const baseVariation = Math.sin(i * 0.2) * 5; // Cyclical pattern
      const randomVariation = (Math.random() - 0.5) * 10; // Random noise
      
      const memberScores = familyHealthData.map((member, index) => 
        calculateHealthScore(member.metrics, member.age) + baseVariation * (0.8 + index * 0.2) + randomVariation
      );
      
      const youScore = memberScores[0] || 75;
      const familyScore = memberScores.length > 0 ? memberScores.reduce((a, b) => a + b, 0) / memberScores.length : 75;
      
      const trendData: any = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        familyScore: Math.max(60, Math.min(100, familyScore)),
        you: Math.max(60, Math.min(100, youScore)),
        steps: (familyHealthData[0]?.metrics.steps || 8000) + Math.floor(Math.random() * 2000),
        heartRate: (familyHealthData[0]?.metrics.heartRate || 70) + Math.floor(Math.random() * 10 - 5),
        sleep: Math.max(5, Math.min(10, (familyHealthData[0]?.metrics.sleepHours || 7.5) + Math.random() * 2 - 1))
      };

      // Add additional family members dynamically
      familyHealthData.slice(1).forEach((member, index) => {
        const memberKey = member.name.toLowerCase().replace(/\s+/g, '');
        trendData[memberKey] = Math.max(60, Math.min(100, memberScores[index + 1] || 75));
      });

      trends.push(trendData);
    }
    
    return trends;
  }, []);

  const syncWithDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load family members from database first
      await loadFamilyMembers();
      
      // Simulate API calls to health platforms
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newFamilyData = generateHealthDataFromDB();
      const newTrends = generateHealthTrends(newFamilyData);
      
      setFamilyData(newFamilyData);
      setHealthTrends(newTrends);
      setLastUpdated(new Date());
      
      toast({
        title: "Health Data Synced",
        description: "Successfully synced data from all connected devices and health apps.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync health data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadFamilyMembers, generateHealthDataFromDB, toast]);

  useEffect(() => {
    if (user?.id) {
      loadFamilyMembers();
    }
  }, [user?.id, loadFamilyMembers]);

  useEffect(() => {
    if (dbFamilyMembers.length >= 0) {
      const newFamilyData = generateHealthDataFromDB();
      const newTrends = generateHealthTrends(newFamilyData);
      
      setFamilyData(newFamilyData);
      setHealthTrends(newTrends);
      setLastUpdated(new Date());
    }
  }, [dbFamilyMembers, generateHealthDataFromDB, generateHealthTrends]);

  const familyHealthScore = useMemo(() => 
    familyData.length > 0 ? {
      overall: Math.round(familyData.reduce((acc, member) => 
        acc + calculateHealthScore(member.metrics, member.age), 0) / familyData.length),
      members: familyData.map(member => ({
        name: member.name,
        score: calculateHealthScore(member.metrics, member.age),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
      }))
    } : { overall: 0, members: [] }
  , [familyData]);

  const chartConfig = useMemo(() => {
    const config: any = {
      familyScore: { label: "Family Average", color: "#3b82f6" },
      you: { label: "You", color: "#10b981" }
    };
    
    // Add colors for each family member dynamically
    const colors = ["#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"];
    familyData.slice(1).forEach((member, index) => {
      const memberKey = member.name.toLowerCase().replace(/\s+/g, '');
      config[memberKey] = { 
        label: member.name, 
        color: colors[index % colors.length] 
      };
    });
    
    return config;
  }, [familyData]);

  return (
    <div className="space-y-6">
      {/* Sync Status and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Connected Health Devices
            </CardTitle>
            <Button onClick={syncWithDevices} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Sync All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {familyData.map((member, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{member.name}</h3>
                  <Wifi className="w-4 h-4 text-green-500" />
                </div>
                <div className="space-y-2">
                  {member.devices.map((device, deviceIndex) => (
                    <div key={deviceIndex} className="flex items-center gap-2 text-sm">
                      {device.includes('Watch') ? <Watch className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                      <span>{device}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor((Date.now() - member.lastSync.getTime()) / 60000)}m ago
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      {/* Enhanced Family Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-500" />
              Dynamic Health Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{familyHealthScore.overall}</div>
              <div className="text-sm text-gray-600">Family Average</div>
              <div className="mt-4 space-y-2">
                {familyHealthScore.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{member.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.score}</span>
                      <TrendingUp className={`w-3 h-3 ${
                        member.trend === 'up' ? 'text-green-500' : 
                        member.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-red-500" />
              Real-time Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Steps Today</span>
                <span className="font-bold">{Math.round(familyData.reduce((acc, m) => acc + m.metrics.steps, 0) / familyData.length).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Heart Rate</span>
                <span className="font-bold">{Math.round(familyData.reduce((acc, m) => acc + m.metrics.heartRate, 0) / familyData.length)} bpm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Sleep</span>
                <span className="font-bold">{(familyData.reduce((acc, m) => acc + m.metrics.sleepHours, 0) / familyData.length).toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Exercise Minutes</span>
                <span className="font-bold">{Math.round(familyData.reduce((acc, m) => acc + m.metrics.exerciseMinutes, 0) / familyData.length)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              AI Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm font-medium text-amber-800">Pattern Detected</p>
                <p className="text-xs text-amber-600">Family sleep quality declining this week</p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm font-medium text-green-800">Positive Trend</p>
                <p className="text-xs text-green-600">Exercise consistency improved 15%</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-800">Recommendation</p>
                <p className="text-xs text-blue-600">Schedule family wellness check-in</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Health Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Health Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <LineChart data={healthTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[60, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="familyScore" stroke="#3b82f6" strokeWidth={3} name="Family Average" />
              <Line type="monotone" dataKey="you" stroke="#10b981" strokeWidth={2} name="You" />
              {/* Render lines for each family member dynamically */}
              {familyData.slice(1).map((member, index) => {
                const memberKey = member.name.toLowerCase().replace(/\s+/g, '');
                const colors = ["#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"];
                return (
                  <Line 
                    key={memberKey}
                    type="monotone" 
                    dataKey={memberKey} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2} 
                    name={member.name} 
                  />
                );
              })}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ steps: { label: "Steps", color: "#3b82f6" } }} className="h-[200px]">
              <AreaChart data={healthTrends.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="steps" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sleep & Recovery Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ sleep: { label: "Sleep Hours", color: "#8b5cf6" } }} className="h-[200px]">
              <BarChart data={healthTrends.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sleep" fill="#8b5cf6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export { FamilyHealthAnalytics };
