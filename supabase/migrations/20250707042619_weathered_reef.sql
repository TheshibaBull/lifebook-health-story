/*
  # Fix RLS policies for user profiles and credentials

  1. Changes
    - Safely drop and recreate policies for user_profiles
    - Safely drop and recreate policies for user_credentials
    - Ensure proper permissions for signup and authentication

  2. Security
    - Allow profile creation during signup
    - Restrict profile access to owners
    - Ensure proper credential management
*/

-- Wrap everything in a transaction
BEGIN;

-- First check and drop existing policies for user_profiles
DO $$
BEGIN
  -- Drop user_profiles policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Allow profile creation during signup') THEN
    DROP POLICY "Allow profile creation during signup" ON public.user_profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile') THEN
    DROP POLICY "Users can view their own profile" ON public.user_profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile') THEN
    DROP POLICY "Users can update their own profile" ON public.user_profiles;
  END IF;
  
  -- Also check for other possible policy names
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can create their own profile') THEN
    DROP POLICY "Users can create their own profile" ON public.user_profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can modify their own profile') THEN
    DROP POLICY "Users can modify their own profile" ON public.user_profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Enable insert for authenticated users during signup') THEN
    DROP POLICY "Enable insert for authenticated users during signup" ON public.user_profiles;
  END IF;
END $$;

-- Create new policies for user_profiles
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

-- Now handle user_credentials policies
DO $$
BEGIN
  -- Drop user_credentials policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'Allow credentials creation') THEN
    DROP POLICY "Allow credentials creation" ON public.user_credentials;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'Allow credentials updates') THEN
    DROP POLICY "Allow credentials updates" ON public.user_credentials;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'System can manage all credentials') THEN
    DROP POLICY "System can manage all credentials" ON public.user_credentials;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'Users can read own credentials') THEN
    DROP POLICY "Users can read own credentials" ON public.user_credentials;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'System can manage credentials for auth tracking') THEN
    DROP POLICY "System can manage credentials for auth tracking" ON public.user_credentials;
  END IF;
END $$;

-- Create new policies for user_credentials
CREATE POLICY "Allow credentials creation"
ON public.user_credentials
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow credentials updates"
ON public.user_credentials
FOR UPDATE
USING (true);

CREATE POLICY "Users can read own credentials"
ON public.user_credentials
FOR SELECT
USING (auth.uid() = user_id);

COMMIT;