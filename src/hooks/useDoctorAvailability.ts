
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const useDoctorAvailability = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all active doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialization')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching doctors:', error);
        return;
      }

      setDoctors(data || []);
    };

    fetchDoctors();
  }, []);

  // Generate time slots based on doctor availability
  const fetchTimeSlots = async (doctorId: string, selectedDate: Date) => {
    if (!doctorId || !selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    setLoading(true);
    const dayOfWeek = selectedDate.getDay();
    const dateString = selectedDate.toISOString().split('T')[0];

    try {
      // Get doctor's availability for the selected day
      const { data: availability, error: availabilityError } = await supabase
        .from('doctor_availability')
        .select('start_time, end_time, slot_duration')
        .eq('doctor_id', doctorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (availabilityError) {
        console.error('Error fetching availability:', availabilityError);
        setAvailableTimeSlots([]);
        setLoading(false);
        return;
      }

      // Get existing appointments for the selected date
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', dateString)
        .in('status', ['scheduled', 'confirmed']);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      }

      // Generate time slots
      const slots: TimeSlot[] = [];
      const bookedTimes = new Set(appointments?.map(apt => apt.appointment_time) || []);

      availability?.forEach(({ start_time, end_time, slot_duration }) => {
        const startHour = parseInt(start_time.split(':')[0]);
        const startMinute = parseInt(start_time.split(':')[1]);
        const endHour = parseInt(end_time.split(':')[0]);
        const endMinute = parseInt(end_time.split(':')[1]);

        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += slot_duration || 30) {
          const hour = Math.floor(minutes / 60);
          const minute = minutes % 60;
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
          const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

          slots.push({
            time: displayTime,
            available: !bookedTimes.has(timeString)
          });
        }
      });

      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error('Error generating time slots:', error);
      setAvailableTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    doctors,
    availableTimeSlots,
    loading,
    fetchTimeSlots
  };
};
