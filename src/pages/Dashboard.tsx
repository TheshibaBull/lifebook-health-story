
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, FileText, Users, Calendar, TrendingUp, AlertTriangle, Shield, QrCode } from 'lucide-react';
import { HealthTimeline } from '@/components/HealthTimeline';
import { FamilyVault } from '@/components/FamilyVault';
import { EmergencyCard } from '@/components/EmergencyCard';
import { HealthScore } from '@/components/HealthScore';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const healthAlerts = [
    { type: 'urgent', message: 'Annual thyroid test overdue by 3 months', date: '2024-01-15' },
    { type: 'warning', message: 'Blood pressure trending upward - last 3 readings high', date: '2024-01-10' },
    { type: 'info', message: 'Flu vaccination due this month', date: '2024-01-05' }
  ];

  const recentDocuments = [
    { name: 'Blood Test Report', date: '2024-01-15', type: 'Lab Report', doctor: 'Dr. Smith' },
    { name: 'Prescription - Hypertension', date: '2024-01-10', type: 'Prescription', doctor: 'Dr. Johnson' },
    { name: 'X-Ray Chest', date: '2024-01-05', type: 'Imaging', doctor: 'Dr. Wilson' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="text-red-500" />
                Lifebook Health
              </h1>
              <p className="text-gray-600 mt-1">Your lifelong health story in one secure place</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <QrCode className="w-4 h-4 mr-2" />
                Emergency Card
              </Button>
              <Button size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Upload Records
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Health Timeline</TabsTrigger>
            <TabsTrigger value="family">Family Vault</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="insights">Health Score</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Health Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" />
                  Health Alerts & Nudges
                </CardTitle>
                <CardDescription>AI-powered personalized health recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Badge variant={alert.type === 'urgent' ? 'destructive' : alert.type === 'warning' ? 'default' : 'secondary'}>
                          {alert.type}
                        </Badge>
                        <span className="text-sm">{alert.message}</span>
                      </div>
                      <span className="text-xs text-gray-500">{alert.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Records</p>
                      <p className="text-2xl font-bold">247</p>
                    </div>
                    <FileText className="text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Family Members</p>
                      <p className="text-2xl font-bold">4</p>
                    </div>
                    <Users className="text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Health Score</p>
                      <p className="text-2xl font-bold">87</p>
                    </div>
                    <TrendingUp className="text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Data Security</p>
                      <p className="text-2xl font-bold text-green-600">AES-256</p>
                    </div>
                    <Shield className="text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>Your latest uploaded and scanned documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.type} • {doc.doctor}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{doc.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <HealthTimeline />
          </TabsContent>

          <TabsContent value="family">
            <FamilyVault />
          </TabsContent>

          <TabsContent value="emergency">
            <EmergencyCard />
          </TabsContent>

          <TabsContent value="insights">
            <HealthScore />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
