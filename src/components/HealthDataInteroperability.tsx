
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Hospital, 
  FileText,
  Database,
  Smartphone,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HealthDataInteroperability = () => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const { toast } = useToast();

  const connectedSources = [
    { name: 'Epic MyChart', type: 'EHR', status: 'connected', lastSync: '2024-01-15 10:30 AM', records: 247 },
    { name: 'Apple Health', type: 'Device', status: 'connected', lastSync: '2024-01-15 09:15 AM', records: 1205 },
    { name: 'Fitbit', type: 'Wearable', status: 'connected', lastSync: '2024-01-15 08:45 AM', records: 892 },
    { name: 'CVS Pharmacy', type: 'Pharmacy', status: 'pending', lastSync: 'Never', records: 0 }
  ];

  const availableSources = [
    { name: 'Cerner Health', type: 'EHR', description: 'Connect to Cerner-based hospital systems' },
    { name: 'Google Fit', type: 'Device', description: 'Sync fitness and activity data' },
    { name: 'Samsung Health', type: 'Device', description: 'Import health metrics from Samsung devices' },
    { name: 'Walgreens', type: 'Pharmacy', description: 'Access prescription history' },
    { name: 'Quest Diagnostics', type: 'Lab', description: 'Import lab results automatically' }
  ];

  const handleSync = async (source: string) => {
    setSyncStatus('syncing');
    setSyncProgress(0);
    
    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncStatus('success');
          toast({
            title: "Sync Complete",
            description: `Successfully synced data from ${source}`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleExport = (format: 'FHIR' | 'C-CDA' | 'PDF' | 'CSV') => {
    toast({
      title: "Export Started",
      description: `Generating ${format} export of your health data`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EHR':
        return <Hospital className="w-4 h-4 text-blue-500" />;
      case 'Device':
        return <Smartphone className="w-4 h-4 text-green-500" />;
      case 'Wearable':
        return <Activity className="w-4 h-4 text-purple-500" />;
      case 'Pharmacy':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'Lab':
        return <Database className="w-4 h-4 text-red-500" />;
      default:
        return <Database className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="text-blue-500" />
            Health Data Interoperability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connected" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connected">Connected Sources</TabsTrigger>
              <TabsTrigger value="available">Available Sources</TabsTrigger>
              <TabsTrigger value="export">Export Data</TabsTrigger>
            </TabsList>

            <TabsContent value="connected" className="space-y-4">
              <div className="space-y-3">
                {connectedSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(source.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{source.name}</p>
                          <Badge variant="secondary">{source.type}</Badge>
                          {getStatusIcon(source.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Last sync: {source.lastSync} • {source.records} records
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {source.status === 'connected' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSync(source.name)}
                          disabled={syncStatus === 'syncing'}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                          Sync
                        </Button>
                      )}
                      {source.status === 'pending' && (
                        <Button variant="default" size="sm">
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {syncStatus === 'syncing' && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <p className="text-sm font-medium">Syncing health data...</p>
                  </div>
                  <Progress value={syncProgress} className="w-full" />
                  <p className="text-xs text-gray-600 mt-1">{syncProgress}% complete</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="available" className="space-y-4">
              <div className="space-y-3">
                {availableSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(source.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{source.name}</p>
                          <Badge variant="outline">{source.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{source.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">FHIR R4 Format</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Standard healthcare interoperability format for sharing with providers
                    </p>
                    <Button 
                      onClick={() => handleExport('FHIR')} 
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export FHIR Bundle
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">C-CDA Format</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Consolidated Clinical Document Architecture for care continuity
                    </p>
                    <Button 
                      onClick={() => handleExport('C-CDA')} 
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export C-CDA
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PDF Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Human-readable comprehensive health summary
                    </p>
                    <Button 
                      onClick={() => handleExport('PDF')} 
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">CSV Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Spreadsheet format for data analysis and research
                    </p>
                    <Button 
                      onClick={() => handleExport('CSV')} 
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Data Privacy Notice</p>
                    <p className="text-xs text-amber-700 mt-1">
                      All exports are encrypted and comply with HIPAA regulations. 
                      Exported data should be handled securely and shared only with authorized healthcare providers.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { HealthDataInteroperability };
