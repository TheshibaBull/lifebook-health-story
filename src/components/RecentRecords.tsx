
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecordCard } from '@/components/RecordCard';
import { RecordViewer } from '@/components/RecordViewer';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HealthRecordsService } from '@/services/healthRecordsService';
import { FileUploadService } from '@/services/fileUploadService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface RecentRecordsProps {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export const RecentRecords = ({ limit = 3, showViewAll = true, className }: RecentRecordsProps) => {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user]);

  const loadRecords = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const fetchedRecords = await HealthRecordsService.getRecords(user.id);
      
      // Limit the number of records and enhance with file URLs
      const limitedRecords = fetchedRecords.slice(0, limit);
      const enhancedRecords = await Promise.all(
        limitedRecords.map(async (record) => {
          let fileUrl = undefined;
          if (record.file_path) {
            fileUrl = await FileUploadService.getFileUrl(record.file_path);
          }
          return { ...record, fileUrl };
        })
      );
      
      setRecords(enhancedRecords);
    } catch (error) {
      console.error('Error loading records:', error);
      toast({
        title: "Error",
        description: "Failed to load recent records. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    setShowViewDialog(true);
  };

  const handleDeletePrompt = (recordId: string) => {
    setRecordToDelete(recordId);
    setShowDeleteDialog(true);
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    
    setIsDeleting(true);
    try {
      await HealthRecordsService.deleteRecordWithFile(recordToDelete);
      
      // Update records list
      setRecords(prevRecords => prevRecords.filter(record => record.id !== recordToDelete));
      
      toast({
        title: "Record Deleted",
        description: "The health record has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setRecordToDelete(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Recent Health Records
          </CardTitle>
          <div className="flex gap-2">
            {showViewAll && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/records')}
              >
                View All
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={() => navigate('/upload-record')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" text="Loading records..." />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No health records found</p>
            <Button onClick={() => navigate('/upload-record')}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Record
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onView={handleViewRecord}
                onDelete={handleDeletePrompt}
                compact
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Record Viewer Dialog */}
      <RecordViewer
        recordId={selectedRecordId}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        onDelete={handleDeletePrompt}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteRecord}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
