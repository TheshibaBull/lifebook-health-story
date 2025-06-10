
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CloudOff, Cloud, RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OfflineDataSync } from '@/services/offlineDataSync';

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingItems: number;
  syncProgress: number;
  isSyncing: boolean;
  syncErrors: string[];
}

const EnhancedOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingItems: 0,
    syncProgress: 0,
    isSyncing: false,
    syncErrors: []
  });
  
  const { toast } = useToast();

  useEffect(() => {
    checkSyncStatus();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "Back Online",
        description: "Starting automatic sync..."
      });
      handleAutoSync();
    };
    
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "Offline Mode",
        description: "Your data will sync when connection is restored",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Start auto-sync service
    OfflineDataSync.startAutoSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkSyncStatus = () => {
    const pendingCount = OfflineDataSync.getPendingSyncCount();
    const lastSyncStr = localStorage.getItem('last_sync_time');
    
    setSyncStatus(prev => ({
      ...prev,
      pendingItems: pendingCount,
      lastSync: lastSyncStr ? new Date(lastSyncStr) : null
    }));
  };

  const handleManualSync = async () => {
    if (!syncStatus.isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }));
    
    try {
      // Simulate sync progress
      const progressInterval = setInterval(() => {
        setSyncStatus(prev => ({
          ...prev,
          syncProgress: Math.min(prev.syncProgress + 20, 90)
        }));
      }, 500);

      await OfflineDataSync.syncAll();
      
      clearInterval(progressInterval);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncProgress: 100,
        lastSync: new Date(),
        pendingItems: 0
      }));

      localStorage.setItem('last_sync_time', new Date().toISOString());
      
      toast({
        title: "Sync Complete",
        description: "All your data has been synchronized"
      });

      // Reset progress after a delay
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, syncProgress: 0 }));
      }, 2000);

    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncProgress: 0,
        syncErrors: [...prev.syncErrors, error instanceof Error ? error.message : 'Sync failed']
      }));
      
      toast({
        title: "Sync Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleAutoSync = async () => {
    if (syncStatus.pendingItems > 0) {
      await handleManualSync();
    }
  };

  const clearSyncErrors = () => {
    setSyncStatus(prev => ({ ...prev, syncErrors: [] }));
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-blue-500" />
            Offline Sync
          </div>
          <div className="flex items-center gap-2">
            {syncStatus.isOnline ? (
              <Badge variant="outline" className="text-green-600">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            {syncStatus.pendingItems > 0 && (
              <Badge variant="outline" className="text-orange-600">
                {syncStatus.pendingItems} pending
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Sync Status</p>
            <p className="text-xs text-gray-600">
              Last sync: {formatLastSync(syncStatus.lastSync)}
            </p>
          </div>
          <Button 
            onClick={handleManualSync}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
            size="sm"
          >
            {syncStatus.isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>

        {syncStatus.isSyncing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Synchronizing data...</span>
              <span>{syncStatus.syncProgress}%</span>
            </div>
            <Progress value={syncStatus.syncProgress} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {syncStatus.pendingItems}
            </div>
            <div className="text-xs text-gray-600">Pending Items</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {syncStatus.isOnline ? '✓' : '✗'}
            </div>
            <div className="text-xs text-gray-600">Connection</div>
          </div>
        </div>

        {syncStatus.syncErrors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-red-600">Sync Errors</p>
              <Button variant="ghost" size="sm" onClick={clearSyncErrors}>
                Clear
              </Button>
            </div>
            {syncStatus.syncErrors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded text-sm">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Smart Sync:</strong> Your health data automatically syncs when you're online. 
          Offline changes are saved securely and will sync when connection is restored.
        </div>
      </CardContent>
    </Card>
  );
};

export { EnhancedOfflineSync };
