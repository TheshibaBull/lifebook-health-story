
-- Create doctors table to store doctor information and schedules
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create doctor availability table to manage time slots
CREATE TABLE public.doctor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER DEFAULT 30, -- minutes per slot
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create appointments table to track booked appointments
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctors (public read access)
CREATE POLICY "Anyone can view active doctors" 
  ON public.doctors 
  FOR SELECT 
  USING (is_active = true);

-- RLS policies for doctor availability (public read access)
CREATE POLICY "Anyone can view doctor availability" 
  ON public.doctor_availability 
  FOR SELECT 
  USING (is_available = true);

-- RLS policies for appointments
CREATE POLICY "Users can view their own appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" 
  ON public.appointments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert sample doctors
INSERT INTO public.doctors (name, specialization, email, phone) VALUES
('Dr. Sarah Johnson', 'Cardiologist', 'sarah.johnson@hospital.com', '(555) 123-4567'),
('Dr. Michael Chen', 'General Practitioner', 'michael.chen@hospital.com', '(555) 234-5678'),
('Dr. Emily Davis', 'Dermatologist', 'emily.davis@hospital.com', '(555) 345-6789'),
('Dr. Robert Wilson', 'Neurologist', 'robert.wilson@hospital.com', '(555) 456-7890'),
('Dr. Lisa Martinez', 'Pediatrician', 'lisa.martinez@hospital.com', '(555) 567-8901');

-- Insert sample availability (Monday to Friday, 9 AM to 5 PM with lunch break)
INSERT INTO public.doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration)
SELECT 
  d.id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '09:00'::time as start_time,
  '12:00'::time as end_time,
  30 as slot_duration
FROM public.doctors d
UNION ALL
SELECT 
  d.id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '14:00'::time as start_time,
  '17:00'::time as end_time,
  30 as slot_duration
FROM public.doctors d;
