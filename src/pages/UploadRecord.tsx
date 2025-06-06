
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadRecord = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    handleFileUpload();
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      navigate('/scanning');
    }, 2000);
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <CardTitle className="text-2xl">Upload Record</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
                    <p className="text-lg font-medium mb-2">Upload a document</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Drag and drop your medical records here, or click to browse
                    </p>
                    <Button onClick={handleFileUpload}>
                      Choose Files
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Supported formats: PDF, JPG, PNG</p>
              <p>Maximum file size: 10MB</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip for now
              </Button>
              <Button onClick={() => navigate('/scanning')} className="flex-1">
                View Example
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadRecord;
