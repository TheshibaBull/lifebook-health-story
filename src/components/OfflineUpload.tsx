
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CloudOff, Cloud, Upload, FileText, Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded
  uploadedAt: Date;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

const OfflineUpload = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingFiles, setPendingFiles] = useState<OfflineFile[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load pending files from localStorage
    const stored = localStorage.getItem('lifebook-offline-uploads');
    if (stored) {
      setPendingFiles(JSON.parse(stored));
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Auto-sync when coming online
    if (isOnline && pendingFiles.some(file => file.status === 'pending')) {
      syncPendingFiles();
    }
  }, [isOnline]);

  const saveToLocalStorage = (files: OfflineFile[]) => {
    localStorage.setItem('lifebook-offline-uploads', JSON.stringify(files));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 10MB limit`,
          variant: "destructive"
        });
        continue;
      }

      try {
        const base64Data = await fileToBase64(file);
        const offlineFile: OfflineFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64Data,
          uploadedAt: new Date(),
          status: isOnline ? 'syncing' : 'pending'
        };

        const updatedFiles = [...pendingFiles, offlineFile];
        setPendingFiles(updatedFiles);
        saveToLocalStorage(updatedFiles);

        if (isOnline) {
          syncSingleFile(offlineFile);
        } else {
          toast({
            title: "Saved Offline",
            description: `${file.name} will sync when you're back online`,
          });
        }
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: `Failed to save ${file.name}`,
          variant: "destructive"
        });
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const syncSingleFile = async (file: OfflineFile) => {
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update file status to synced
      const updatedFiles = pendingFiles.map(f => 
        f.id === file.id ? { ...f, status: 'synced' as const } : f
      );
      setPendingFiles(updatedFiles);
      saveToLocalStorage(updatedFiles);

      toast({
        title: "File Synced",
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      // Update file status to failed
      const updatedFiles = pendingFiles.map(f => 
        f.id === file.id ? { ...f, status: 'failed' as const } : f
      );
      setPendingFiles(updatedFiles);
      saveToLocalStorage(updatedFiles);
    }
  };

  const syncPendingFiles = async () => {
    if (!isOnline) return;

    const filesToSync = pendingFiles.filter(file => file.status === 'pending');
    if (filesToSync.length === 0) return;

    setIsSyncing(true);
    setSyncProgress(0);

    for (let i = 0; i < filesToSync.length; i++) {
      const file = filesToSync[i];
      
      // Update status to syncing
      setPendingFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'syncing' } : f
      ));

      await syncSingleFile(file);
      setSyncProgress(((i + 1) / filesToSync.length) * 100);
    }

    setIsSyncing(false);
    toast({
      title: "Sync Complete",
      description: `${filesToSync.length} files synced successfully`,
    });
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = pendingFiles.filter(f => f.id !== fileId);
    setPendingFiles(updatedFiles);
    saveToLocalStorage(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: OfflineFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'synced': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: OfflineFile['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'syncing': return <Upload className="w-3 h-3" />;
      case 'synced': return <CheckCircle className="w-3 h-3" />;
      case 'failed': return <CloudOff className="w-3 h-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="text-blue-500" />
            Offline Upload
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="outline" className="text-green-600">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <CloudOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Files Offline</h3>
          <p className="text-sm text-gray-600 mb-4">
            Files will be saved locally and synced when you're back online
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="offline-upload"
          />
          <label htmlFor="offline-upload">
            <Button className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          </label>
        </div>

        {isSyncing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Syncing files...</span>
              <span>{Math.round(syncProgress)}%</span>
            </div>
            <Progress value={syncProgress} />
          </div>
        )}

        {pendingFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Pending Files ({pendingFiles.length})</h4>
              {isOnline && pendingFiles.some(f => f.status === 'pending') && (
                <Button 
                  size="sm" 
                  onClick={syncPendingFiles}
                  disabled={isSyncing}
                >
                  <Cloud className="w-4 h-4 mr-1" />
                  Sync All
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {pendingFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(file.status)}>
                      {getStatusIcon(file.status)}
                      <span className="ml-1 capitalize">{file.status}</span>
                    </Badge>
                    {file.status === 'failed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => syncSingleFile(file)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Offline Mode:</strong> Files are stored securely in your browser and will automatically sync when internet connection is restored.
        </div>
      </CardContent>
    </Card>
  );
};

export { OfflineUpload };
