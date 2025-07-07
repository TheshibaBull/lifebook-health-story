import { useState, useEffect } from 'react';
import { ExerciseRecommendations } from '@/components/ExerciseRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Heart, AlertTriangle, ArrowLeft, Activity, Brain, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileAppLayout } from '@/components/MobileAppLayout';
import { useIsMobile } from '@/hooks/use-mobile';

const HealthScore = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const healthScore = 87;
  const [showExercisePlan, setShowExercisePlan] = useState(false);
  
  const suggestions = [
    {
      title: "Blood Pressure Monitoring",
      description: "Your blood pressure readings have been rising. Monitor it daily and consult your doctor.",
      priority: "high",
      action: "Schedule appointment",
      actionType: "appointment"
    },
    {
      title: "Cholesterol Test Due", 
      description: "It's time for your annual cholesterol test. Schedule it with your healthcare provider.",
      priority: "medium",
      action: "Book test",
      actionType: "test"
    },
    {
      title: "Exercise Recommendation",
      description: "Based on your health data, incorporating 30 minutes of daily exercise would be beneficial.",
      priority: "low",
      action: "View plan",
      actionType: "plan"
    }
  ];

  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case 'appointment':
        navigate('/schedule-appointment');
        break;
      case 'test':
        navigate('/book-test');
        break;
      case 'plan':
        setShowExercisePlan(true);
        break;
      default:
        break;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const healthMetrics = [
    { label: 'Physical', value: 85, color: 'text-green-500', bgColor: 'bg-green-50', icon: Activity },
    { label: 'Mental', value: 92, color: 'text-blue-500', bgColor: 'bg-blue-50', icon: Brain },
    { label: 'Preventive', value: 84, color: 'text-purple-500', bgColor: 'bg-purple-50', icon: Shield }
  ];

  if (isMobile) {
    return (
      <MobileAppLayout title="Health-Score" showTabBar={true}>
        <div className="px-4 py-6 space-y-6 bg-gradient-to-b from-blue-50/30 to-white min-h-screen">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4 p-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>

          {/* Main Health Score Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="text-center space-y-4">
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      stroke="rgba(255,255,255,0.3)" 
                      strokeWidth="8" 
                      fill="transparent"
                    />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      stroke="white" 
                      strokeWidth="8" 
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - healthScore / 100)}`}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{healthScore}</div>
                      <div className="text-sm opacity-90">Health Score</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold">Excellent Health</h2>
                  <p className="text-white/90">Your overall health score based on recent data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {healthMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className={`border-0 shadow-lg ${metric.bgColor}`}>
                  <CardContent className="p-4 text-center">
                    <IconComponent className={`w-6 h-6 mx-auto mb-2 ${metric.color}`} />
                    <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}%</div>
                    <div className="text-xs text-gray-600">{metric.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI Health Suggestions */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="text-red-500 w-5 h-5" />
                AI Health Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-4 h-4 ${getPriorityColor(suggestion.priority)}`} />
                          <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleActionClick(suggestion.actionType)}
                      >
                        {suggestion.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exercise Plan Modal/Section */}
          {showExercisePlan && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Exercise Recommendations</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowExercisePlan(false)}
                  >
                    ✕
                  </Button>
                </div>
                <div className="p-4">
                  <ExerciseRecommendations />
                </div>
              </div>
            </div>
          )}
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Health-Score</h1>
            <p className="text-lg text-gray-600">Comprehensive health analysis and insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Health Score - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Large Health Score Display */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
              <CardContent className="p-12 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8" />
                      <h2 className="text-3xl font-bold">Health-Score Dashboard</h2>
                    </div>
                    <p className="text-white/90 text-lg">Your comprehensive health overview</p>
                  </div>
                  
                  <div className="relative">
                    <div className="relative w-48 h-48">
                      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="50" 
                          stroke="rgba(255,255,255,0.3)" 
                          strokeWidth="6" 
                          fill="transparent"
                        />
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="50" 
                          stroke="white" 
                          strokeWidth="6" 
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - healthScore / 100)}`}
                          className="transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold">{healthScore}</div>
                          <div className="text-lg opacity-90">Health Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-2">Excellent Health</h3>
                  <p className="text-white/90">Your overall health score based on recent comprehensive data analysis</p>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Health Metrics */}
            <div className="grid grid-cols-3 gap-6">
              {healthMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <Card key={index} className={`border-0 shadow-lg ${metric.bgColor} hover:shadow-xl transition-shadow`}>
                    <CardContent className="p-6 text-center">
                      <IconComponent className={`w-8 h-8 mx-auto mb-4 ${metric.color}`} />
                      <div className={`text-3xl font-bold mb-2 ${metric.color}`}>{metric.value}%</div>
                      <div className="text-sm text-gray-600 font-medium">{metric.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* AI Health Suggestions - Right Side */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="text-red-500" />
                  AI Health Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`w-4 h-4 ${getPriorityColor(suggestion.priority)}`} />
                            <h3 className="font-semibold">{suggestion.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleActionClick(suggestion.actionType)}
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
        </div>

        {/* Exercise Plan Modal/Section */}
        {showExercisePlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Exercise Recommendations</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowExercisePlan(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-6">
                <ExerciseRecommendations />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthScore;
