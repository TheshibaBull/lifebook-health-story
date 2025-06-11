
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, Wifi, Download, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EnhancedOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncProgress, setSyncProgress] = useState(0);
  const [pendingUploads, setPendingUploads] = useState(3);
  const [lastSync, setLastSync] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection Restored",
        description: "Auto-sync will resume now"
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Your data will sync when connection is restored",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setPendingUploads(0);
          setLastSync(new Date());
          toast({
            title: "Sync Complete",
            description: "All your health records are up to date"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Cloud className="text-blue-500" />
            ) : (
              <CloudOff className="text-gray-500" />
            )}
            Offline Sync
          </div>
          {isOnline ? (
            <Badge className="bg-green-100 text-green-800">
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="secondary">
              <CloudOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Syncing data...</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Upload className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-lg font-bold">{pendingUploads}</div>
            <div className="text-xs text-gray-600">Pending Uploads</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-lg font-bold">247</div>
            <div className="text-xs text-gray-600">Records Synced</div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs text-gray-600">
            Last sync: {lastSync.toLocaleTimeString()}
          </p>
          <Button 
            onClick={handleManualSync}
            disabled={!isOnline || isSyncing}
            size="sm"
            className="w-full"
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Syncing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Manual Sync
              </>
            )}
          </Button>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            Your health records are automatically saved locally and will sync when you're back online.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export { EnhancedOfflineSync };
