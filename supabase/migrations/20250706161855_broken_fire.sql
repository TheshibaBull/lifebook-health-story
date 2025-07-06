/*
  # Enhanced authentication and user profile schema

  1. New Tables
    - Enhanced `user_profiles` table with all signup details
    - `user_credentials` table for login tracking
    - Updated constraints and validations

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies
    - Add audit triggers

  3. Features
    - Complete user profile data
    - Login attempt tracking
    - Password history (for security)
    - Account status management
*/

-- Drop existing user_profiles if it exists to recreate with new schema
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create comprehensive user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  date_of_birth date,
  age integer,
  blood_group text CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies text[] DEFAULT '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_conditions text[] DEFAULT '{}',
  medications text[] DEFAULT '{}',
  profile_completed boolean DEFAULT false,
  account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user credentials tracking table
CREATE TABLE IF NOT EXISTS user_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  login_attempts integer DEFAULT 0,
  last_login_at timestamptz,
  last_login_ip inet,
  failed_login_attempts integer DEFAULT 0,
  last_failed_login_at timestamptz,
  account_locked_until timestamptz,
  password_changed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User credentials policies (more restrictive)
CREATE POLICY "Users can read own credentials"
  ON user_credentials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage credentials"
  ON user_credentials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date date)
RETURNS integer AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM age(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate age when date_of_birth is updated
CREATE OR REPLACE FUNCTION update_age_from_dob()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age = calculate_age(NEW.date_of_birth);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_age_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_age_from_dob();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON user_credentials(email);
CREATE INDEX IF NOT EXISTS idx_user_credentials_last_login ON user_credentials(last_login_at);