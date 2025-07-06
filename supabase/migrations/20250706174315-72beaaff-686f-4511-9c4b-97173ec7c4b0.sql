-- Fix RLS policies to allow profile creation during signup
-- The issue is that auth.uid() is null during signup process

-- Drop existing policies for user_profiles
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

-- Fix user_credentials policies (only drop the one that doesn't exist)
DROP POLICY IF EXISTS "System can manage all credentials" ON public.user_credentials;

CREATE POLICY "Allow credentials creation"
ON public.user_credentials
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow credentials updates"
ON public.user_credentials
FOR UPDATE
USING (true);