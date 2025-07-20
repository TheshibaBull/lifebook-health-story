
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Scan,
  Camera,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/AppLayout';
import { BackToHome } from '@/components/BackToHome';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedUpload } from '@/hooks/useEnhancedUpload';
import { EnhancedDocumentProcessor } from '@/components/EnhancedDocumentProcessor';
import { OfflineStatusIndicator } from '@/components/OfflineStatusIndicator';

const UploadRecord = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showProcessor, setShowProcessor] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadFile, uploadDocument, uploadProgress, isUploading, resetProgress } = useEnhancedUpload();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await uploadFile(file, {
        title: title || file.name,
        description,
        type: 'health_record'
      });

      if (result.success) {
        // Reset form
        setSelectedFile(null);
        setTitle('');
        setDescription('');
        resetProgress();
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    await handleFileUpload(selectedFile);
  };

  const handleProcessingComplete = async (result: any) => {
    console.log('Processing complete:', result);
    setProcessingResult(result);
    setShowProcessor(false);
    setShowResults(true);
    
    // Upload the document with AI results
    if (selectedFile) {
      try {
        await uploadDocument(selectedFile, result);
        toast({
          title: "Document Processed & Saved",
          description: "Your document has been analyzed and saved to your health records.",
        });
      } catch (error) {
        console.error('Upload error after processing:', error);
      }
    }
  };

  const handleProcessingError = (error: string) => {
    console.error('Processing error:', error);
    setShowProcessor(false);
    toast({
      title: "Processing Failed",
      description: error,
      variant: "destructive"
    });
  };

  const startAIProcessing = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file first.",
        variant: "destructive"
      });
      return;
    }
    setShowProcessor(true);
    setShowResults(false);
  };

  return (
    <AppLayout title="Upload Health Record">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <BackToHome />
          <OfflineStatusIndicator />
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Health Record</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload medical documents, lab results, or any health-related files
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-500" />
                  Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          {selectedFile.type.startsWith('image/') ? (
                            <ImageIcon className="w-12 h-12 text-blue-500" />
                          ) : (
                            <FileText className="w-12 h-12 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedFile(null)}
                          >
                            Remove File
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={startAIProcessing}
                          >
                            <Scan className="w-4 h-4 mr-2" />
                            Process with AI
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drop your files here, or click to browse
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports PDF, images, and document files up to 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          id="file-upload"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileSelect(e.target.files[0]);
                            }
                          }}
                        />
                        <Label htmlFor="file-upload">
                          <Button type="button" asChild>
                            <span>Select File</span>
                          </Button>
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Blood Test Results - Jan 2024"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add any additional notes about this document..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{uploadProgress.stage}</span>
                        <span>{uploadProgress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* AI Processing & Results */}
            <div className="space-y-6">
              {showProcessor && selectedFile ? (
                <EnhancedDocumentProcessor 
                  file={selectedFile}
                  onProcessingComplete={handleProcessingComplete}
                  onError={handleProcessingError}
                />
              ) : showResults && processingResult ? (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      AI Analysis Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">Document Summary</h3>
                        <p className="text-green-700 text-sm">
                          This {processingResult.category.toLowerCase()} document was processed with {Math.round(processingResult.confidence * 100)}% confidence.
                          {processingResult.entities && processingResult.entities.medications && processingResult.entities.medications.length > 0 && ` Found ${processingResult.entities.medications.length} medication(s).`}
                          {processingResult.entities && processingResult.entities.conditions && processingResult.entities.conditions.length > 0 && ` Found ${processingResult.entities.conditions.length} condition(s).`}
                        </p>
                      </div>
                      
                      {processingResult.entities && processingResult.entities.medications && processingResult.entities.medications.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Medications Found:</h4>
                          <div className="flex flex-wrap gap-1">
                            {processingResult.entities.medications.map((med: string, index: number) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {med}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {processingResult.entities && processingResult.entities.conditions && processingResult.entities.conditions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Conditions Found:</h4>
                          <div className="flex flex-wrap gap-1">
                            {processingResult.entities.conditions.map((condition: string, index: number) => (
                              <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">AI Suggestions:</h4>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>• Document has been categorized as: {processingResult.category}</li>
                          <li>• Consider sharing this with your healthcare provider</li>
                          <li>• Keep track of any follow-up appointments mentioned</li>
                          {processingResult.entities && processingResult.entities.medications && processingResult.entities.medications.length > 0 && <li>• Add medications to your medication tracker</li>}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => {
                          setShowResults(false);
                          setSelectedFile(null);
                          setTitle('');
                          setDescription('');
                        }}
                        className="w-full"
                      >
                        Upload Another Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scan className="w-5 h-5 text-green-500" />
                        AI Processing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Our AI will automatically extract and organize key information from your documents.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>OCR Text Extraction</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Medical Entity Recognition</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Auto-Categorization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Tag Generation</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-500" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Scan className="w-4 h-4 mr-2" />
                        Scan Document
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        View All Records
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UploadRecord;
