-- Fix RLS policies to allow profile creation during signup
-- The issue is that auth.uid() is null during signup process

-- Safely drop existing policies if they exist
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
CREATE POLICY "Users can create profiles during signup"
ON public.user_profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own profiles"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profiles"
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
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'Users can insert own credentials') THEN
    DROP POLICY "Users can insert own credentials" ON public.user_credentials;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'Users can update own credentials') THEN
    DROP POLICY "Users can update own credentials" ON public.user_credentials;
  END IF;
END $$;

-- Create new policies for user_credentials with unique names
CREATE POLICY "Credentials creation policy"
ON public.user_credentials
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Credentials update policy"
ON public.user_credentials
FOR UPDATE
USING (true);

CREATE POLICY "Credentials read policy"
ON public.user_credentials
FOR SELECT
USING (auth.uid() = user_id);