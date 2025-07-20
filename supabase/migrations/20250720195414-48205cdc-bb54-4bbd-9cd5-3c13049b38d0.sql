
-- Add missing description column to health_records table
ALTER TABLE public.health_records 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add missing columns for AI processing results
ALTER TABLE public.health_records 
ADD COLUMN IF NOT EXISTS extracted_text TEXT,
ADD COLUMN IF NOT EXISTS medical_entities JSONB,
ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
