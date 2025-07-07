-- Verify and fix user_credentials RLS policies
-- This migration ensures all policies are correctly set up

-- First, let's check what policies currently exist
-- You can run this query to see current policies:
-- SELECT * FROM pg_policies WHERE tablename = 'user_credentials';

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "Users can insert own credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "Users can update own credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "System can manage credentials for auth tracking" ON public.user_credentials;
DROP POLICY IF EXISTS "System can manage all credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "Allow credentials creation" ON public.user_credentials;
DROP POLICY IF EXISTS "Allow credentials updates" ON public.user_credentials;

-- Ensure RLS is enabled
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
CREATE POLICY "Users can read own credentials"
  ON public.user_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
  ON public.user_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON public.user_credentials
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage credentials for tracking"
  ON public.user_credentials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ensure the table has all necessary columns
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN email TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'login_attempts'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN login_attempts INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'last_login_ip'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN last_login_ip INET;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'failed_login_attempts'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'last_failed_login_at'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN last_failed_login_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'account_locked_until'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN account_locked_until TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'password_changed_at'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN password_changed_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON public.user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON public.user_credentials(email);
CREATE INDEX IF NOT EXISTS idx_user_credentials_last_login ON public.user_credentials(last_login_at);

-- Create helper functions for login tracking
CREATE OR REPLACE FUNCTION public.track_user_login(
  p_user_id UUID,
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credentials (
    user_id,
    email,
    login_attempts,
    last_login_at,
    last_login_ip,
    failed_login_attempts,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_email,
    1,
    NOW(),
    p_ip_address,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    login_attempts = user_credentials.login_attempts + 1,
    last_login_at = NOW(),
    last_login_ip = p_ip_address,
    failed_login_attempts = 0,
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.track_failed_login(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_credentials 
  SET 
    failed_login_attempts = failed_login_attempts + 1,
    last_failed_login_at = NOW(),
    updated_at = NOW()
  WHERE email = p_email;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.track_user_login(UUID, TEXT, INET) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_failed_login(TEXT, INET) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_user_login(UUID, TEXT, INET) TO anon;
GRANT EXECUTE ON FUNCTION public.track_failed_login(TEXT, INET) TO anon;

-- Test query to verify policies are working
-- You can run this after the migration:
/*
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_credentials'
ORDER BY policyname;
*/