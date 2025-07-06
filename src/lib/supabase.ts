import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  full_name?: string
  date_of_birth?: string
  gender?: string
  blood_group?: string
  phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_conditions?: string[]
  allergies?: string[]
  medications?: string[]
  created_at: string
  updated_at: string
}

export interface HealthRecord {
  id: string
  user_id: string
  title: string
  category: string
  tags: string[]
  file_name?: string
  file_path?: string
  file_size?: number
  file_type?: string
  extracted_text?: string
  medical_entities?: any
  ai_analysis?: any
  date_of_record?: string
  provider_name?: string
  created_at: string
  updated_at: string
}

export interface FamilyMember {
  id: string
  user_id: string
  name: string
  relation: string
  email?: string
  phone?: string
  date_of_birth?: string
  blood_group?: string
  medical_conditions?: string[]
  allergies?: string[]
  medications?: string[]
  emergency_contact: boolean
  access_level: 'full' | 'limited' | 'view-only'
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'medication' | 'appointment' | 'achievement' | 'emergency' | 'general'
  read: boolean
  action_url?: string
  metadata?: any
  created_at: string
}

export interface HealthMetric {
  id: string
  user_id: string
  metric_type: 'steps' | 'heart_rate' | 'blood_pressure_sys' | 'blood_pressure_dia' | 'weight' | 'height' | 'glucose' | 'sleep_hours' | 'exercise_minutes'
  value: number
  unit: string
  recorded_at: string
  source: string
  metadata?: any
  created_at: string
}