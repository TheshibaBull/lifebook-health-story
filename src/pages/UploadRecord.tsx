
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Heart, FileText, Brain, CloudOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OfflineUpload } from '@/components/OfflineUpload';
import { AIDocumentProcessor } from '@/services/aiDocumentProcessor';
import { FileStorageService } from '@/services/fileStorageService';
import { useToast } from '@/hooks/use-toast';

const UploadRecord = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    setIsProcessing(true);
    setUploadProgress(0);
    const processed: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Update progress
        setUploadProgress((i / files.length) * 50);
        
        // Validate file
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds the 10MB limit`,
            variant: "destructive"
          });
          continue;
        }

        // Process with AI
        toast({
          title: "Processing Document",
          description: `Analyzing ${file.name} with AI...`,
        });

        const analysis = await AIDocumentProcessor.analyzeDocument(file);
        
        // Update progress
        setUploadProgress(((i + 0.5) / files.length) * 100);
        
        // Save to storage
        const storedFile = await FileStorageService.saveFile(file, analysis);
        processed.push(storedFile.name);
        
        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
        
        toast({
          title: "Document Processed",
          description: `${file.name} categorized as ${analysis.category}`,
        });
        
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "Processing Failed",
          description: `Failed to process ${file.name}`,
          variant: "destructive"
        });
      }
    }

    setProcessedFiles(processed);
    setIsProcessing(false);
    
    if (processed.length > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully processed ${processed.length} file(s)`,
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
                AI-Powered Upload
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
                    <p className="text-gray-600">Processing your documents with AI...</p>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% complete</p>
                  </div>
                ) : processedFiles.length > 0 ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium mb-2 text-green-700">Upload Successful!</p>
                      <p className="text-sm text-gray-600 mb-4">
                        {processedFiles.length} file(s) processed and categorized
                      </p>
                      <div className="space-y-1 mb-4">
                        {processedFiles.map((fileName, index) => (
                          <p key={index} className="text-xs text-gray-500">✓ {fileName}</p>
                        ))}
                      </div>
                      <Button onClick={handleViewRecords} className="mr-2">
                        View Records
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
                      <p className="text-lg font-medium mb-2">Smart Document Processing</p>
                      <p className="text-sm text-gray-600 mb-4">
                        AI will automatically extract, categorize, and organize your medical records
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>OCR Text Extraction</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Auto-Categorization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Smart Tagging</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Medical Entity Detection</span>
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
                          Choose Files for AI Processing
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
                  <span>AI processing may take a few seconds per document</span>
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
