/*
  # Fix user credentials table constraints

  1. Database Changes
    - Add unique constraint on user_id in user_credentials table
    - Add unique constraint on email in user_credentials table
    - Create or update track_user_login function to handle conflicts properly

  2. Security
    - Ensure proper constraints for data integrity
    - Handle login tracking without conflicts
*/

-- Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_credentials_user_id_key' 
    AND table_name = 'user_credentials'
  ) THEN
    ALTER TABLE user_credentials ADD CONSTRAINT user_credentials_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_credentials_email_key' 
    AND table_name = 'user_credentials'
  ) THEN
    ALTER TABLE user_credentials ADD CONSTRAINT user_credentials_email_key UNIQUE (email);
  END IF;
END $$;

-- Create or replace the track_user_login function
CREATE OR REPLACE FUNCTION track_user_login(p_user_id uuid, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user credentials with proper conflict handling
  INSERT INTO user_credentials (
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
    now(),
    inet_client_addr(),
    0
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    login_attempts = user_credentials.login_attempts + 1,
    last_login_at = now(),
    last_login_ip = inet_client_addr(),
    failed_login_attempts = 0,
    updated_at = now();
END;
$$;

-- Create or replace the track_failed_login function
CREATE OR REPLACE FUNCTION track_failed_login(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user_id from user_profiles table
  SELECT id INTO v_user_id
  FROM user_profiles
  WHERE email = p_email;
  
  IF v_user_id IS NOT NULL THEN
    -- Insert or update failed login attempt
    INSERT INTO user_credentials (
      user_id,
      email,
      login_attempts,
      failed_login_attempts,
      last_failed_login_at
    )
    VALUES (
      v_user_id,
      p_email,
      0,
      1,
      now()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      failed_login_attempts = user_credentials.failed_login_attempts + 1,
      last_failed_login_at = now(),
      account_locked_until = CASE 
        WHEN user_credentials.failed_login_attempts >= 4 THEN now() + interval '30 minutes'
        ELSE user_credentials.account_locked_until
      END,
      updated_at = now();
  END IF;
END;
$$;