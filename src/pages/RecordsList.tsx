
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Filter, 
  Search, 
  Calendar as CalendarIcon, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  ChevronRight,
  TestTube,
  Pill,
  Activity,
  FileImage,
  FilePlus2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HealthRecordsService } from '@/services/healthRecordsService';
import { FileUploadService } from '@/services/fileUploadService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { DateRange } from 'react-day-picker';

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
    return FileUploadService.formatFileSize(bytes);
  };

  const categories = ['all', ...Array.from(new Set(records.map(record => record.category)))];

  const renderMobileView = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          placeholder="Search records..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
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
      
      {/* Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Filter by date</span>
              )}
            </div>
            {dateRange && (
              <X 
                className="h-4 w-4 opacity-50" 
                onClick={(e) => {
                  e.stopPropagation();
                  setDateRange(undefined);
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
      
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
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <div className="flex items-start p-4">
                <div className="mr-3 mt-1">
                  {getRecordIcon(record.category)}
                </div>
                <div className="flex-1 min-w-0" onClick={() => handleViewRecord(record)}>
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
                    onClick={() => handleViewRecord(record)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {record.file_path && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => handleDownloadRecord(record)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-500" 
                    onClick={() => {
                      setRecordToDelete(record.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderDesktopView = () => (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search by title, category, or content..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[240px] justify-between">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by date</span>
                )}
              </div>
              {dateRange && (
                <X 
                  className="h-4 w-4 opacity-50" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateRange(undefined);
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        <Button onClick={() => navigate('/upload-record')}>
          <FilePlus2 className="mr-2 h-4 w-4" />
          Upload New Record
        </Button>
      </div>
      
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
            <div className="space-y-4">
              {filteredRecords.map((record) => (
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
                        onClick={() => handleViewRecord(record)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      {record.file_path && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadRecord(record)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setRecordToDelete(record.id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <AppLayout title="Health Records">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600 mt-2">View and manage your medical documents</p>
        </div>
        
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
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedRecord && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getRecordIcon(selectedRecord.category)}
                    <span>{selectedRecord.title}</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Record Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Category</p>
                      <p>{selectedRecord.category}</p>
                    </div>
                    {selectedRecord.date_of_record && (
                      <div>
                        <p className="font-medium text-gray-700">Date</p>
                        <p>{format(new Date(selectedRecord.date_of_record), 'MMMM d, yyyy')}</p>
                      </div>
                    )}
                    {selectedRecord.provider_name && (
                      <div>
                        <p className="font-medium text-gray-700">Provider</p>
                        <p>{selectedRecord.provider_name}</p>
                      </div>
                    )}
                    {selectedRecord.file_type && (
                      <div>
                        <p className="font-medium text-gray-700">File Type</p>
                        <p className="flex items-center gap-1">
                          {getFileTypeIcon(selectedRecord.file_type)}
                          {selectedRecord.file_type.split('/')[1]?.toUpperCase() || selectedRecord.file_type}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedRecord.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* File Preview */}
                  {selectedRecord.fileUrl && selectedRecord.file_type?.includes('image') && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Preview</p>
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={selectedRecord.fileUrl} 
                          alt={selectedRecord.title} 
                          className="max-w-full h-auto max-h-[400px] mx-auto"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* PDF Embed */}
                  {selectedRecord.fileUrl && selectedRecord.file_type?.includes('pdf') && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Preview</p>
                      <div className="border rounded-lg overflow-hidden h-[500px]">
                        <iframe 
                          src={`${selectedRecord.fileUrl}#toolbar=0`} 
                          className="w-full h-full"
                          title={selectedRecord.title}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Extracted Text */}
                  {selectedRecord.extracted_text && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Extracted Content</p>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-line">
                        {selectedRecord.extracted_text}
                      </div>
                    </div>
                  )}
                  
                  {/* Medical Entities */}
                  {selectedRecord.medical_entities && Object.keys(selectedRecord.medical_entities).length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Medical Information</p>
                      <div className="bg-blue-50 p-4 rounded-lg text-sm">
                        {Object.entries(selectedRecord.medical_entities).map(([key, values]) => {
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
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowViewDialog(false)}
                  >
                    Close
                  </Button>
                  <div className="flex gap-2">
                    {selectedRecord.file_path && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleDownloadRecord(selectedRecord)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setRecordToDelete(selectedRecord.id);
                        setShowViewDialog(false);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default RecordsList;
