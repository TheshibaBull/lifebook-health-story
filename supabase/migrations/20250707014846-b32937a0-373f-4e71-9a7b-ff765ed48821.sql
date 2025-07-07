-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  gender TEXT,
  date_of_birth DATE,
  age INTEGER,
  blood_group TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  medications TEXT[],
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  account_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctor availability table
CREATE TABLE public.doctor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER NOT NULL DEFAULT 30,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  blood_group TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  medications TEXT[],
  emergency_contact BOOLEAN NOT NULL DEFAULT false,
  access_level TEXT NOT NULL DEFAULT 'read',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health records table
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  file_name TEXT,
  file_path TEXT,
  file_size INTEGER,
  file_type TEXT,
  extracted_text TEXT,
  medical_entities JSONB,
  ai_analysis JSONB,
  date_of_record DATE,
  provider_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health metrics table
CREATE TABLE public.health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own appointments" ON public.appointments
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own appointments" ON public.appointments
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for family_members
CREATE POLICY "Users can view their own family members" ON public.family_members
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own family members" ON public.family_members
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own family members" ON public.family_members
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own family members" ON public.family_members
FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for health_records
CREATE POLICY "Users can view their own health records" ON public.health_records
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own health records" ON public.health_records
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own health records" ON public.health_records  
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own health records" ON public.health_records
FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for health_metrics
CREATE POLICY "Users can view their own health metrics" ON public.health_metrics
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own health metrics" ON public.health_metrics
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Public read access for doctors and availability (so users can see available doctors)
CREATE POLICY "Anyone can view active doctors" ON public.doctors
FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view doctor availability" ON public.doctor_availability
FOR SELECT USING (is_available = true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors  
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
    BEFORE UPDATE ON public.family_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at
    BEFORE UPDATE ON public.health_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample doctors
INSERT INTO public.doctors (name, specialization, email, phone) VALUES
('Dr. Sarah Johnson', 'General Medicine', 'sarah.johnson@example.com', '+1-555-0101'),
('Dr. Michael Chen', 'Cardiology', 'michael.chen@example.com', '+1-555-0102'),
('Dr. Emily Davis', 'Dermatology', 'emily.davis@example.com', '+1-555-0103'),
('Dr. James Wilson', 'Orthopedics', 'james.wilson@example.com', '+1-555-0104'),
('Dr. Lisa Anderson', 'Pediatrics', 'lisa.anderson@example.com', '+1-555-0105');

-- Insert sample availability for doctors (Monday to Friday, 9 AM to 5 PM)
INSERT INTO public.doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration)
SELECT 
    d.id,
    generate_series(1, 5) as day_of_week,  -- Monday to Friday
    '09:00:00'::time as start_time,
    '17:00:00'::time as end_time,
    30 as slot_duration
FROM public.doctors d;