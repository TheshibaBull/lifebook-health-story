
import { Card } from '@/components/ui/card';
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
  Calendar as CalendarIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface HealthRecord {
  id: string;
  title: string;
  category: string;
  tags: string[];
  file_name?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  extracted_text?: string;
  medical_entities?: Record<string, any>;
  date_of_record?: string;
  provider_name?: string;
  created_at: string;
  fileUrl?: string;
}

interface RecordsListProps {
  records: HealthRecord[];
  onViewRecord: (record: HealthRecord) => void;
  onDownloadRecord: (record: HealthRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  isMobile?: boolean;
}

const RecordsList = ({
  records,
  onViewRecord,
  onDownloadRecord,
  onDeleteRecord,
  isMobile = false
}: RecordsListProps) => {
  const getRecordIcon = (category: string) => {
    switch (category) {
      case 'Lab Results':
        return <TestTube className="w-5 h-5 text-purple-500" />;
      case 'Prescriptions':
        return <Pill className="w-5 h-5 text-orange-500" />;
      case 'Imaging':
        return <FileImage className="w-5 h-5 text-blue-500" />;
      case 'Visit Notes':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'Vaccinations':
        return <Activity className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileTypeIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="w-4 h-4" />;
    
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (fileType.includes('image')) return <FileImage className="w-4 h-4" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-4 h-4" />;
    
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        {records.map((record) => (
          <Card key={record.id} className="overflow-hidden">
            <div className="flex items-start p-4">
              <div className="mr-3 mt-1">
                {getRecordIcon(record.category)}
              </div>
              <div className="flex-1 min-w-0" onClick={() => onViewRecord(record)}>
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
                  onClick={() => onViewRecord(record)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {record.file_path && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => onDownloadRecord(record)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-red-500" 
                  onClick={() => onDeleteRecord(record.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-start p-6">
            <div className="mr-4 mt-1">
              {getRecordIcon(record.category)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 mb-1">{record.title}</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                <Badge variant="outline">
                  {record.category}
                </Badge>
                {record.date_of_record && (
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {format(new Date(record.date_of_record), 'MMMM d, yyyy')}
                  </span>
                )}
                {record.file_type && (
                  <span className="flex items-center gap-1">
                    {getFileTypeIcon(record.file_type)}
                    {record.file_type.split('/')[1]?.toUpperCase()}
                  </span>
                )}
                {record.file_size && (
                  <span>{formatFileSize(record.file_size)}</span>
                )}
              </div>
              {record.tags && record.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {record.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {record.extracted_text && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {record.extracted_text.substring(0, 150)}
                  {record.extracted_text.length > 150 ? '...' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewRecord(record)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
              {record.file_path && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDownloadRecord(record)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDeleteRecord(record.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export { RecordsList };
