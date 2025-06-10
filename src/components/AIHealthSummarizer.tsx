
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Activity, Heart, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthInsight {
  type: 'trend' | 'pattern' | 'positive' | 'warning' | 'recommendation';
  title: string;
  description: string;
  severity: 'success' | 'warning' | 'info' | 'critical';
  icon: any;
  confidence: number;
  actionable: boolean;
}

const AIHealthSummarizer = () => {
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const { toast } = useToast();

  const generateInsights = async (): Promise<HealthInsight[]> => {
    // Simulate AI analysis with realistic medical insights
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockHealthData = {
      bloodPressure: [135, 128, 142, 138, 145],
      heartRate: [72, 68, 75, 71, 74],
      weight: [75, 74.5, 75.2, 75.8, 76],
      symptoms: ['headache', 'fatigue', 'chest discomfort'],
      medications: ['Lisinopril', 'Metformin'],
      labResults: { cholesterol: 220, glucose: 115, hbA1c: 6.2 }
    };

    const generatedInsights: HealthInsight[] = [];

    // Blood pressure analysis
    const avgBP = mockHealthData.bloodPressure.reduce((a, b) => a + b, 0) / mockHealthData.bloodPressure.length;
    if (avgBP > 130) {
      generatedInsights.push({
        type: 'warning',
        title: 'Elevated Blood Pressure Pattern',
        description: `Average BP of ${avgBP.toFixed(0)} mmHg over 5 readings. Consider lifestyle modifications and medication review.`,
        severity: 'warning',
        icon: TrendingUp,
        confidence: 92,
        actionable: true
      });
    }

    // Symptom correlation analysis
    if (mockHealthData.symptoms.includes('headache') && mockHealthData.symptoms.includes('chest discomfort')) {
      generatedInsights.push({
        type: 'pattern',
        title: 'Cardiovascular Symptom Cluster',
        description: 'Recurring headaches with chest discomfort may indicate cardiovascular stress. Monitor closely.',
        severity: 'warning',
        icon: Heart,
        confidence: 78,
        actionable: true
      });
    }

    // Medication effectiveness
    generatedInsights.push({
      type: 'trend',
      title: 'Medication Response Analysis',
      description: 'Current Lisinopril dosage showing moderate effectiveness. Consider dose optimization.',
      severity: 'info',
      icon: Activity,
        confidence: 85,
        actionable: true
    });

    // Positive trend
    const heartRateVariability = Math.max(...mockHealthData.heartRate) - Math.min(...mockHealthData.heartRate);
    if (heartRateVariability < 10) {
      generatedInsights.push({
        type: 'positive',
        title: 'Stable Heart Rate Variability',
        description: 'Heart rate shows good stability, indicating good cardiovascular fitness.',
        severity: 'success',
        icon: CheckCircle,
        confidence: 94,
        actionable: false
      });
    }

    // Predictive analysis
    if (mockHealthData.labResults.hbA1c > 6.0) {
      generatedInsights.push({
        type: 'recommendation',
        title: 'Pre-diabetic Risk Pattern',
        description: 'HbA1c levels suggest increased diabetes risk. Recommend dietary intervention and exercise.',
        severity: 'warning',
        icon: Zap,
        confidence: 88,
        actionable: true
      });
    }

    return generatedInsights;
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const newInsights = await generateInsights();
      setInsights(newInsights);
      setLastAnalysis(new Date());
      toast({
        title: "Analysis Complete",
        description: `Generated ${newInsights.length} health insights from your data`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to complete health analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Auto-run analysis on component mount
    runAnalysis();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="text-purple-500" />
          AI Health Insights
          {isAnalyzing && (
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin ml-2"></div>
          )}
        </CardTitle>
        {lastAnalysis && (
          <p className="text-sm text-gray-600">
            Last analyzed: {lastAnalysis.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 && !isAnalyzing && (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No health data available for analysis</p>
          </div>
        )}

        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="flex items-start gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
              <Icon className={`w-5 h-5 mt-1 ${getSeverityColor(insight.severity)}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <Badge variant={
                    insight.severity === 'critical' ? 'destructive' :
                    insight.severity === 'warning' ? 'default' :
                    insight.severity === 'success' ? 'default' :
                    'secondary'
                  } className="text-xs">
                    {insight.confidence}% confidence
                  </Badge>
                  {insight.actionable && (
                    <Badge variant="outline" className="text-xs">
                      Actionable
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          );
        })}

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={runAnalysis} 
            disabled={isAnalyzing}
            variant="outline" 
            className="flex-1"
          >
            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
          <Button variant="default" className="flex-1">
            View Detailed Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { AIHealthSummarizer };
