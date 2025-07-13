-- Fix the user_profiles RLS policy to allow profile creation during signup
DROP POLICY "Users can insert their own profile" ON public.user_profiles;

-- Create a more permissive insert policy that allows profile creation during signup
-- This checks that either the user is authenticated OR we're creating a profile with a valid auth user ID
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT WITH CHECK (
  auth.uid()::text = id::text OR 
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id::text = user_profiles.id::text)
);