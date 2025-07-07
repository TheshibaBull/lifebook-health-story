-- Fix user_credentials RLS policies to ensure proper access control

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "System can manage all credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "Allow credentials creation" ON public.user_credentials;
DROP POLICY IF EXISTS "Allow credentials updates" ON public.user_credentials;

-- Create proper RLS policies for user_credentials table
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

CREATE POLICY "System can manage credentials for auth tracking"
  ON public.user_credentials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ensure the user_credentials table has proper structure
-- Add any missing columns if they don't exist
DO $$
BEGIN
  -- Check if email column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN email TEXT NOT NULL DEFAULT '';
  END IF;

  -- Check if login_attempts column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'login_attempts'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN login_attempts INTEGER DEFAULT 0;
  END IF;

  -- Check if last_login_at column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;

  -- Check if failed_login_attempts column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credentials' AND column_name = 'failed_login_attempts'
  ) THEN
    ALTER TABLE public.user_credentials ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON public.user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON public.user_credentials(email);
CREATE INDEX IF NOT EXISTS idx_user_credentials_last_login ON public.user_credentials(last_login_at);

-- Create or replace function to handle login tracking
CREATE OR REPLACE FUNCTION public.track_user_login(
  p_user_id UUID,
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user credentials tracking
  INSERT INTO public.user_credentials (
    user_id,
    email,
    login_attempts,
    last_login_at,
    last_login_ip,
    failed_login_attempts
  )
  VALUES (
    p_user_id,
    p_email,
    1,
    NOW(),
    p_ip_address,
    0
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

-- Create or replace function to handle failed login attempts
CREATE OR REPLACE FUNCTION public.track_failed_login(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update failed login attempts for the email
  UPDATE public.user_credentials 
  SET 
    failed_login_attempts = failed_login_attempts + 1,
    last_failed_login_at = NOW(),
    updated_at = NOW()
  WHERE email = p_email;
  
  -- If no record exists, we don't create one for failed attempts
  -- This prevents creating records for non-existent users
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.track_user_login(UUID, TEXT, INET) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_failed_login(TEXT, INET) TO authenticated;