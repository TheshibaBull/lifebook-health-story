
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OfflineDataSyncService } from '@/services/offlineDataSyncService';

export const OfflineStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending items periodically
    const checkPending = () => {
      setPendingCount(OfflineDataSyncService.getPendingCount());
    };

    const interval = setInterval(checkPending, 1000);
    checkPending();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await OfflineDataSyncService.syncOfflineData();
      setPendingCount(OfflineDataSyncService.getPendingCount());
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Wifi className="w-3 h-3 mr-1" />
          Online
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </Badge>
      )}
      
      {pendingCount > 0 && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleManualSync}
          disabled={!isOnline || isSyncing}
          className="h-6 text-xs"
        >
          {isSyncing ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <span className="mr-1">{pendingCount}</span>
          )}
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
      )}
    </div>
  );
};
