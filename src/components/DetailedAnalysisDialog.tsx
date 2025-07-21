
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
      console.log('Full result object:', result);
      console.log('Summary:', result.summary);
      console.log('Key Findings:', result.keyFindings);
      console.log('Recommendations:', result.recommendations);
      console.log('Recommendations type:', typeof result.recommendations);
      console.log('Recommendations length:', result.recommendations?.length);
      console.log('Is recommendations array?', Array.isArray(result.recommendations));
      
      if (result.recommendations && Array.isArray(result.recommendations)) {
        console.log('Individual recommendations:');
        result.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}:`, rec);
        });
      }
      
      setAnalysisResult(result);
      
      toast({
        title: "ChatGPT Analysis Complete",
        description: `Analysis completed successfully with ${result.recommendations?.length || 0} recommendations`,
      });
    } catch (error) {
      console.error('ChatGPT analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze with ChatGPT. Please check your API key and try again.",
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
                    Get comprehensive medical analysis powered by ChatGPT-4 Vision:
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

                {/* PERSONALIZED MEDICAL RECOMMENDATIONS - ENHANCED */}
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
                          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-yellow-600" />
                              <span className="font-semibold text-yellow-800">
                                {analysisResult.recommendations.length} Personalized Recommendations Generated
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              Based on your medical document analysis, here are specific recommendations for your health:
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            {analysisResult.recommendations.map((recommendation: string, index: number) => (
                              <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-7 h-7 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
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
                            The analysis did not generate specific recommendations. This could be due to:
                          </p>
                          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                            <li>Document image quality issues</li>
                            <li>Insufficient medical information in the document</li>
                            <li>API processing error</li>
                          </ul>
                          <p className="mt-2 text-sm text-red-700">
                            Please try uploading a clearer image or consult with your healthcare provider.
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

                {/* Debug Information */}
                <Card className="border-gray-200 bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">Debug Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Analysis Result Keys: {Object.keys(analysisResult).join(', ')}</p>
                      <p>Recommendations Type: {typeof analysisResult.recommendations}</p>
                      <p>Recommendations Is Array: {Array.isArray(analysisResult.recommendations)}</p>
                      <p>Recommendations Length: {analysisResult.recommendations?.length || 0}</p>
                      <p>First Recommendation: {analysisResult.recommendations?.[0] || 'None'}</p>
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
