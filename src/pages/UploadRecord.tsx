import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; 
import { Heart, FileText, Brain, CloudOff, CheckCircle, AlertCircle, Scan, Upload, Wifi, WifiOff, Shield, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingFiles, setPendingFiles] = useState<any[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(Array.from(files));
    }
  };

  const processFiles = async (files: File[]) => {
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
    if (files.length === 0) return;
    
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
          if (prev >= 40) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 300);
      
      // Step 1: Upload file to Supabase Storage
      if (!isOffline && user) {
        const uploadResult = await FileUploadService.uploadFile(
          file, 
          user.id,
          (progress) => {
            setUploadProgress(40 + progress.percentage * 0.3); // 40-70% progress
          }
        );
        
        if (!uploadResult || !uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }
        
        // Update progress to indicate upload is complete
        setUploadProgress(70);
        
        // Step 2: Scan document with enhanced AI
        const scanResult = await DocumentScanningService.scanDocument(file); 
        
        // Update progress to indicate scanning is complete
        setUploadProgress(100);
        
        // Step 3: Process with AI for categorization and tagging
        const analysis = await AIDocumentProcessor.analyzeDocument(file);
        
        // Step 4: Create health record in database 
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
            tags: analysis.tags,
            summary: scanResult.summary,
            keyFindings: scanResult.keyFindings,
            criticalValues: scanResult.criticalValues,
            recommendations: scanResult.recommendations
          },
          date_of_record: new Date().toISOString().split('T')[0]
        });
        
        // Show results
        setScanResult(scanResult);
        setScanningStage('results'); 
        
        toast({
          title: "Document Processed Successfully",
          description: `${file.name} analyzed with ${Math.round(scanResult.confidence * 100)}% confidence`,
        });
      } else {
        // Handle offline mode
        handleOfflineUpload([file]); 
        clearInterval(progressInterval);
        setUploadProgress(0);
        setScanningStage('idle');
      }
    } catch (error: any) {
      console.error('Error processing document:', error);
      toast({
        title: "Processing Failed", 
        description: `Failed to process ${file.name}: ${error.message}`,
        variant: "destructive"
      });
      setScanningStage('idle');
    }
    
    setIsProcessing(false);
  };

  const handleOfflineUpload = async (files: File[]) => { 
    // Store files locally for later sync
    const newPendingFiles = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'pending'
    }));
    
    setPendingFiles([...pendingFiles, ...newPendingFiles]);
    
    // Store in localStorage
    const stored = localStorage.getItem('lifebook-offline-uploads');
    const storedFiles = stored ? JSON.parse(stored) : [];
    localStorage.setItem('lifebook-offline-uploads', JSON.stringify([...storedFiles, ...newPendingFiles]));
    
    toast({
      title: "Saved Offline",
      description: `${files.length} file(s) will sync when you're back online`,
    });
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

  const handleScanButtonClick = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  
  return ( 
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Upload Medical Records</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {isOffline ? ( 
                <div className="flex items-center gap-1 bg-orange-500/20 text-white px-3 py-1 rounded-full text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span>Offline Mode</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-green-500/20 text-white px-3 py-1 rounded-full text-sm">
                  <Wifi className="w-4 h-4" />
                  <span>Online</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-white/80 mt-2 text-sm">
            {isOffline 
              ? "Files will be stored locally and synced when you're back online"  
              : "Upload and analyze your medical documents with AI-powered scanning"}
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
                {isProcessing ? ( 
                  <div className="space-y-4">
                    <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-700 text-lg font-medium">Scanning document with Enhanced AI...</p>
                    <Progress value={uploadProgress} className="w-full h-2" />
                    <p className="text-sm text-gray-600">{Math.round(uploadProgress)}% complete</p>
                  </div>
                ) : scanningStage === 'results' && scanResult ? (
                  <DocumentScanResults  
                    result={scanResult}
                    fileName={currentFile?.name || 'Document'}
                    onSave={handleSaveRecord}
                    onRescan={handleRescan}
                  />
                ) : processedFiles.length > 0 && scanningStage === 'idle' ? (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"> 
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold mb-2 text-green-700">Enhanced AI Processing Complete!</p>
                      <p className="text-base text-gray-600 mb-4">
                        {processedFiles.length} file(s) analyzed with advanced OCR and medical entity extraction
                      </p>
                      <div className="space-y-1 mb-4"> 
                        {processedFiles.map((fileName, index) => (
                          <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {fileName}
                          </p>
                        ))}
                      </div>
                      <Button onClick={handleViewRecords} className="mr-2 bg-blue-600 hover:bg-blue-700"> 
                        View Dashboard
                      </Button>
                      <Button variant="outline" onClick={() => setProcessedFiles([])}>
                        Upload More
                      </Button>
                    </div>
                  </div>
                ) : ( 
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Scan className="w-14 h-14 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold mb-3">Smart Document Analysis</p>
                      <p className="text-base text-gray-600 mb-6">
                        {isOffline  
                          ? "Upload your medical documents for later processing when you're back online" 
                          : "Scan your medical documents to extract key information and get a summary"}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">AI Analysis</span> 
                          </div>
                          <p className="text-sm text-gray-600">Advanced OCR and medical entity recognition</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Auto-Categorization</span>
                          </div> 
                          <p className="text-sm text-gray-600">Intelligent document classification</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CloudOff className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">Offline Support</span>
                          </div>
                          <p className="text-sm text-gray-600">Works even without internet connection</p> 
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-amber-600" />
                            <span className="font-medium">Secure Storage</span>
                          </div>
                          <p className="text-sm text-gray-600">End-to-end encrypted document storage</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        multiple
                      />
                      <Button className="cursor-pointer w-full" size="lg" type="button" onClick={handleScanButtonClick}>
                        {isOffline ? (
                            <Upload className="w-5 h-5 mr-2" />
                          ) : (
                            <Scan className="w-5 h-5 mr-2" />
                          )}
                          {isOffline ? "Upload Document for Later" : "Scan Document with AI"}
                        </Button>
                    </div>
                  </div>
                )}
            </div>
            
            {/* Pending Files Section (Only shown when there are pending files) */}
            {pendingFiles.length > 0 && (
              <div className="mt-8 border-t pt-6"> 
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CloudOff className="w-5 h-5 text-orange-500" />
                  Pending Uploads ({pendingFiles.length})
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {pendingFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3"> 
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div> 
                      <div className="flex items-center gap-2">
                        <div className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                          Pending
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <div className="flex items-center gap-2 mb-2"> 
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Upload Information</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Supported formats: PDF, JPG, PNG, DOC, DOCX</p>
                <p>• Maximum file size: 10MB per file</p>
                <p>• {isOffline 
                  ? "Files will be stored locally and processed when you're back online"  
                  : "Enhanced AI processing includes OCR and medical entity extraction"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip for now
              </Button>
              <Button onClick={() => navigate('/dashboard')} className="flex-1 bg-blue-600 hover:bg-blue-700">
                View Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadRecord;
