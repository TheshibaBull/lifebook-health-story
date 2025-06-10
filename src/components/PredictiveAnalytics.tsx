
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Heart, Activity, Target } from 'lucide-react';

interface HealthPrediction {
  condition: string;
  probability: number;
  timeframe: string;
  riskFactors: string[];
  preventiveActions: string[];
  confidence: number;
  severity: 'low' | 'medium' | 'high';
}

interface HealthTrend {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'improving' | 'stable' | 'declining';
  factors: string[];
}

const PredictiveAnalytics = () => {
  const [predictions, setPredictions] = useState<HealthPrediction[]>([]);
  const [trends, setTrends] = useState<HealthTrend[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  const generatePredictions = (): HealthPrediction[] => {
    return [
      {
        condition: 'Type 2 Diabetes',
        probability: 23,
        timeframe: '5-10 years',
        riskFactors: ['Family history', 'BMI above normal', 'Age factor', 'Sedentary lifestyle'],
        preventiveActions: [
          'Maintain healthy weight (BMI 18.5-24.9)',
          'Exercise 150 minutes per week',
          'Reduce refined sugar intake',
          'Regular blood glucose monitoring'
        ],
        confidence: 78,
        severity: 'medium'
      },
      {
        condition: 'Cardiovascular Disease',
        probability: 31,
        timeframe: '10-15 years',
        riskFactors: ['Current hypertension', 'Cholesterol levels', 'Family history', 'Stress levels'],
        preventiveActions: [
          'BP control through medication compliance',
          'Mediterranean diet adoption',
          'Stress management techniques',
          'Regular cardio exercise'
        ],
        confidence: 85,
        severity: 'medium'
      },
      {
        condition: 'Osteoporosis',
        probability: 18,
        timeframe: '15-20 years',
        riskFactors: ['Age', 'Gender', 'Calcium intake', 'Exercise patterns'],
        preventiveActions: [
          'Increase calcium and Vitamin D intake',
          'Weight-bearing exercises',
          'Limit alcohol consumption',
          'Bone density screening'
        ],
        confidence: 72,
        severity: 'low'
      },
      {
        condition: 'Depression/Anxiety',
        probability: 15,
        timeframe: '2-5 years',
        riskFactors: ['Work stress', 'Sleep patterns', 'Social isolation', 'Life changes'],
        preventiveActions: [
          'Maintain social connections',
          'Regular sleep schedule (7-9 hours)',
          'Mindfulness practice',
          'Professional counseling if needed'
        ],
        confidence: 68,
        severity: 'low'
      }
    ];
  };

  const generateHealthTrends = (): HealthTrend[] => {
    return [
      {
        metric: 'Blood Pressure',
        currentValue: 135,
        predictedValue: 142,
        trend: 'declining',
        factors: ['Medication adherence decreasing', 'Sodium intake increasing', 'Stress levels rising']
      },
      {
        metric: 'Cardiovascular Fitness',
        currentValue: 75,
        predictedValue: 82,
        trend: 'improving',
        factors: ['Consistent exercise routine', 'Weight loss progress', 'Heart rate variability improving']
      },
      {
        metric: 'Sleep Quality',
        currentValue: 68,
        predictedValue: 65,
        trend: 'declining',
        factors: ['Screen time before bed', 'Caffeine intake timing', 'Work stress increasing']
      },
      {
        metric: 'Mental Health Score',
        currentValue: 78,
        predictedValue: 81,
        trend: 'improving',
        factors: ['Social activity increasing', 'Exercise routine established', 'Therapy sessions effective']
      }
    ];
  };

  const generateTrendChart = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      bloodPressure: 130 + Math.sin(index * 0.5) * 10 + Math.random() * 5,
      heartRate: 70 + Math.cos(index * 0.3) * 8 + Math.random() * 4,
      weight: 75 - (index * 0.5) + Math.random() * 2,
      sleepScore: 75 + Math.sin(index * 0.4) * 15 + Math.random() * 5,
      stressLevel: 40 + Math.cos(index * 0.6) * 20 + Math.random() * 8
    }));
  };

  useEffect(() => {
    setPredictions(generatePredictions());
    setTrends(generateHealthTrends());
    setTrendData(generateTrendChart());
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const chartConfig = {
    bloodPressure: { label: "Blood Pressure", color: "#ef4444" },
    heartRate: { label: "Heart Rate", color: "#3b82f6" },
    weight: { label: "Weight", color: "#10b981" },
    sleepScore: { label: "Sleep Score", color: "#8b5cf6" },
    stressLevel: { label: "Stress Level", color: "#f59e0b" }
  };

  return (
    <div className="space-y-6">
      {/* Health Risk Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-purple-500" />
            AI Health Risk Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions.map((prediction, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${getSeverityColor(prediction.severity)}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{prediction.condition}</h3>
                  <Badge variant="outline" className="text-xs">
                    {prediction.confidence}% confidence
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Risk Level</span>
                      <span className="text-sm">{prediction.probability}%</span>
                    </div>
                    <Progress value={prediction.probability} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">Timeframe: {prediction.timeframe}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium mb-1">Key Risk Factors:</p>
                    <ul className="text-xs space-y-1">
                      {prediction.riskFactors.slice(0, 3).map((factor, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium mb-1">Prevention Actions:</p>
                    <ul className="text-xs space-y-1">
                      {prediction.preventiveActions.slice(0, 2).map((action, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <Target className="w-2 h-2" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-green-500" />
            Predictive Health Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {trends.map((trend, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{trend.metric}</h3>
                  {getTrendIcon(trend.trend)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: {trend.currentValue}</span>
                    <span>Predicted: {trend.predictedValue}</span>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    <p className="font-medium mb-1">Influencing Factors:</p>
                    {trend.factors.map((factor, idx) => (
                      <p key={idx}>• {factor}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comprehensive Trend Chart */}
          <ChartContainer config={chartConfig} className="h-[400px]">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="bloodPressure" stroke="#ef4444" strokeWidth={2} name="Blood Pressure" />
              <Line type="monotone" dataKey="heartRate" stroke="#3b82f6" strokeWidth={2} name="Heart Rate" />
              <Line type="monotone" dataKey="sleepScore" stroke="#8b5cf6" strokeWidth={2} name="Sleep Score" />
              <Line type="monotone" dataKey="stressLevel" stroke="#f59e0b" strokeWidth={2} name="Stress Level" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export { PredictiveAnalytics };
