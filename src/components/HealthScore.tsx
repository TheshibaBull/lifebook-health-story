
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
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'w-4 h-4 text-red-500';
      case 'medium': return 'w-4 h-4 text-amber-500';
      case 'low': return 'w-4 h-4 text-green-500';
      default: return 'w-4 h-4 text-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            HealthScore Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
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
            
            <div className="mb-8">
              <p className="text-lg font-semibold text-gray-800">Excellent Health</p>
              <p className="text-sm text-gray-600">Your overall health score based on recent data</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-sm text-gray-600 mt-1">Physical</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">92%</div>
                <div className="text-sm text-gray-600 mt-1">Mental</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">84%</div>
                <div className="text-sm text-gray-600 mt-1">Preventive</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-600" />
            </div>
            AI Health Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className={`border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className={getPriorityIcon(suggestion.priority)} />
                      <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                        suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{suggestion.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="shrink-0 hover:bg-white hover:shadow-sm border-gray-300"
                  >
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
