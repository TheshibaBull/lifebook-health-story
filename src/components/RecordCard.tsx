
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  TestTube,
  Pill,
  Activity,
  FileImage,
  Brain
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { FileUploadService } from '@/services/fileUploadService';

interface RecordCardProps {
  record: {
    id: string;
    title: string;
    category: string;
    tags: string[];
    file_name?: string;
    file_path?: string;
    file_size?: number;
    file_type?: string;
    date_of_record?: string;
    fileUrl?: string;
  };
  onView: (recordId: string) => void;
  onDelete: (recordId: string) => void;
  onAIAnalysis?: (record: any) => void;
  compact?: boolean;
}

export const RecordCard = ({ record, onView, onDelete, onAIAnalysis, compact = false }: RecordCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!record.file_path || !record.fileUrl) {
      toast({
        title: "Download Failed",
        description: "No file available for download.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsDownloading(true);
      
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = record.fileUrl;
      a.download = record.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `Downloading ${record.file_name}...`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAIAnalysis = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAIAnalysis) {
      onAIAnalysis(record);
    }
  };

  const getRecordIcon = (category: string) => {
    switch (category) {
      case 'Lab Results':
        return <TestTube className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-purple-500`} />;
      case 'Prescriptions':
        return <Pill className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-orange-500`} />;
      case 'Imaging':
        return <FileImage className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-500`} />;
      case 'Visit Notes':
        return <FileText className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-green-500`} />;
      default:
        return <FileText className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    return FileUploadService.formatFileSize(bytes);
  };

  const isImageFile = (fileType?: string) => {
    return fileType?.toLowerCase().includes('image');
  };

  if (compact) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(record.id)}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {getRecordIcon(record.category)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{record.title}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{record.category}</span>
                {record.date_of_record && (
                  <span>• {format(new Date(record.date_of_record), 'MMM d, yyyy')}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isImageFile(record.file_type) && onAIAnalysis && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100" 
                  onClick={handleAIAnalysis}
                  title="AI Analysis"
                >
                  <Brain className="h-3.5 w-3.5 text-purple-600" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={(e) => {
                  e.stopPropagation();
                  onView(record.id);
                }}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-start p-4">
        <div className="mr-3 mt-1">
          {getRecordIcon(record.category)}
        </div>
        <div className="flex-1 min-w-0" onClick={() => onView(record.id)}>
          <h3 className="font-medium text-gray-900 mb-1 truncate">{record.title}</h3>
          <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mb-2">
            <Badge variant="outline" className="text-xs">
              {record.category}
            </Badge>
            {record.date_of_record && (
              <span>{format(new Date(record.date_of_record), 'MMM d, yyyy')}</span>
            )}
            {record.file_size && (
              <span>{formatFileSize(record.file_size)}</span>
            )}
          </div>
          {record.tags && record.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {record.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {record.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{record.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onView(record.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isImageFile(record.file_type) && onAIAnalysis && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100" 
              onClick={handleAIAnalysis}
              title="AI Analysis"
            >
              <Brain className="h-4 w-4 text-purple-600" />
            </Button>
          )}
          {record.file_path && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-red-500" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
