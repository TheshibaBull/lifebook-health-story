
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter } from 'recharts';
import { Calendar, TrendingUp, Filter, Download, Brain, Activity } from 'lucide-react';

interface HealthEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'diagnosis' | 'treatment' | 'test' | 'symptom' | 'medication' | 'lifestyle';
  severity: 'low' | 'medium' | 'high';
  dataPoints: { metric: string; value: number; unit: string }[];
  correlations: string[];
  aiInsights: string[];
  source: 'manual' | 'provider' | 'wearable' | 'lab';
}

interface HealthPattern {
  pattern: string;
  frequency: number;
  correlation: number;
  description: string;
  recommendation: string;
}

const DynamicHealthTimeline = () => {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [patterns, setPatterns] = useState<HealthPattern[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const generateDynamicEvents = (): HealthEvent[] => {
    const baseDate = new Date('2023-01-01');
    const events: HealthEvent[] = [];

    // Generate realistic health events with correlations
    for (let i = 0; i < 50; i++) {
      const eventDate = new Date(baseDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000)); // Weekly events
      const categories = ['diagnosis', 'treatment', 'test', 'symptom', 'medication', 'lifestyle'] as const;
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Create realistic correlations based on previous events
      const correlations = [];
      if (i > 10 && Math.random() > 0.6) {
        correlations.push('Seasonal pattern detected');
      }
      if (i > 20 && Math.random() > 0.7) {
        correlations.push('Stress correlation identified');
      }

      events.push({
        id: i.toString(),
        date: eventDate.toISOString().split('T')[0],
        title: generateEventTitle(category, i),
        description: generateEventDescription(category, i),
        category,
        severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        dataPoints: generateDataPoints(category, i),
        correlations,
        aiInsights: generateAIInsights(category, i),
        source: ['manual', 'provider', 'wearable', 'lab'][Math.floor(Math.random() * 4)] as any
      });
    }

    return events;
  };

  const generateEventTitle = (category: string, index: number): string => {
    const titles = {
      diagnosis: ['Hypertension Diagnosis', 'Type 2 Diabetes', 'Anxiety Disorder', 'Sleep Apnea'],
      treatment: ['Physical Therapy Session', 'Dental Cleaning', 'Eye Exam', 'Cardiology Consultation'],
      test: ['Blood Pressure Check', 'Glucose Test', 'Cholesterol Panel', 'ECG Reading'],
      symptom: ['Headache Episode', 'Fatigue Period', 'Joint Pain', 'Sleep Disturbance'],
      medication: ['Started Lisinopril', 'Metformin Dosage Increase', 'Vitamin D Supplement', 'Pain Medication'],
      lifestyle: ['Exercise Routine Started', 'Diet Change', 'Stress Management', 'Sleep Schedule Adjustment']
    };
    return titles[category as keyof typeof titles][index % titles[category as keyof typeof titles].length];
  };

  const generateEventDescription = (category: string, index: number): string => {
    const descriptions = {
      diagnosis: 'Confirmed through clinical examination and diagnostic tests',
      treatment: 'Regular treatment session with positive response',
      test: 'Routine monitoring with results within expected range',
      symptom: 'Self-reported symptom with detailed tracking',
      medication: 'Prescription adjustment based on clinical assessment',
      lifestyle: 'Lifestyle modification with measurable health impact'
    };
    return descriptions[category as keyof typeof descriptions];
  };

  const generateDataPoints = (category: string, index: number) => {
    const dataPoints = [];
    
    // Generate realistic data points based on category
    switch (category) {
      case 'test':
        dataPoints.push(
          { metric: 'Blood Pressure Systolic', value: 120 + Math.floor(Math.random() * 40), unit: 'mmHg' },
          { metric: 'Blood Pressure Diastolic', value: 70 + Math.floor(Math.random() * 20), unit: 'mmHg' },
          { metric: 'Heart Rate', value: 60 + Math.floor(Math.random() * 30), unit: 'bpm' }
        );
        break;
      case 'symptom':
        dataPoints.push(
          { metric: 'Pain Level', value: Math.floor(Math.random() * 10), unit: '/10' },
          { metric: 'Duration', value: Math.floor(Math.random() * 8), unit: 'hours' }
        );
        break;
      case 'lifestyle':
        dataPoints.push(
          { metric: 'Exercise Duration', value: Math.floor(Math.random() * 60), unit: 'minutes' },
          { metric: 'Steps', value: 5000 + Math.floor(Math.random() * 10000), unit: 'steps' }
        );
        break;
    }
    
    return dataPoints;
  };

  const generateAIInsights = (category: string, index: number): string[] => {
    const insights = [
      'Pattern analysis suggests correlation with weather changes',
      'Stress levels appear to influence this metric significantly',
      'Medication timing optimization could improve outcomes',
      'Sleep quality shows strong correlation with symptoms',
      'Exercise routine adjustments recommended based on data trends'
    ];
    return insights.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const generateHealthPatterns = (events: HealthEvent[]): HealthPattern[] => {
    return [
      {
        pattern: 'Blood Pressure Fluctuation',
        frequency: 85,
        correlation: 0.78,
        description: 'BP readings show weekly cyclical pattern correlating with work stress',
        recommendation: 'Consider stress management techniques during weekdays'
      },
      {
        pattern: 'Symptom Clusters',
        frequency: 72,
        correlation: 0.65,
        description: 'Headaches, fatigue, and sleep issues tend to occur together',
        recommendation: 'Comprehensive sleep study and stress evaluation recommended'
      },
      {
        pattern: 'Seasonal Health Variation',
        frequency: 68,
        correlation: 0.71,
        description: 'Health metrics deteriorate during winter months',
        recommendation: 'Vitamin D supplementation and light therapy consideration'
      },
      {
        pattern: 'Exercise Response Pattern',
        frequency: 91,
        correlation: 0.82,
        description: 'Consistent positive correlation between exercise and mood/energy',
        recommendation: 'Maintain current exercise routine, consider gradual intensity increase'
      }
    ];
  };

  const generateChartData = (events: HealthEvent[]) => {
    return events
      .filter(event => event.dataPoints.length > 0)
      .map(event => ({
        date: event.date,
        bloodPressure: event.dataPoints.find(dp => dp.metric.includes('Systolic'))?.value || null,
        heartRate: event.dataPoints.find(dp => dp.metric === 'Heart Rate')?.value || null,
        painLevel: event.dataPoints.find(dp => dp.metric === 'Pain Level')?.value || null,
        steps: event.dataPoints.find(dp => dp.metric === 'Steps')?.value || null,
        category: event.category,
        severity: event.severity
      }))
      .filter(item => item.bloodPressure || item.heartRate || item.painLevel);
  };

  const filterEvents = () => {
    let filtered = events;
    
    if (timeFilter !== 'all') {
      const now = new Date();
      const months = parseInt(timeFilter);
      const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
      filtered = filtered.filter(event => new Date(event.date) >= cutoff);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    
    return filtered;
  };

  useEffect(() => {
    const generatedEvents = generateDynamicEvents();
    setEvents(generatedEvents);
    setPatterns(generateHealthPatterns(generatedEvents));
    setChartData(generateChartData(generatedEvents));
  }, []);

  const filteredEvents = filterEvents();

  const chartConfig = {
    bloodPressure: { label: "Blood Pressure", color: "#ef4444" },
    heartRate: { label: "Heart Rate", color: "#3b82f6" },
    painLevel: { label: "Pain Level", color: "#f59e0b" }
  };

  return (
    <div className="space-y-6">
      {/* AI Pattern Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-purple-500" />
            AI Health Pattern Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((pattern, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{pattern.pattern}</h3>
                  <Badge variant="outline">{Math.round(pattern.correlation * 100)}% correlation</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  <strong>AI Recommendation:</strong> {pattern.recommendation}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Timeline Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-green-500" />
              Dynamic Health Metrics Timeline
            </CardTitle>
            <div className="flex gap-2">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="3">Last 3M</SelectItem>
                  <SelectItem value="6">Last 6M</SelectItem>
                  <SelectItem value="12">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="test">Tests</SelectItem>
                  <SelectItem value="symptom">Symptoms</SelectItem>
                  <SelectItem value="medication">Medications</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="bloodPressure" 
                stroke="#ef4444" 
                strokeWidth={2} 
                connectNulls={false}
                name="Blood Pressure" 
              />
              <Line 
                type="monotone" 
                dataKey="heartRate" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                connectNulls={false}
                name="Heart Rate" 
              />
              <Line 
                type="monotone" 
                dataKey="painLevel" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                connectNulls={false}
                name="Pain Level" 
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Enhanced Timeline Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-blue-500" />
            Dynamic Health Timeline ({filteredEvents.length} events)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredEvents.slice(0, 20).map((event, index) => (
              <div 
                key={event.id} 
                className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                    event.severity === 'high' ? 'bg-red-500' : 
                    event.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {event.source}
                      </Badge>
                    </div>
                  </div>
                  
                  {event.dataPoints.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Data:</strong> {event.dataPoints.map(dp => `${dp.metric}: ${dp.value} ${dp.unit}`).join(', ')}
                    </div>
                  )}
                  
                  {event.aiInsights.length > 0 && (
                    <div className="mt-1 text-xs text-purple-600">
                      <strong>AI Insight:</strong> {event.aiInsights[0]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p>{selectedEvent.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  <Badge>{selectedEvent.category}</Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p>{selectedEvent.description}</p>
              </div>
              
              {selectedEvent.dataPoints.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Health Data Points</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedEvent.dataPoints.map((point, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <p className="text-sm font-medium">{point.metric}</p>
                        <p className="text-lg">{point.value} {point.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.aiInsights.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">AI Insights</p>
                  <ul className="space-y-1">
                    {selectedEvent.aiInsights.map((insight, index) => (
                      <li key={index} className="text-sm p-2 bg-purple-50 rounded flex items-start gap-2">
                        <Brain className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedEvent.correlations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Pattern Correlations</p>
                  <ul className="space-y-1">
                    {selectedEvent.correlations.map((correlation, index) => (
                      <li key={index} className="text-sm p-2 bg-blue-50 rounded flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        {correlation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { DynamicHealthTimeline };
