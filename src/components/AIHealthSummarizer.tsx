
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const AIHealthSummarizer = () => {
  const insights = [
    {
      type: 'trend',
      title: 'Blood Pressure Pattern',
      description: 'BP has been elevated 4 times in past 6 months. Consider lifestyle changes.',
      severity: 'warning',
      icon: TrendingUp
    },
    {
      type: 'pattern',
      title: 'Respiratory Episodes',
      description: 'Patient has had 3 respiratory episodes since 2020. Monitor for asthma triggers.',
      severity: 'info',
      icon: AlertCircle
    },
    {
      type: 'positive',
      title: 'Vaccination Status',
      description: 'All vaccinations up to date. Next flu shot due in October 2024.',
      severity: 'success',
      icon: CheckCircle
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="text-purple-500" />
          AI Health Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
              <Icon className={`w-5 h-5 mt-1 ${
                insight.severity === 'warning' ? 'text-amber-500' :
                insight.severity === 'success' ? 'text-green-500' :
                'text-blue-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <Badge variant={
                    insight.severity === 'warning' ? 'destructive' :
                    insight.severity === 'success' ? 'default' :
                    'secondary'
                  } className="text-xs">
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          );
        })}
        <Button variant="outline" className="w-full mt-4">
          Generate Detailed Health Report
        </Button>
      </CardContent>
    </Card>
  );
};

export { AIHealthSummarizer };
