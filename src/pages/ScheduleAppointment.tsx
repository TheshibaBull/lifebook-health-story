
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, User, Phone, Mail, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { toast } from '@/hooks/use-toast';

const ScheduleAppointment = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appointmentTypes = [
    'General Consultation',
    'Follow-up Visit',
    'Preventive Care',
    'Specialist Consultation',
    'Emergency Visit',
    'Telemedicine',
  ];

  const doctors = [
    'Dr. Sarah Johnson - Cardiologist',
    'Dr. Michael Chen - General Practitioner',
    'Dr. Emily Davis - Dermatologist',
    'Dr. Robert Wilson - Neurologist',
    'Dr. Lisa Martinez - Pediatrician',
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !appointmentType || !doctorName || !patientName || !patientPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Appointment Scheduled!",
        description: `Your appointment has been scheduled for ${format(selectedDate, 'PPP')} at ${selectedTime}.`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setAppointmentType('');
      setDoctorName('');
      setPatientName('');
      setPatientPhone('');
      setPatientEmail('');
      setNotes('');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Schedule Appointment">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Schedule Appointment</h1>
            <p className="text-lg text-gray-600">Book your next medical appointment with ease</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Information Section */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="w-6 h-6" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="patientName" className="text-sm font-semibold text-gray-700">
                      Patient Name *
                    </Label>
                    <Input
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter full name"
                      className="h-12"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="patientPhone" className="text-sm font-semibold text-gray-700">
                      Phone Number *
                    </Label>
                    <Input
                      id="patientPhone"
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="patientEmail" className="text-sm font-semibold text-gray-700">
                    Email Address (Optional)
                  </Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details Section */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Stethoscope className="w-6 h-6" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Appointment Type *</Label>
                    <Select value={appointmentType} onValueChange={setAppointmentType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Select Doctor *</Label>
                    <Select value={doctorName} onValueChange={setDoctorName}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose your doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor} value={doctor}>
                            {doctor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Section */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarIcon className="w-6 h-6" />
                  Date & Time Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Appointment Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date() || date.getDay() === 0}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Time Slot *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="h-12">
                        <Clock className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes Section */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Mail className="w-6 h-6" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific concerns, symptoms, or requirements you'd like to mention..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Section */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                type="submit" 
                className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="h-14 px-8 text-lg font-semibold border-2"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default ScheduleAppointment;
