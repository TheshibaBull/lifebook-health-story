
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Heart, Syringe, TestTube, Hospital, Bandage } from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  details: string;
  type: 'diagnosis' | 'surgery' | 'vaccination' | 'test' | 'illness' | 'treatment';
  fullDetails?: {
    doctor?: string;
    hospital?: string;
    medications?: string[];
    followUp?: string;
    notes?: string;
  };
}

const HealthTimeline = () => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const timelineEvents: TimelineEvent[] = [
    { 
      date: 'April 2024', 
      title: 'Hypertension Diagnosis', 
      description: 'Diagnosed with high blood pressure', 
      details: '30 mg/day medication started',
      type: 'diagnosis',
      fullDetails: {
        doctor: 'Dr. Smith',
        hospital: 'City General Hospital',
        medications: ['Lisinopril 30mg', 'Hydrochlorothiazide 25mg'],
        followUp: 'Follow-up in 3 months',
        notes: 'Patient advised lifestyle changes including low sodium diet and regular exercise'
      }
    },
    { 
      date: 'April 2024', 
      title: 'Knee Surgery', 
      description: 'Arthroscopic knee procedure performed', 
      details: '1 week recovery period',
      type: 'surgery',
      fullDetails: {
        doctor: 'Dr. Johnson',
        hospital: 'Orthopedic Specialty Center',
        medications: ['Pain medication', 'Anti-inflammatory'],
        followUp: 'Physical therapy in 2 weeks',
        notes: 'Successful arthroscopic meniscus repair. Patient to avoid heavy lifting for 6 weeks.'
      }
    },
    { 
      date: 'March 2024', 
      title: 'Flu Vaccination', 
      description: 'Annual flu vaccination administered', 
      details: 'Vaccination completed successfully',
      type: 'vaccination',
      fullDetails: {
        doctor: 'Dr. Brown',
        hospital: 'Community Health Center',
        notes: 'No adverse reactions observed. Next flu shot due October 2024.'
      }
    },
    { 
      date: 'February 2024', 
      title: 'Cholesterol Test', 
      description: 'Comprehensive lipid panel completed', 
      details: 'Results within normal range',
      type: 'test',
      fullDetails: {
        doctor: 'Dr. Wilson',
        hospital: 'Downtown Medical Lab',
        notes: 'Total cholesterol: 180 mg/dL, LDL: 110 mg/dL, HDL: 45 mg/dL. Continue current diet and exercise regimen.'
      }
    },
    { 
      date: 'December 2023', 
      title: 'Upper Respiratory Infection', 
      description: 'Treated for viral upper respiratory infection', 
      details: 'Full recovery achieved in 10 days',
      type: 'illness',
      fullDetails: {
        doctor: 'Dr. Davis',
        hospital: 'Urgent Care Center',
        medications: ['Rest', 'Fluids', 'Throat lozenges'],
        notes: 'Viral infection resolved without complications. No antibiotics needed.'
      }
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnosis': return Heart;
      case 'surgery': return Hospital;
      case 'vaccination': return Syringe;
      case 'test': return TestTube;
      case 'illness': return Bandage;
      case 'treatment': return Heart;
      default: return Heart;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diagnosis': return { bg: 'bg-red-500', text: 'text-red-500', badge: 'destructive' as const };
      case 'surgery': return { bg: 'bg-blue-500', text: 'text-blue-500', badge: 'default' as const };
      case 'vaccination': return { bg: 'bg-green-500', text: 'text-green-500', badge: 'secondary' as const };
      case 'test': return { bg: 'bg-purple-500', text: 'text-purple-500', badge: 'outline' as const };
      case 'illness': return { bg: 'bg-orange-500', text: 'text-orange-500', badge: 'destructive' as const };
      case 'treatment': return { bg: 'bg-teal-500', text: 'text-teal-500', badge: 'default' as const };
      default: return { bg: 'bg-gray-500', text: 'text-gray-500', badge: 'secondary' as const };
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-blue-500" />
            Health Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timelineEvents.map((event, index) => {
              const Icon = getTypeIcon(event.type);
              const colors = getTypeColor(event.type);
              
              return (
                <div key={index} className="relative">
                  {/* Timeline line */}
                  {index !== timelineEvents.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Timeline node with icon */}
                    <div 
                      className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center text-white flex-shrink-0 cursor-pointer hover:scale-110 transition-transform shadow-lg`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {/* Content */}
                    <div 
                      className="flex-1 bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.date}</p>
                        </div>
                        <Badge variant={colors.badge}>
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-1">{event.description}</p>
                      <p className="text-sm text-gray-500">{event.details}</p>
                      <p className="text-xs text-blue-500 mt-2">Click to view details →</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (() => {
                const Icon = getTypeIcon(selectedEvent.type);
                const colors = getTypeColor(selectedEvent.type);
                return (
                  <>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                    {selectedEvent.title}
                  </>
                );
              })()}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-lg">{selectedEvent.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <Badge variant={getTypeColor(selectedEvent.type).badge}>
                    {selectedEvent.type}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                <p className="text-gray-800">{selectedEvent.description}</p>
              </div>
              
              {selectedEvent.fullDetails && (
                <div className="space-y-3">
                  {selectedEvent.fullDetails.doctor && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Doctor</p>
                      <p>{selectedEvent.fullDetails.doctor}</p>
                    </div>
                  )}
                  
                  {selectedEvent.fullDetails.hospital && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hospital/Clinic</p>
                      <p>{selectedEvent.fullDetails.hospital}</p>
                    </div>
                  )}
                  
                  {selectedEvent.fullDetails.medications && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Medications/Treatment</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedEvent.fullDetails.medications.map((med, idx) => (
                          <li key={idx} className="text-sm">{med}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedEvent.fullDetails.followUp && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Follow-up</p>
                      <p>{selectedEvent.fullDetails.followUp}</p>
                    </div>
                  )}
                  
                  {selectedEvent.fullDetails.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Additional Notes</p>
                      <p className="text-sm text-gray-700">{selectedEvent.fullDetails.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export { HealthTimeline };
