-- Fix RLS policies to allow profile creation during signup
-- The issue is that auth.uid() is null during signup process

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can modify their own profile" ON public.user_profiles;

-- Create new policies that work during signup
CREATE POLICY "Allow profile creation during signup"
ON public.user_profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Fix user_credentials policies - MODIFIED to avoid duplicate policy error
-- First check if the policy exists before trying to create it
DO $$
BEGIN
  -- Drop the policy only if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_credentials' 
    AND policyname = 'System can manage all credentials'
  ) THEN
    DROP POLICY IF EXISTS "System can manage all credentials" ON public.user_credentials;
  END IF;
  
  -- Create the policy for credentials creation if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_credentials' 
    AND policyname = 'Allow credentials creation'
  ) THEN
    CREATE POLICY "Allow credentials creation"
    ON public.user_credentials
    FOR INSERT
    WITH CHECK (true);
  END IF;
  
  -- Create the policy for credentials updates if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_credentials' 
    AND policyname = 'Allow credentials updates'
  ) THEN
    CREATE POLICY "Allow credentials updates"
    ON public.user_credentials
    FOR UPDATE
    USING (true);
  END IF;
END $$;