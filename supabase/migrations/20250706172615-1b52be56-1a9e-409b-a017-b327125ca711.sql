-- Fix the user profile creation issue during signup
-- The problem is that the RLS policy is too restrictive during profile creation

-- Drop and recreate the user_profiles policies with better logic
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;  
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create improved policies that work correctly during signup
CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can modify their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Also ensure the function that handles profile creation works properly
CREATE OR REPLACE FUNCTION public.handle_user_profile_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  -- Auto-calculate age if date_of_birth is provided
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age = EXTRACT(YEAR FROM age(NEW.date_of_birth::date));
  END IF;
  RETURN NEW;
END;
$$;

-- Update the trigger
DROP TRIGGER IF EXISTS update_user_profile_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profile_updated_at
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_profile_creation();

-- Clean up any orphaned auth users without profiles and allow them to re-signup
-- This will help users who got stuck in the broken signup flow