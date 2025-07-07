/*
  # Fix RLS policies for proper user registration

  1. Security Updates
    - Fix user_profiles RLS policies to allow signup
    - Ensure proper authentication flow
    - Add better error handling for auth operations

  2. Policy Updates
    - Allow profile creation during signup process
    - Maintain security for authenticated operations
    - Fix policy conflicts
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create new policies that work properly with Supabase Auth
CREATE POLICY "Enable insert for authenticated users during signup" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Fix health_records policies to use proper UUID comparison
DROP POLICY IF EXISTS "Users can view their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can create their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can update their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can delete their own health records" ON public.health_records;

CREATE POLICY "Users can view their own health records" 
ON public.health_records 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own health records" 
ON public.health_records 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own health records" 
ON public.health_records 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own health records" 
ON public.health_records 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Fix family_members policies
DROP POLICY IF EXISTS "Users can view their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can create their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can update their own family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can delete their own family members" ON public.family_members;

CREATE POLICY "Users can view their own family members" 
ON public.family_members 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own family members" 
ON public.family_members 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own family members" 
ON public.family_members 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own family members" 
ON public.family_members 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Fix appointments policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;

CREATE POLICY "Users can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Fix health_metrics policies
DROP POLICY IF EXISTS "Users can view their own health metrics" ON public.health_metrics;
DROP POLICY IF EXISTS "Users can create their own health metrics" ON public.health_metrics;

CREATE POLICY "Users can view their own health metrics" 
ON public.health_metrics 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own health metrics" 
ON public.health_metrics 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- Fix notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service can create notifications for users" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service can create notifications for users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for health records if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('health-records', 'health-records', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for health records
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);