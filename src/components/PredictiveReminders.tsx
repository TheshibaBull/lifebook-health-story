
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Clock, Heart, Brain, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PredictiveReminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'lab' | 'monitoring' | 'followup' | 'preventive' | 'medication';
  predictionBasis: string;
  confidence: number;
  daysFromNow: number;
  completed?: boolean;
}

const PredictiveReminders = () => {
  const [reminders, setReminders] = useState<PredictiveReminder[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePredictiveReminders = async (): Promise<PredictiveReminder[]> => {
    // Simulate AI analysis of health patterns
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockPatientData = {
      age: 45,
      conditions: ['hypertension', 'pre-diabetes'],
      lastTests: {
        thyroid: new Date('2023-08-15'),
        bloodSugar: new Date('2024-03-10'),
        cholesterol: new Date('2023-11-20'),
        ecg: new Date('2023-06-10')
      },
      medications: ['Lisinopril', 'Metformin'],
      symptoms: ['headache', 'fatigue'],
      familyHistory: ['diabetes', 'heart disease']
    };

    const generatedReminders: PredictiveReminder[] = [];

    // Thyroid test prediction based on age and last test
    const daysSinceThyroid = Math.floor((new Date().getTime() - mockPatientData.lastTests.thyroid.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceThyroid > 300) {
      generatedReminders.push({
        id: '1',
        title: 'Annual Thyroid Function Test',
        description: 'Based on your age (45) and hypertension, annual thyroid screening is recommended.',
        dueDate: 'Overdue by 2 months',
        priority: 'high',
        type: 'lab',
        predictionBasis: 'Age + cardiovascular risk factors',
        confidence: 94,
        daysFromNow: -60
      });
    }

    // Blood sugar monitoring prediction
    const daysSinceBloodSugar = Math.floor((new Date().getTime() - mockPatientData.lastTests.bloodSugar.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceBloodSugar > 90) {
      generatedReminders.push({
        id: '2',
        title: 'Blood Sugar Monitoring',
        description: 'Pre-diabetic patients should monitor blood sugar every 3 months. Pattern analysis suggests increasing trend.',
        dueDate: 'Due in 1 week',
        priority: 'medium',
        type: 'monitoring',
        predictionBasis: 'Pre-diabetes diagnosis + family history',
        confidence: 87,
        daysFromNow: 7
      });
    }

    // ECG follow-up based on symptoms
    if (mockPatientData.symptoms.includes('chest pain') || mockPatientData.symptoms.includes('fatigue')) {
      generatedReminders.push({
        id: '3',
        title: 'Cardiac Function Assessment',
        description: 'Recent fatigue symptoms combined with hypertension warrant cardiac evaluation.',
        dueDate: 'Recommended within 2 weeks',
        priority: 'medium',
        type: 'followup',
        predictionBasis: 'Symptom correlation + cardiovascular risk',
        confidence: 82,
        daysFromNow: 14
      });
    }

    // Preventive care prediction
    generatedReminders.push({
      id: '4',
      title: 'Cholesterol Panel Review',
      description: 'Due to cardiovascular medications and family history, lipid panel recommended.',
      dueDate: 'Due in 3 weeks',
      priority: 'low',
      type: 'preventive',
      predictionBasis: 'Medication regimen + family history',
      confidence: 78,
      daysFromNow: 21
    });

    // Medication review prediction
    generatedReminders.push({
      id: '5',
      title: 'Medication Effectiveness Review',
      description: 'AI analysis suggests current BP medication may need adjustment based on recent readings.',
      dueDate: 'Schedule consultation',
      priority: 'medium',
      type: 'medication',
      predictionBasis: 'BP trend analysis + medication duration',
      confidence: 85,
      daysFromNow: 10
    });

    return generatedReminders;
  };

  const refreshReminders = async () => {
    setIsGenerating(true);
    try {
      const newReminders = await generatePredictiveReminders();
      setReminders(newReminders);
      toast({
        title: "Reminders Updated",
        description: `Generated ${newReminders.length} personalized health reminders`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to generate reminders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const completeReminder = (id: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, completed: true } : reminder
    ));
    toast({
      title: "Reminder Completed",
      description: "Great job staying on top of your health!",
    });
  };

  const dismissReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    toast({
      title: "Reminder Dismissed",
      description: "Reminder has been removed from your list",
    });
  };

  useEffect(() => {
    refreshReminders();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-amber-200 bg-amber-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lab': return Calendar;
      case 'monitoring': return Clock;
      case 'followup': return Heart;
      case 'preventive': return CheckCircle;
      case 'medication': return Bell;
      default: return Calendar;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-orange-500" />
            AI Health Predictions
            {isGenerating && (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refreshReminders} disabled={isGenerating}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.filter(r => !r.completed).map((reminder) => {
          const TypeIcon = getTypeIcon(reminder.type);
          return (
            <div key={reminder.id} className={`p-4 rounded-lg border-2 ${getPriorityColor(reminder.priority)} transition-all hover:shadow-md`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <TypeIcon className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{reminder.title}</h4>
                      <Badge variant={reminder.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {reminder.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {reminder.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{reminder.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="font-medium">{reminder.dueDate}</span>
                      <span>Basis: {reminder.predictionBasis}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 ml-3">
                  <Button size="sm" onClick={() => completeReminder(reminder.id)}>
                    Book/Complete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => dismissReminder(reminder.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {reminders.filter(r => !r.completed).length === 0 && !isGenerating && (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">All reminders completed! Great job maintaining your health.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { PredictiveReminders };
