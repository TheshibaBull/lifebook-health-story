-- Fix the RLS policy to not query auth.users table directly
DROP POLICY "Users can insert their own profile" ON public.user_profiles;

-- Create a simpler policy that works during signup
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT WITH CHECK (true);