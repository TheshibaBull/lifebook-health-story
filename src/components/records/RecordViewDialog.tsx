
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Trash2, 
  TestTube,
  Pill,
  Activity,
  FileImage,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type HealthRecord = Tables<'health_records'> & { fileUrl?: string };

interface AIAnalysis {
  summary?: string;
  keyFindings?: string[];
  recommendations?: string[];
  confidence?: number;
  category?: string;
  tags?: string[];
  criticalValues?: any[];
}

interface RecordViewDialogProps {
  record: HealthRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (record: HealthRecord) => void;
  onDelete: (recordId: string) => void;
}

const RecordViewDialog = ({ record, open, onOpenChange, onDownload, onDelete }: RecordViewDialogProps) => {
  if (!record) return null;

  // Safely parse the ai_analysis JSON field
  const aiAnalysis = record.ai_analysis as AIAnalysis | null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRecordIcon(record.category)}
            <span>{record.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Record Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Category</p>
              <p>{record.category}</p>
            </div>
            {record.date_of_record && (
              <div>
                <p className="font-medium text-gray-700">Date</p>
                <p>{format(new Date(record.date_of_record), 'MMMM d, yyyy')}</p>
              </div>
            )}
            {record.provider_name && (
              <div>
                <p className="font-medium text-gray-700">Provider</p>
                <p>{record.provider_name}</p>
              </div>
            )}
            {record.file_type && (
              <div>
                <p className="font-medium text-gray-700">File Type</p>
                <p className="flex items-center gap-1">
                  {getFileTypeIcon(record.file_type)}
                  {record.file_type.split('/')[1]?.toUpperCase() || record.file_type}
                </p>
              </div>
            )}
          </div>
          
          {/* Tags */}
          {record.tags && record.tags.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {record.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* File Preview */}
          {record.fileUrl && record.file_type?.includes('image') && (
            <div>
              <p className="font-medium text-gray-700 mb-2">Preview</p>
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={record.fileUrl} 
                  alt={record.title} 
                  className="max-w-full h-auto max-h-[400px] mx-auto"
                />
              </div>
            </div>
          )}
          
          {/* PDF Embed */}
          {record.fileUrl && record.file_type?.includes('pdf') && (
            <div>
              <p className="font-medium text-gray-700 mb-2">Preview</p>
              <div className="border rounded-lg overflow-hidden h-[500px]">
                <iframe 
                  src={`${record.fileUrl}#toolbar=0`} 
                  className="w-full h-full"
                  title={record.title}
                />
              </div>
            </div>
          )}
          
          {/* Extracted Text */}
          {record.extracted_text && (
            <div>
              <p className="font-medium text-gray-700 mb-2">Extracted Content</p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-line">
                {record.extracted_text}
              </div>
            </div>
          )}
          
          {/* Medical Entities */}
          {record.medical_entities && Object.keys(record.medical_entities).length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-2">Extracted Medical Information</p>
              <div className="bg-blue-50 p-4 rounded-lg text-sm">
                {Object.entries(record.medical_entities).map(([key, values]) => {
                  if (Array.isArray(values) && values.length > 0) {
                    return (
                      <div key={key} className="mb-2 last:mb-0">
                        <p className="font-medium capitalize">{key.replace('_', ' ')}:</p>
                        <p>{values.join(', ')}</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
          
          {/* AI Summary */}
          {aiAnalysis?.summary && (
            <div>
              <p className="font-medium text-gray-700 mb-2">AI Summary</p>
              <div className="bg-purple-50 p-4 rounded-lg text-sm border border-purple-200">
                <p className="text-purple-900">{aiAnalysis.summary}</p>
                
                {aiAnalysis.keyFindings && aiAnalysis.keyFindings.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-purple-900 mb-1">Key Findings:</p>
                    <ul className="list-disc pl-5 text-purple-800 space-y-1">
                      {aiAnalysis.keyFindings.map((finding: string, index: number) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-purple-900 mb-1">Recommendations:</p>
                    <ul className="list-disc pl-5 text-purple-800 space-y-1">
                      {aiAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <div className="flex gap-2">
            {record.file_path && (
              <Button 
                variant="outline" 
                onClick={() => onDownload(record)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete(record.id);
                onOpenChange(false);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { RecordViewDialog };
