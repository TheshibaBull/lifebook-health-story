
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, FileText, Brain, CloudOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AIDocumentReader } from '@/components/AIDocumentReader';
import { OfflineUpload } from '@/components/OfflineUpload';

const UploadRecord = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAIReader, setShowAIReader] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const navigate = useNavigate();

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
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setShowAIReader(true);
    }, 2000);
  };

  const handleExtractedData = (data: any) => {
    console.log('Extracted data:', data);
    // Here you would typically save the data to your backend
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  if (showAIReader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <AIDocumentReader
          fileName={uploadedFileName}
          onExtractedData={handleExtractedData}
          onClose={() => {
            setShowAIReader(false);
            setUploadedFileName('');
          }}
        />
      </div>
    );
  }

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
                Standard Upload
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
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600">Uploading your document...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium mb-2">Upload with AI Analysis</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Our AI will automatically extract key information from your medical records
                      </p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-purple-600 font-medium">AI-Powered Extraction</span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button className="cursor-pointer">
                          Choose Files
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Supported formats: PDF, JPG, PNG, DOC, DOCX</p>
                <p>Maximum file size: 10MB</p>
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
            <Button onClick={() => navigate('/scanning')} className="flex-1">
              View Example
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadRecord;
