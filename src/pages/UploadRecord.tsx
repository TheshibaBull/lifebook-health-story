import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Heart, FileText, Brain, CloudOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OfflineUpload } from '@/components/OfflineUpload';
import { AIDocumentProcessor } from '@/services/aiDocumentProcessor';
import { FileUploadService } from '@/services/fileUploadService';
import { HealthRecordsService } from '@/services/healthRecordsService';
import { PWAService } from '@/services/pwaService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const UploadRecord = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);
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

    setIsProcessing(true);
    setUploadProgress(0);
    const processed: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Validate file first
        const validation = FileUploadService.validateFile(file);
        if (!validation.valid) {
          toast({
            title: "Invalid File",
            description: validation.error,
            variant: "destructive"
          });
          continue;
        }

        setUploadProgress((i / files.length) * 25);

        toast({
          title: "Processing File",
          description: `Analyzing ${file.name} with enhanced AI...`,
        });

        // Upload file to Supabase Storage
        const uploadResult = await FileUploadService.uploadFile(
          file, 
          user.id,
          (progress) => {
            const totalProgress = ((i + progress.percentage / 100 * 0.3) / files.length) * 50;
            setUploadProgress(totalProgress);
          }
        );
        setUploadProgress(((i + 0.3) / files.length) * 50);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        // Process with Enhanced AI (now includes real OCR and medical entity extraction)
        const analysis = await AIDocumentProcessor.analyzeDocument(file);
        setUploadProgress(((i + 0.7) / files.length) * 75);

        // Create health record in database
        await HealthRecordsService.createRecord({
          user_id: user.id,
          title: file.name,
          category: analysis.category,
          tags: analysis.tags,
          file_name: file.name,
          file_path: uploadResult.data?.path,
          file_size: file.size,
          file_type: file.type,
          extracted_text: analysis.extractedText,
          medical_entities: analysis.medicalEntities,
          ai_analysis: {
            confidence: analysis.confidence,
            category: analysis.category,
            tags: analysis.tags
          },
          date_of_record: new Date().toISOString().split('T')[0]
        });

        processed.push(file.name);
        setUploadProgress(((i + 1) / files.length) * 100);
        
        toast({
          title: "Document Processed",
          description: `${file.name} analyzed with ${Math.round(analysis.confidence * 100)}% confidence`,
        });

        // Schedule background sync for offline capability
        await PWAService.scheduleBackgroundSync('health-data-sync');
        
      } catch (error: any) {
        console.error('Error processing file:', error);
        toast({
          title: "Processing Failed",
          description: `Failed to process ${file.name}: ${error.message}`,
          variant: "destructive"
        });
      }
    }

    setProcessedFiles(processed);
    setIsProcessing(false);
    
    if (processed.length > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully processed ${processed.length} file(s) with enhanced AI analysis`,
      });
    }
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
                    <p className="text-gray-600">Processing with Enhanced AI...</p>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% complete</p>
                  </div>
                ) : processedFiles.length > 0 ? (
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
                    <Brain className="w-16 h-16 text-purple-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium mb-2">Enhanced AI Document Processing</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Advanced OCR, medical entity extraction, and intelligent categorization
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
                        <Button className="cursor-pointer">
                          <Brain className="w-4 h-4 mr-2" />
                          Choose Files for Enhanced AI Processing
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
