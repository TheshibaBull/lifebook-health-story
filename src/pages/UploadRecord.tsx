import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Heart, FileText, Brain, CloudOff, CheckCircle, AlertCircle, Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OfflineUpload } from '@/components/OfflineUpload';
import { AIDocumentProcessor } from '@/services/aiDocumentProcessor';
import { FileUploadService } from '@/services/fileUploadService';
import { HealthRecordsService } from '@/services/healthRecordsService';
import { PWAService } from '@/services/pwaService';
import { DocumentScanningService } from '@/services/documentScanningService';
import { DocumentScanResults } from '@/components/DocumentScanResults';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const UploadRecord = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanningStage, setScanningStage] = useState<'idle' | 'scanning' | 'results'>('idle');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(Array.from(files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(Array.from(files));
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Process one file at a time for better UX
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file first
      const validation = FileUploadService.validateFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid File",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }
      
      setCurrentFile(file);
      setScanningStage('scanning');
      setIsProcessing(true);
      setUploadProgress(0);
      
      try {
        // Start progress animation
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 5;
          });
        }, 300);
        
        // Scan document with enhanced AI
        const scanResult = await DocumentScanningService.scanDocument(file);
        
        // Complete progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Show results
        setScanResult(scanResult);
        setScanningStage('results');
        
        toast({
          title: "Document Scanned",
          description: `${file.name} analyzed with ${Math.round(scanResult.confidence * 100)}% confidence`,
        });
      } catch (error: any) {
        console.error('Error scanning document:', error);
        toast({
          title: "Scanning Failed",
          description: `Failed to scan ${file.name}: ${error.message}`,
          variant: "destructive"
        });
        setScanningStage('idle');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveRecord = async () => {
    if (!currentFile || !scanResult || !user) return;
    
    setIsProcessing(true);
    try {
      // Upload file to Supabase Storage
      const uploadResult = await FileUploadService.uploadFile(
        currentFile, 
        user.id,
        (progress) => {
          setUploadProgress(progress.percentage);
        }
      );
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      // Process with Enhanced AI for categorization and tagging
      const analysis = await AIDocumentProcessor.analyzeDocument(currentFile);
      
      // Create health record in database
      await HealthRecordsService.createRecord({
        user_id: user.id,
        title: currentFile.name,
        category: analysis.category,
        tags: analysis.tags,
        file_name: currentFile.name,
        file_path: uploadResult.data?.path,
        file_size: currentFile.size,
        file_type: currentFile.type,
        extracted_text: analysis.extractedText,
        medical_entities: analysis.medicalEntities,
        ai_analysis: {
          confidence: analysis.confidence,
          category: analysis.category,
          tags: analysis.tags,
          summary: scanResult.summary,
          keyFindings: scanResult.keyFindings,
          criticalValues: scanResult.criticalValues,
          recommendations: scanResult.recommendations
        },
        date_of_record: new Date().toISOString().split('T')[0]
      });
      
      setProcessedFiles([...processedFiles, currentFile.name]);
      
      toast({
        title: "Record Saved",
        description: `${currentFile.name} has been saved to your health records`,
      });
      
      // Reset state
      setCurrentFile(null);
      setScanResult(null);
      setScanningStage('idle');
      
      // Schedule background sync for offline capability
      await PWAService.scheduleBackgroundSync('health-data-sync');
    } catch (error: any) {
      console.error('Error saving record:', error);
      toast({
        title: "Save Failed",
        description: `Failed to save ${currentFile.name}: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRescan = () => {
    setScanningStage('idle');
    setCurrentFile(null);
    setScanResult(null);
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleViewRecords = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <CardTitle className="text-2xl">Upload Medical Records</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="standard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Enhanced AI Upload
              </TabsTrigger>
              <TabsTrigger value="offline" className="flex items-center gap-2">
                <CloudOff className="w-4 h-4" />
                Offline Mode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600">Scanning document with Enhanced AI...</p>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% complete</p>
                  </div>
                ) : scanningStage === 'results' && scanResult ? (
                  <DocumentScanResults 
                    result={scanResult}
                    fileName={currentFile?.name || 'Document'}
                    onSave={handleSaveRecord}
                    onRescan={handleRescan}
                  />
                ) : processedFiles.length > 0 && scanningStage === 'idle' ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium mb-2 text-green-700">Enhanced AI Processing Complete!</p>
                      <p className="text-sm text-gray-600 mb-4">
                        {processedFiles.length} file(s) analyzed with advanced OCR and medical entity extraction
                      </p>
                      <div className="space-y-1 mb-4">
                        {processedFiles.map((fileName, index) => (
                          <p key={index} className="text-xs text-gray-500">✓ {fileName}</p>
                        ))}
                      </div>
                      <Button onClick={handleViewRecords} className="mr-2">
                        View Dashboard
                      </Button>
                      <Button variant="outline" onClick={() => setProcessedFiles([])}>
                        Upload More
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Scan className="w-16 h-16 text-purple-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium mb-2">Document Scanning & Analysis</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Scan your medical documents to extract key information and get a summary
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Advanced OCR Text Extraction</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Medical Entity Recognition</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Intelligent Auto-Categorization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Confidence Scoring</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                       multiple
                      />
                      <label htmlFor="file-upload">
                        <Button className="cursor-pointer" size="lg" type="button">
                          <Scan className="w-5 h-5 mr-2" />
                          Scan Document with AI
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-500 space-y-1">
                <p>Supported formats: PDF, JPG, PNG, DOC, DOCX</p>
                <p>Maximum file size: 10MB per file</p>
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Enhanced AI processing includes OCR and medical entity extraction</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="offline">
              <OfflineUpload />
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip for now
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="flex-1">
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadRecord;
