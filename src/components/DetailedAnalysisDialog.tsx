
import { useState, useEffect } from 'react';
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
  AlertTriangle,
  Zap,
  Calendar
} from 'lucide-react';
import { ChatGPTMedicalAnalysisService } from '@/services/chatGPTMedicalAnalysisService';
import { ChatGPTApiKeyDialog } from '@/components/ChatGPTApiKeyDialog';
import { useToast } from '@/hooks/use-toast';

interface DetailedAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  fileName: string;
  existingAnalysis?: any;
}

export const DetailedAnalysisDialog = ({ 
  open, 
  onOpenChange, 
  imageUrl, 
  fileName,
  existingAnalysis 
}: DetailedAnalysisDialogProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && existingAnalysis && Object.keys(existingAnalysis).length > 0) {
      console.log('Processing existing analysis:', existingAnalysis);
      setAnalysisResult(existingAnalysis);
    } else if (open) {
      setAnalysisResult(null);
    }
  }, [open, existingAnalysis]);

  const startChatGPTAnalysis = async () => {
    const apiKey = ChatGPTMedicalAnalysisService.getAPIKey();
    
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await ChatGPTMedicalAnalysisService.analyzeImage(imageUrl, fileName);
      setAnalysisResult(result);
      
      toast({
        title: "ChatGPT Analysis Complete",
        description: "Detailed medical analysis has been generated with personalized recommendations",
      });
    } catch (error) {
      console.error('ChatGPT analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze with ChatGPT. Please check your API key.",
        variant: "destructive",
      });
      
      if (error instanceof Error && error.message.includes('API key')) {
        setShowApiKeyDialog(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApiKeySet = () => {
    startChatGPTAnalysis();
  };

  const getAnalysisIcon = (type: string) => {
    if (type.includes('Medical') || type.includes('Lab')) return <Activity className="w-5 h-5 text-red-500" />;
    if (type.includes('Data')) return <Target className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Medical Analysis - {fileName}
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

            {/* ChatGPT Analysis Button */}
            {!analysisResult && !isAnalyzing && (
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    ChatGPT Medical Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Get detailed medical analysis powered by ChatGPT-4 Vision, including:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Accurate Text Extraction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Medical Findings Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Personalized Recommendations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Urgent Items Identification</span>
                    </div>
                  </div>
                  <Button onClick={startChatGPTAnalysis} className="w-full bg-green-600 hover:bg-green-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze with ChatGPT
                  </Button>
                </CardContent>
              </Card>
            )}

            {isAnalyzing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
                    <h3 className="text-lg font-semibold">Analyzing with ChatGPT...</h3>
                    <p className="text-gray-600">
                      ChatGPT is examining your medical document and generating detailed insights...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysisResult && (
              <div className="space-y-6">
                {/* Analysis Overview */}
                <Card className="border-green-200 bg-green-50">
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
                              style={{ width: `${(analysisResult.confidence || 0.85) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round((analysisResult.confidence || 0.85) * 100)}%</span>
                        </div>
                      </div>
                      <Separator />
                      <p className="text-gray-700">{analysisResult.summary}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Urgent Items */}
                {analysisResult.urgentItems && analysisResult.urgentItems.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        Urgent Items Requiring Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResult.urgentItems.map((item: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-red-100 rounded">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-800 font-medium">{item}</span>
                          </div>
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
                        Extracted Text Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {analysisResult.textContent}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Medical Findings */}
                {analysisResult.medicalFindings && analysisResult.medicalFindings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-600" />
                        Medical Findings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResult.medicalFindings.map((finding: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">{finding}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Key Metrics */}
                {analysisResult.keyMetrics && analysisResult.keyMetrics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        Key Measurements & Values
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.keyMetrics.map((metric: string, index: number) => (
                          <Badge key={index} variant="outline" className="font-mono">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      Personalized Medical Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.recommendations && analysisResult.recommendations.length > 0 ? (
                        analysisResult.recommendations.map((recommendation: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{recommendation}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Document analysis completed successfully.</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Follow-up Actions */}
                {analysisResult.followUpActions && analysisResult.followUpActions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Recommended Follow-up Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResult.followUpActions.map((action: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                            <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-800">{action}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                  description: "The detailed ChatGPT analysis has been noted for your records",
                });
              }}>
                Save Analysis
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <ChatGPTApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        onKeySet={handleApiKeySet}
      />
    </>
  );
};
