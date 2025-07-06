
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDoctorAvailability } from '@/hooks/useDoctorAvailability';

const ScheduleAppointment = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { doctors, availableTimeSlots, loading, fetchTimeSlots } = useDoctorAvailability();

  const appointmentTypes = [
    'General Consultation',
    'Follow-up Visit',
    'Preventive Care',
    'Specialist Consultation',
    'Emergency Visit',
    'Telemedicine',
  ];

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedTime(''); // Reset selected time when doctor changes
    if (selectedDate) {
      fetchTimeSlots(doctorId, selectedDate);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset selected time when date changes
    if (date && selectedDoctorId) {
      fetchTimeSlots(selectedDoctorId, date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !appointmentType || !selectedDoctorId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          doctor_id: selectedDoctorId,
          appointment_date: selectedDate.toISOString().split('T')[0],
          appointment_time: selectedTime + ':00',
          appointment_type: appointmentType,
          notes: notes || null,
          status: 'scheduled'
        });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Appointment Scheduled!",
        description: `Your appointment has been scheduled for ${format(selectedDate, 'PPP')} at ${selectedTime}.`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setAppointmentType('');
      setSelectedDoctorId('');
      setNotes('');
      
    } catch (error) {
      console.error('Error scheduling appointment:', error);
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
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Schedule Appointment</h1>
            <p className="text-lg text-gray-600">Book your next medical appointment with ease</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
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
                    <Select value={selectedDoctorId} onValueChange={handleDoctorChange}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose your doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
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
                          onSelect={handleDateChange}
                          disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Available Time Slots *</Label>
                    <Select 
                      value={selectedTime} 
                      onValueChange={setSelectedTime}
                      disabled={!selectedDoctorId || !selectedDate || loading}
                    >
                      <SelectTrigger className="h-12">
                        <Clock className="mr-2 h-4 w-4" />
                        <SelectValue placeholder={
                          loading ? "Loading slots..." : 
                          !selectedDoctorId || !selectedDate ? "Select doctor and date first" : 
                          "Select time slot"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.length === 0 && selectedDoctorId && selectedDate && !loading ? (
                          <SelectItem value="no-slots" disabled>
                            No available slots for this date
                          </SelectItem>
                        ) : (
                          availableTimeSlots
                            .filter(slot => slot.available)
                            .map((slot) => (
                              <SelectItem key={slot.time} value={slot.time}>
                                {slot.time}
                              </SelectItem>
                            ))
                        )}
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
                  <Stethoscope className="w-6 h-6" />
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
