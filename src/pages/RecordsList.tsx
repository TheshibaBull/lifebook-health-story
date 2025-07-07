
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilePlus2 } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HealthRecordsService } from '@/services/healthRecordsService';
import { FileUploadService } from '@/services/fileUploadService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RecordsHeader } from '@/components/records/RecordsHeader';
import { RecordsSearchBar } from '@/components/records/RecordsSearchBar';
import { RecordsList as RecordsListComponent } from '@/components/records/RecordsList';
import { RecordViewDialog } from '@/components/records/RecordViewDialog';
import type { DateRange } from 'react-day-picker';
import type { Tables } from '@/integrations/supabase/types';

type HealthRecord = Tables<'health_records'> & { fileUrl?: string };

const RecordsList = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user]);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery, activeCategory, dateRange]);

  const loadRecords = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const fetchedRecords = await HealthRecordsService.getRecords(user.id);
      
      // Enhance records with file URLs
      const enhancedRecords = await Promise.all(
        fetchedRecords.map(async (record) => {
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
        description: "Failed to load health records. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(query) ||
        record.category.toLowerCase().includes(query) ||
        record.tags.some(tag => tag.toLowerCase().includes(query)) ||
        record.extracted_text?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(record => record.category === activeCategory);
    }
    
    // Filter by date range
    if (dateRange?.from) {
      filtered = filtered.filter(record => {
        if (!record.date_of_record) return false;
        const recordDate = new Date(record.date_of_record);
        return recordDate >= dateRange.from!;
      });
    }
    
    if (dateRange?.to) {
      filtered = filtered.filter(record => {
        if (!record.date_of_record) return false;
        const recordDate = new Date(record.date_of_record);
        return recordDate <= dateRange.to!;
      });
    }
    
    setFilteredRecords(filtered);
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

  const handleViewRecord = async (record: HealthRecord) => {
    setSelectedRecord(record);
    setShowViewDialog(true);
  };

  const handleDownloadRecord = async (record: HealthRecord) => {
    if (!record.file_path) {
      toast({
        title: "Download Failed",
        description: "No file available for download.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (record.fileUrl) {
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
      } else {
        toast({
          title: "Download Failed",
          description: "File URL not available.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const categories = ['all', ...Array.from(new Set(records.map(record => record.category)))];

  const renderMobileView = () => (
    <div className="space-y-4">
      <RecordsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onNavigateToUpload={() => navigate('/upload-record')}
        isMobile={true}
      />
      
      {/* Category Tabs */}
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-2 min-w-max">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="whitespace-nowrap"
            >
              {category === 'all' ? 'All Records' : category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Records List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" text="Loading records..." />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-8">
          <FilePlus2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || activeCategory !== 'all' || dateRange?.from || dateRange?.to
              ? "Try adjusting your filters"
              : "Upload your first health record to get started"}
          </p>
          <Button onClick={() => navigate('/upload-record')}>
            Upload Record
          </Button>
        </div>
      ) : (
        <RecordsListComponent
          records={filteredRecords}
          onViewRecord={handleViewRecord}
          onDownloadRecord={handleDownloadRecord}
          onDeleteRecord={(recordId) => {
            setRecordToDelete(recordId);
            setShowDeleteDialog(true);
          }}
          isMobile={true}
        />
      )}
    </div>
  );

  const renderDesktopView = () => (
    <div className="space-y-6">
      <RecordsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onNavigateToUpload={() => navigate('/upload-record')}
        isMobile={false}
      />
      
      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-4">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category === 'all' ? 'All Records' : category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeCategory} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading records..." />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <FilePlus2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery || activeCategory !== 'all' || dateRange?.from || dateRange?.to
                  ? "Try adjusting your filters or search terms"
                  : "Upload your first health record to get started with your health vault"}
              </p>
              <Button onClick={() => navigate('/upload-record')}>
                Upload Record
              </Button>
            </div>
          ) : (
            <RecordsListComponent
              records={filteredRecords}
              onViewRecord={handleViewRecord}
              onDownloadRecord={handleDownloadRecord}
              onDeleteRecord={(recordId) => {
                setRecordToDelete(recordId);
                setShowDeleteDialog(true);
              }}
              isMobile={false}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <AppLayout title="Health Records">
      <div className="container mx-auto px-4 py-6">
        <RecordsHeader onNavigateToUpload={() => navigate('/upload-record')} />
        
        {isMobile ? renderMobileView() : renderDesktopView()}
        
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
        
        {/* View Record Dialog */}
        <RecordViewDialog
          record={selectedRecord}
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          onDownload={handleDownloadRecord}
          onDelete={(recordId) => {
            setRecordToDelete(recordId);
            setShowDeleteDialog(true);
          }}
        />
      </div>
    </AppLayout>
  );
};

export default RecordsList;
