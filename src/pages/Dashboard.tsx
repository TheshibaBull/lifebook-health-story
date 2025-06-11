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
        <div className="px-4 py-4 space-y-6">
          {/* Health Score Card */}
          <Card>
            <CardContent className="p-4">
              <HealthScore />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate('/upload-record')}
                >
                  <Upload className="w-6 h-6 text-blue-500" />
                  <span className="text-sm">Upload</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate('/search')}
                >
                  <Search className="w-6 h-6 text-green-500" />
                  <span className="text-sm">Search</span>
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full h-16 flex items-center justify-center gap-3"
                onClick={() => navigate('/family')}
              >
                <Users className="w-6 h-6 text-purple-500" />
                <span>Family Health</span>
              </Button>
            </CardContent>
          </Card>

          {/* Health Records Section */}
          <Tabs defaultValue="records" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="records">Records</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="records" className="mt-4">
              <UnifiedUpload />
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <HealthTimeline />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Emergency Access */}
          <QuickEmergencyAccess />
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 text-blue-900">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                <Heart className="w-6 h-6" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HealthScore />
            </CardContent>
          </Card>

          <Card className="bg-green-50 text-green-900">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Track your health trends over time</p>
              <Button variant="secondary" className="mt-4">View Trends</Button>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 text-purple-900">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">View upcoming appointments and reminders</p>
              <Button variant="secondary" className="mt-4">View Calendar</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button onClick={handleUploadClick} className="h-16">
                <Upload className="w-4 h-4 mr-2" />
                Upload Record
              </Button>
              <Button onClick={handleSearchClick} className="h-16">
                <Search className="w-4 h-4 mr-2" />
                Search Records
              </Button>
              <Button onClick={handleFamilyClick} className="h-16">
                <Users className="w-4 h-4 mr-2" />
                Family Health
              </Button>
              <Button className="h-16">
                <Activity className="w-4 h-4 mr-2" />
                Track Activity
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Emergency Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickEmergencyAccess />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              <FileText className="w-5 h-5 mr-2 inline-block" />
              Health Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="records">
              <TabsList className="mb-4">
                <TabsTrigger value="records">List View</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="records">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {healthRecords.map((record) => (
                    <Card key={record.id} onClick={() => handleRecordClick(record.id)} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{record.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{record.description}</p>
                        <Badge variant="secondary" className="mt-2">{record.type}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
