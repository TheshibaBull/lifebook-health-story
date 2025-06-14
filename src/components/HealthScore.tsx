
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Heart, AlertTriangle } from 'lucide-react';

const HealthScore = () => {
  const healthScore = 87;
  
  const suggestions = [
    {
      title: "Blood Pressure Monitoring",
      description: "Your blood pressure readings have been rising. Monitor it daily and consult your doctor.",
      priority: "high",
      action: "Schedule appointment"
    },
    {
      title: "Cholesterol Test Due",
      description: "It's time for your annual cholesterol test. Schedule it with your healthcare provider.",
      priority: "medium", 
      action: "Book test"
    },
    {
      title: "Exercise Recommendation",
      description: "Based on your health data, incorporating 30 minutes of daily exercise would be beneficial.",
      priority: "low",
      action: "View plan"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            HealthScore Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              {/* Circular progress indicator */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  stroke="#e5e7eb" 
                  strokeWidth="8" 
                  fill="transparent"
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - healthScore / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{healthScore}</div>
                  <div className="text-xs text-gray-500">Health Score</div>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-lg font-semibold text-gray-800">Excellent Health</p>
              <p className="text-sm text-gray-600">Your overall health score based on recent data</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">85%</div>
                <div className="text-xs text-gray-500">Physical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">92%</div>
                <div className="text-xs text-gray-500">Mental</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">84%</div>
                <div className="text-xs text-gray-500">Preventive</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="text-red-500" />
            AI Health Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${getPriorityColor(suggestion.priority)}`} />
                      <h3 className="font-semibold">{suggestion.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {suggestion.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { HealthScore };
