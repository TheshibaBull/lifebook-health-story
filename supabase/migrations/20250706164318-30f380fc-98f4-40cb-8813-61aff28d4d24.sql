-- Fix RLS policies for user_profiles to allow user registration

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;  
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Create new policies that work correctly with auth.uid()
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Update profiles table to ensure it has proper triggers
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  -- Auto-calculate age if date_of_birth is provided
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age = EXTRACT(YEAR FROM age(NEW.date_of_birth));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile updates
DROP TRIGGER IF EXISTS update_user_profile_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Ensure user_credentials policies work properly
DROP POLICY IF EXISTS "Users can read own credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "System can manage credentials" ON public.user_credentials;

CREATE POLICY "Users can read own credentials" 
ON public.user_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all credentials" 
ON public.user_credentials 
FOR ALL 
USING (true) 
WITH CHECK (true);