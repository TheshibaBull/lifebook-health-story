
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Upload, 
  Search, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Users,
  Activity,
  Shield,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { HealthTimeline } from '@/components/HealthTimeline';
import { HealthScore } from '@/components/HealthScore';
import { QuickEmergencyAccess } from '@/components/QuickEmergencyAccess';
import { UnifiedUpload } from '@/components/UnifiedUpload';
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

  const handleUploadClick = () => {
    navigate('/upload-record');
  };

  const handleSearchClick = () => {
    navigate('/search');
  };

  const handleFamilyClick = () => {
    navigate('/family');
  };

  const handleRecordClick = (recordId: string) => {
    toast({
      title: "Record Clicked",
      description: `You clicked record with ID: ${recordId}`,
    });
  };

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

          {/* Quick Actions */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-3 border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
                  onClick={() => navigate('/upload-record')}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Upload</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-3 border-2 border-green-100 hover:border-green-200 hover:bg-green-50/50 transition-all duration-200"
                  onClick={() => navigate('/search')}
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Search</span>
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full h-20 flex items-center justify-center gap-4 border-2 border-purple-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200"
                onClick={() => navigate('/family')}
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="font-medium">Family Health</span>
              </Button>
            </CardContent>
          </Card>

          {/* Health Records Section */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Health Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="records" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="records" className="text-sm">Records</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-sm">Timeline</TabsTrigger>
                </TabsList>
                
                <TabsContent value="records" className="mt-0">
                  <UnifiedUpload />
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-0">
                  <HealthTimeline />
                </TabsContent>
              </Tabs>
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

        {/* Action Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-800">Quick Actions</CardTitle>
              <p className="text-gray-600">Manage your health records efficiently</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <Button 
                onClick={handleUploadClick} 
                className="h-20 flex flex-col items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span className="font-medium">Upload Record</span>
              </Button>
              <Button 
                onClick={handleSearchClick} 
                className="h-20 flex flex-col items-center justify-center gap-3 bg-green-500 hover:bg-green-600 transition-colors"
              >
                <Search className="w-6 h-6" />
                <span className="font-medium">Search Records</span>
              </Button>
              <Button 
                onClick={handleFamilyClick} 
                className="h-20 flex flex-col items-center justify-center gap-3 bg-purple-500 hover:bg-purple-600 transition-colors"
              >
                <Users className="w-6 h-6" />
                <span className="font-medium">Family Health</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 transition-colors">
                <Activity className="w-6 h-6" />
                <span className="font-medium">Track Activity</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                <Shield className="w-6 h-6 text-red-500" />
                Emergency Access
              </CardTitle>
              <p className="text-gray-600">Quick access to critical health information</p>
            </CardHeader>
            <CardContent>
              <QuickEmergencyAccess />
            </CardContent>
          </Card>
        </div>

        {/* Health Records Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-500" />
              Health Records
            </CardTitle>
            <p className="text-gray-600">View and manage all your health documentation</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="records" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-gray-100">
                <TabsTrigger value="records" className="text-sm">List View</TabsTrigger>
                <TabsTrigger value="timeline" className="text-sm">Timeline</TabsTrigger>
                <TabsTrigger value="upload" className="text-sm">Upload</TabsTrigger>
              </TabsList>
              
              <TabsContent value="records" className="space-y-6">
                {healthRecords.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {healthRecords.map((record) => (
                      <Card 
                        key={record.id} 
                        onClick={() => handleRecordClick(record.id)} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white hover:scale-105"
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-gray-800">{record.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{record.description}</p>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {record.type}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700">No records yet</h3>
                    <p className="text-gray-500">Upload your first health record to get started</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="timeline">
                <HealthTimeline />
              </TabsContent>
              
              <TabsContent value="upload">
                <UnifiedUpload />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
