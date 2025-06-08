
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Clock, Heart } from 'lucide-react';

const PredictiveReminders = () => {
  const reminders = [
    {
      title: 'Thyroid Test Due',
      description: 'Based on your medical history, annual thyroid test is recommended.',
      dueDate: 'Due in 2 weeks',
      priority: 'high',
      type: 'lab'
    },
    {
      title: 'Blood Sugar Tracking',
      description: "You haven't uploaded a sugar report in 3 months. Continue tracking?",
      dueDate: 'Overdue',
      priority: 'medium',
      type: 'monitoring'
    },
    {
      title: 'Follow-up ECG',
      description: 'You had chest pain symptoms 2x last year. Consider follow-up ECG.',
      dueDate: 'Recommended',
      priority: 'medium',
      type: 'followup'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="text-orange-500" />
          Smart Health Nudges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.map((reminder, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {reminder.type === 'lab' && <Calendar className="w-4 h-4 text-blue-500" />}
              {reminder.type === 'monitoring' && <Clock className="w-4 h-4 text-green-500" />}
              {reminder.type === 'followup' && <Heart className="w-4 h-4 text-red-500" />}
              <div>
                <p className="font-medium text-sm">{reminder.title}</p>
                <p className="text-xs text-gray-600">{reminder.description}</p>
                <Badge 
                  variant={reminder.priority === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs mt-1"
                >
                  {reminder.dueDate}
                </Badge>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Book Now
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export { PredictiveReminders };
