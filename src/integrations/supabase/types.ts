export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      family_members: {
        Row: {
          access_level: string | null
          allergies: string[] | null
          blood_group: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact: boolean | null
          id: string
          medical_conditions: string[] | null
          medications: string[] | null
          name: string
          phone: string | null
          relation: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: boolean | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          name: string
          phone?: string | null
          relation: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: boolean | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          name?: string
          phone?: string | null
          relation?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_type: string
          recorded_at: string | null
          source: string | null
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          recorded_at?: string | null
          source?: string | null
          unit: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          recorded_at?: string | null
          source?: string | null
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      health_records: {
        Row: {
          ai_analysis: Json | null
          category: string | null
          created_at: string | null
          date_of_record: string | null
          extracted_text: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          medical_entities: Json | null
          provider_name: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          category?: string | null
          created_at?: string | null
          date_of_record?: string | null
          extracted_text?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          medical_entities?: Json | null
          provider_name?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          category?: string | null
          created_at?: string | null
          date_of_record?: string | null
          extracted_text?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          medical_entities?: Json | null
          provider_name?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          framework: string | null
          generated_code: string
          id: string
          idea: string
          name: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          framework?: string | null
          generated_code: string
          id?: string
          idea: string
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          framework?: string | null
          generated_code?: string
          id?: string
          idea?: string
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_credentials: {
        Row: {
          account_locked_until: string | null
          created_at: string | null
          email: string
          failed_login_attempts: number | null
          id: string
          last_failed_login_at: string | null
          last_login_at: string | null
          last_login_ip: unknown | null
          login_attempts: number | null
          password_changed_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_locked_until?: string | null
          created_at?: string | null
          email: string
          failed_login_attempts?: number | null
          id?: string
          last_failed_login_at?: string | null
          last_login_at?: string | null
          last_login_ip?: unknown | null
          login_attempts?: number | null
          password_changed_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_locked_until?: string | null
          created_at?: string | null
          email?: string
          failed_login_attempts?: number | null
          id?: string
          last_failed_login_at?: string | null
          last_login_at?: string | null
          last_login_ip?: unknown | null
          login_attempts?: number | null
          password_changed_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          credits_used_this_month: number
          credits_used_today: number
          email: string
          id: string
          last_daily_reset: string
          last_monthly_reset: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credits_used_this_month?: number
          credits_used_today?: number
          email: string
          id?: string
          last_daily_reset?: string
          last_monthly_reset?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credits_used_this_month?: number
          credits_used_today?: number
          email?: string
          id?: string
          last_daily_reset?: string
          last_monthly_reset?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          account_status: string | null
          age: number | null
          allergies: string[] | null
          blood_group: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          medical_conditions: string[] | null
          medications: string[] | null
          phone: string | null
          profile_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          account_status?: string | null
          age?: number | null
          allergies?: string[] | null
          blood_group?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: string | null
          id: string
          last_name: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          phone?: string | null
          profile_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          account_status?: string | null
          age?: number | null
          allergies?: string[] | null
          blood_group?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          phone?: string | null
          profile_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age: {
        Args: { birth_date: string }
        Returns: number
      }
      increment_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
