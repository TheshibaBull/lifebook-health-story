
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  CheckCircle, 
  Clock,
  X,
  Heart,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AIDocumentProcessor } from '@/services/aiDocumentProcessor';
import { FileStorageService } from '@/services/fileStorageService';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string;
  uploadedAt: Date;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

const UnifiedUpload = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingFiles, setPendingFiles] = useState<UploadFile[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('lifebook-uploads');
    if (stored) {
      setPendingFiles(JSON.parse(stored));
    }

    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Files will now sync automatically",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Files will be saved locally and synced when connection returns",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveToLocalStorage = (files: UploadFile[]) => {
    localStorage.setItem('lifebook-uploads', JSON.stringify(files));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 10MB limit`,
          variant: "destructive"
        });
        continue;
      }

      try {
        const base64Data = await fileToBase64(file);
        const uploadFile: UploadFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64Data,
          uploadedAt: new Date(),
          status: isOnline ? 'syncing' : 'pending'
        };

        const updatedFiles = [...pendingFiles, uploadFile];
        setPendingFiles(updatedFiles);
        saveToLocalStorage(updatedFiles);

        if (isOnline) {
          syncSingleFile(uploadFile);
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

  const syncSingleFile = async (file: UploadFile) => {
    try {
      // Show AI processing toast
      toast({
        title: "AI Processing Started",
        description: `Analyzing ${file.name} with AI...`,
      });

      // Convert base64 back to File object for processing
      const response = await fetch(file.data);
      const blob = await response.blob();
      const originalFile = new File([blob], file.name, { type: file.type });
      
      // Process with AI
      const analysis = await AIDocumentProcessor.analyzeDocument(originalFile);
      
      // Save to storage
      const storedFile = await FileStorageService.saveFile(originalFile, analysis);
      
      const updatedFiles = pendingFiles.map(f => 
        f.id === file.id ? { ...f, status: 'synced' as const } : f
      );
      setPendingFiles(updatedFiles);
      saveToLocalStorage(updatedFiles);

      toast({
        title: "AI Processing Complete",
        description: `${file.name} categorized as ${analysis.category}`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      const updatedFiles = pendingFiles.map(f => 
        f.id === file.id ? { ...f, status: 'failed' as const } : f
      );
      setPendingFiles(updatedFiles);
      saveToLocalStorage(updatedFiles);
      
      toast({
        title: "AI Processing Failed",
        description: `Failed to process ${file.name}`,
        variant: "destructive"
      });
    }
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

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'synced': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'syncing': return (
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-red-500 animate-pulse" />
          <Brain className="w-3 h-3 text-blue-500 animate-pulse" />
        </div>
      );
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
            Upload Health Records
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
          {isOnline ? (
            <Cloud className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          ) : (
            <CloudOff className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-medium mb-2">
            {isOnline ? 'Upload Files' : 'Save Files Offline'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isOnline 
              ? 'Files will be uploaded immediately'
              : 'Files will be saved locally and synced when you\'re back online'
            }
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="unified-upload"
          />
          <label htmlFor="unified-upload">
            <Button className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          </label>
        </div>

        {pendingFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Files ({pendingFiles.length})</h4>
            </div>

            <div className="space-y-2">
              {pendingFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{file.name}</p>
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
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { UnifiedUpload };
