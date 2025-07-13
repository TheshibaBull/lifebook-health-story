/*
  # Create health records schema

  1. New Tables
    - `health_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `category` (text)
      - `tags` (text array)
      - `file_name` (text)
      - `file_path` (text)
      - `file_size` (bigint)
      - `file_type` (text)
      - `extracted_text` (text)
      - `medical_entities` (jsonb)
      - `ai_analysis` (jsonb)
      - `date_of_record` (date)
      - `provider_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `health_records` table
    - Add policies for users to manage their own records
*/

CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text DEFAULT 'General',
  tags text[] DEFAULT '{}',
  file_name text,
  file_path text,
  file_size bigint,
  file_type text,
  extracted_text text,
  medical_entities jsonb DEFAULT '{}',
  ai_analysis jsonb DEFAULT '{}',
  date_of_record date,
  provider_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own health records"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records"
  ON health_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health records"
  ON health_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health records"
  ON health_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_category ON health_records(category);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date_of_record);
CREATE INDEX IF NOT EXISTS idx_health_records_tags ON health_records USING GIN(tags);