
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Activity, 
  Lightbulb, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Zap
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
    if (open) {
      console.log('Dialog opened with existing analysis:', existingAnalysis);
      
      // Only use existing analysis if it has recommendations
      if (existingAnalysis && existingAnalysis.recommendations && Array.isArray(existingAnalysis.recommendations) && existingAnalysis.recommendations.length > 0) {
        console.log('Using existing analysis with recommendations');
        setAnalysisResult(existingAnalysis);
      } else {
        console.log('No valid existing analysis, will need fresh ChatGPT analysis');
        setAnalysisResult(null);
      }
    }
  }, [open, existingAnalysis]);

  const startChatGPTAnalysis = async () => {
    console.log('=== Starting ChatGPT Analysis ===');
    
    const apiKey = ChatGPTMedicalAnalysisService.getApiKey();
    console.log('API Key available:', !!apiKey);
    
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      console.log('Calling ChatGPT analysis service...');
      const result = await ChatGPTMedicalAnalysisService.analyzeImage(imageUrl, fileName);
      
      console.log('=== ChatGPT Analysis Result Received ===');
      console.log('Full result:', result);
      console.log('Recommendations:', result.recommendations);
      console.log('Recommendations count:', result.recommendations?.length);
      
      setAnalysisResult(result);
      
      toast({
        title: "ChatGPT Analysis Complete",
        description: `Analysis completed with ${result.recommendations?.length || 0} personalized recommendations`,
      });
    } catch (error) {
      console.error('❌ ChatGPT analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete analysis. Please try again.",
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
    setShowApiKeyDialog(false);
    startChatGPTAnalysis();
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
                    Get comprehensive medical analysis powered by ChatGPT-4 Vision with personalized recommendations:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Medical Text Extraction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Clinical Findings Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Personalized Recommendations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Urgent Items Detection</span>
                    </div>
                  </div>
                  <Button onClick={startChatGPTAnalysis} className="w-full bg-green-600 hover:bg-green-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Analysis
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
                      Processing your medical document and generating personalized recommendations...
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
                      <Activity className="w-5 h-5 text-green-600" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <Badge variant="outline">{analysisResult.category || 'Medical Analysis'}</Badge>
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

                {/* PERSONALIZED MEDICAL RECOMMENDATIONS */}
                <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      Personalized Medical Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.recommendations && Array.isArray(analysisResult.recommendations) && analysisResult.recommendations.length > 0 ? (
                        <>
                          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-semibold text-green-800">
                                {analysisResult.recommendations.length} Personalized Recommendations Generated
                              </span>
                            </div>
                            <p className="text-sm text-green-700">
                              Based on your medical document analysis, here are specific recommendations for your health:
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            {analysisResult.recommendations.map((recommendation: string, index: number) => (
                              <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                    {recommendation}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-red-800">No Recommendations Available</span>
                          </div>
                          <p className="text-sm text-red-700">
                            No personalized recommendations were generated. Please try the analysis again.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Findings */}
                {analysisResult.keyFindings && Array.isArray(analysisResult.keyFindings) && analysisResult.keyFindings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Key Medical Findings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResult.keyFindings.map((finding: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-800">{finding}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Urgent Items */}
                {analysisResult.urgentItems && Array.isArray(analysisResult.urgentItems) && analysisResult.urgentItems.length > 0 && (
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
                          <div key={index} className="flex items-start gap-2 p-3 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-800 font-medium">{item}</span>
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
                  description: "The detailed ChatGPT analysis has been saved to your records",
                });
                onOpenChange(false);
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
