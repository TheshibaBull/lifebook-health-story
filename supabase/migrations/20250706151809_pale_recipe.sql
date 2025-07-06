/*
  # Create health metrics schema

  1. New Tables
    - `health_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `metric_type` (text)
      - `value` (numeric)
      - `unit` (text)
      - `recorded_at` (timestamp)
      - `source` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `health_metrics` table
    - Add policies for health metrics management
*/

CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('steps', 'heart_rate', 'blood_pressure_sys', 'blood_pressure_dia', 'weight', 'height', 'glucose', 'sleep_hours', 'exercise_minutes')),
  value numeric NOT NULL,
  unit text NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  source text DEFAULT 'manual',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own health metrics"
  ON health_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health metrics"
  ON health_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health metrics"
  ON health_metrics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health metrics"
  ON health_metrics
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_at ON health_metrics(recorded_at DESC);