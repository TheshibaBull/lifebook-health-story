
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

const HealthTimeline = () => {
  const timelineEvents = [
    { 
      date: 'April 2024', 
      title: 'Hypertension', 
      description: 'Diagnosed with high blood pressure', 
      details: '30 mg/day medication started',
      type: 'diagnosis'
    },
    { 
      date: 'April 2024', 
      title: 'Knee Surgery', 
      description: 'Web rotation procedure performed', 
      details: '1 week recovery period',
      type: 'surgery'
    },
    { 
      date: 'March 2024', 
      title: 'Asthma', 
      description: 'Health vaccination administered', 
      details: 'Vaccination completed',
      type: 'vaccination'
    },
    { 
      date: 'February 2024', 
      title: 'Cholesterol', 
      description: 'Blood test completed', 
      details: 'Normal range results',
      type: 'test'
    },
    { 
      date: 'December 2023', 
      title: 'Chickenpox', 
      description: 'Recovered from illness', 
      details: 'Full recovery achieved',
      type: 'illness'
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diagnosis': return 'destructive';
      case 'surgery': return 'default';
      case 'vaccination': return 'secondary';
      case 'test': return 'outline';
      case 'illness': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="text-blue-500" />
          Health Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative">
              {/* Timeline line */}
              {index !== timelineEvents.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.date}</p>
                    </div>
                    <Badge variant={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-1">{event.description}</p>
                  <p className="text-sm text-gray-500">{event.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { HealthTimeline };
