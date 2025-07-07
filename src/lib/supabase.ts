// Re-export the main supabase client to avoid duplicate instances
export { supabase } from '@/integrations/supabase/client'

// Database types
export interface UserCredentials {
  id: string
  user_id: string
  email: string
  login_attempts: number
  last_login_at?: string
  last_login_ip?: string
  failed_login_attempts: number
  last_failed_login_at?: string
  account_locked_until?: string
  password_changed_at: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  gender?: string
  date_of_birth?: string
  age?: number
  blood_group?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_conditions?: string[]
  allergies?: string[]
  medications?: string[]
  profile_completed: boolean
  account_status: string
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
  access_level: string // Changed from union type to string to match database
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string // Changed from union type to string to match database
  read: boolean
  action_url?: string
  metadata?: any
  created_at: string
}

export interface HealthMetric {
  id: string
  user_id: string
  metric_type: string // Changed from union type to string to match database
  value: number
  unit: string
  recorded_at: string
  source: string
  metadata?: any
  created_at: string
}