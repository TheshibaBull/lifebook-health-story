
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Eye, 
  FileText, 
  Activity, 
  Lightbulb, 
  Target,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { AIImageAnalysisService, ImageAnalysisResult } from '@/services/aiImageAnalysisService';
import { useToast } from '@/hooks/use-toast';

interface DetailedAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  fileName: string;
}

export const DetailedAnalysisDialog = ({ 
  open, 
  onOpenChange, 
  imageUrl, 
  fileName 
}: DetailedAnalysisDialogProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const { toast } = useToast();

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await AIImageAnalysisService.analyzeImage(imageUrl);
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "AI has successfully analyzed the image",
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisIcon = (type: string) => {
    if (type.includes('Medical')) return <Activity className="w-5 h-5 text-red-500" />;
    if (type.includes('Data')) return <Target className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Detailed Analysis - {fileName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Image Preview */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <img 
                  src={imageUrl} 
                  alt={fileName} 
                  className="max-w-full max-h-64 object-contain rounded-lg border"
                />
              </div>
            </CardContent>
          </Card>

          {!analysisResult && !isAnalyzing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Ready for AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Our AI will analyze this image to extract text, identify objects, 
                  detect medical information, and provide insights and recommendations.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Object Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Text Extraction (OCR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Medical Entity Recognition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Smart Recommendations</span>
                  </div>
                </div>
                <Button onClick={startAnalysis} className="w-full">
                  <Brain className="w-4 h-4 mr-2" />
                  Start AI Analysis
                </Button>
              </CardContent>
            </Card>
          )}

          {isAnalyzing && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                  <h3 className="text-lg font-semibold">Analyzing Image with AI...</h3>
                  <p className="text-gray-600">
                    Please wait while our AI processes and analyzes the image content.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* Analysis Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getAnalysisIcon(analysisResult.analysisType)}
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Analysis Type:</span>
                      <Badge variant="outline">{analysisResult.analysisType}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${analysisResult.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round(analysisResult.confidence * 100)}%</span>
                      </div>
                    </div>
                    <Separator />
                    <p className="text-gray-700">{analysisResult.summary}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Detected Objects */}
              {analysisResult.detectedObjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      Detected Objects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.detectedObjects.map((object, index) => (
                        <Badge key={index} variant="secondary">{object}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Extracted Text */}
              {analysisResult.textContent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Extracted Text (OCR)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {analysisResult.textContent}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medical Findings */}
              {analysisResult.medicalFindings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-600" />
                      Medical Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResult.medicalFindings.map((finding, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Metrics */}
              {analysisResult.keyMetrics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Key Measurements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keyMetrics.map((metric, index) => (
                        <Badge key={index} variant="outline" className="font-mono">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {analysisResult && (
            <Button onClick={() => {
              toast({
                title: "Analysis Saved",
                description: "The detailed analysis has been noted for your records",
              });
            }}>
              Save Analysis
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
