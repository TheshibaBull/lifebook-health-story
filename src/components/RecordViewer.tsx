import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Trash2, 
  Calendar, 
  TestTube,
  Pill,
  Activity,
  FileImage,
  Building,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { HealthRecordsService } from '@/services/healthRecordsService';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface RecordViewerProps {
  recordId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (recordId: string) => void;
}

export const RecordViewer = ({ recordId, open, onOpenChange, onDelete }: RecordViewerProps) => {
  const [record, setRecord] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (recordId && open) {
      loadRecord(recordId);
    } else {
      setRecord(null);
    }
  }, [recordId, open]);

  const loadRecord = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await HealthRecordsService.getRecordWithUrl(id);
      setRecord(data);
    } catch (error) {
      console.error('Error loading record:', error);
      toast({
        title: "Error",
        description: "Failed to load record details. Please try again.",
        variant: "destructive"
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!record?.file_path || !record?.fileUrl) {
      toast({
        title: "Download Failed",
        description: "No file available for download.",
        variant: "destructive"
      });
      return;
    }
    
    try {
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
    }
  };

  const getRecordIcon = (category?: string) => {
    if (!category) return <FileText className="w-6 h-6 text-gray-500" />;
    
    switch (category) {
      case 'Lab Results':
        return <TestTube className="w-6 h-6 text-purple-500" />;
      case 'Prescriptions':
        return <Pill className="w-6 h-6 text-orange-500" />;
      case 'Imaging':
        return <FileImage className="w-6 h-6 text-blue-500" />;
      case 'Visit Notes':
        return <FileText className="w-6 h-6 text-green-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading record details..." />
          </div>
        ) : record ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {getRecordIcon(record.category)}
                <span>{record.title}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Record Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700">Category</p>
                    <p>{record.category}</p>
                  </div>
                </div>
                
                {record.date_of_record && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700">Date</p>
                      <p>{format(new Date(record.date_of_record), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
                
                {record.provider_name && (
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700">Provider</p>
                      <p>{record.provider_name}</p>
                    </div>
                  </div>
                )}
                
                {record.file_type && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700">File Type</p>
                      <p>{record.file_type.split('/')[1]?.toUpperCase() || record.file_type}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {record.tags && record.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-700 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {record.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
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
                  <p className="font-medium text-gray-700 mb-2">Medical Information</p>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm">
                    {Object.entries(record.medical_entities).map(([key, values]) => {
                      if (Array.isArray(values) && values.length > 0) {
                        return (
                          <div key={key} className="mb-2 last:mb-0">
                            <p className="font-medium capitalize">{key.replace('_', ' ')}:</p>
                            <p>{(values as string[]).join(', ')}</p>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <div className="flex justify-between w-full">
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
                      onClick={handleDownload}
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
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-8">
            <p>Record not found or has been deleted.</p>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};