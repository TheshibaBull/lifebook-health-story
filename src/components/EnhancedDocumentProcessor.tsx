
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Brain, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { RealTimeOCRService } from '@/services/realTimeOCRService';
import { EnhancedPushNotificationService } from '@/services/enhancedPushNotificationService';
import { OfflineDataSyncService } from '@/services/offlineDataSyncService';
import { useToast } from '@/hooks/use-toast';
import { DocumentAnalysisResults } from './DocumentAnalysisResults';

interface ProcessingResult {
  text: string;
  confidence: number;
  entities: any;
  category: string;
  tags: string[];
}

interface EnhancedDocumentProcessorProps {
  file: File;
  onProcessingComplete: (result: ProcessingResult) => void;
  onError: (error: string) => void;
}

export const EnhancedDocumentProcessor = ({ 
  file, 
  onProcessingComplete, 
  onError 
}: EnhancedDocumentProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const { toast } = useToast();

  const processDocument = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);
    setProcessingResult(null);
    
    try {
      // Stage 1: Initialize OCR
      setCurrentStage('Initializing AI models...');
      setProgress(10);
      await RealTimeOCRService.initialize();
      
      // Stage 2: Extract text
      setCurrentStage('Extracting text with OCR...');
      setProgress(30);
      const ocrResult = await RealTimeOCRService.extractText(file);
      
      // Stage 3: Analyze content
      setCurrentStage('Analyzing medical content...');
      setProgress(60);
      const category = categorizeDocument(file.name, ocrResult.text, ocrResult.entities);
      const tags = generateTags(ocrResult.text, ocrResult.entities);
      
      // Stage 4: Finalize
      setCurrentStage('Finalizing analysis...');
      setProgress(90);
      
      const result: ProcessingResult = {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        entities: ocrResult.entities,
        category,
        tags
      };
      
      setProgress(100);
      setCurrentStage('Complete!');
      setProcessingResult(result);
      
      // Send notification
      await EnhancedPushNotificationService.notifyDocumentProcessed(file.name, category);
      
      onProcessingComplete(result);
      
      toast({
        title: "Document Processed",
        description: `Successfully analyzed ${file.name} with ${Math.round(result.confidence * 100)}% confidence`,
      });
      
    } catch (error) {
      console.error('Document processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      onError(errorMessage);
      
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [file, onProcessingComplete, onError, toast]);

  const categorizeDocument = (fileName: string, content: string, entities: any): string => {
    const text = (fileName + ' ' + content).toLowerCase();
    
    if (entities.medications.length > 0 && (text.includes('prescription') || text.includes('rx'))) {
      return 'Prescriptions';
    }
    
    if (entities.measurements.length > 2 && (text.includes('blood') || text.includes('lab'))) {
      return 'Lab Results';
    }
    
    if (text.includes('x-ray') || text.includes('ct') || text.includes('mri')) {
      return 'Imaging';
    }
    
    if (text.includes('visit') || text.includes('consultation')) {
      return 'Visit Notes';
    }
    
    return 'General';
  };

  const generateTags = (content: string, entities: any): string[] => {
    const tags = new Set<string>();
    
    entities.conditions.forEach((condition: string) => {
      if (condition.includes('diabetes')) tags.add('Diabetes');
      if (condition.includes('hypertension')) tags.add('Hypertension');
      if (condition.includes('cholesterol')) tags.add('Cholesterol');
    });
    
    entities.medications.forEach((medication: string) => {
      if (medication.includes('insulin')) tags.add('Diabetes');
      if (medication.includes('lisinopril')) tags.add('Hypertension');
    });
    
    const text = content.toLowerCase();
    if (text.includes('urgent') || text.includes('emergency')) tags.add('Urgent');
    if (text.includes('routine') || text.includes('annual')) tags.add('Routine');
    
    return Array.from(tags);
  };

  if (processingResult) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Processing Complete!</span>
            </div>
          </CardContent>
        </Card>
        
        <DocumentAnalysisResults 
          result={processingResult} 
          fileName={file.name}
        />
        
        <Button 
          onClick={() => {
            setProcessingResult(null);
            setProgress(0);
            setCurrentStage('');
          }}
          variant="outline"
          className="w-full"
        >
          Process Another Document
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Enhanced AI Document Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isProcessing ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Process</h3>
            <p className="text-gray-600 mb-4">
              File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <Button onClick={processDocument} className="w-full">
              <Brain className="w-4 h-4 mr-2" />
              Start AI Processing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Processing Document</h3>
              <p className="text-gray-600 mb-4">{currentStage}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>OCR Text Extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Medical Entity Recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Auto-Categorization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Tag Generation</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
