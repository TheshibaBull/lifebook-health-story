import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'user_profiles'>;

export class UserProfileService {
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  static async createProfile(profileData: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async ensureProfileExists(userId: string, userEmail: string, userData?: any): Promise<UserProfile> {
    try {
      // First try to get existing profile
      let profile = await this.getProfile(userId);
      
      if (!profile) {
        // Create a basic profile if none exists
        const basicProfile = {
          id: userId,
          first_name: userData?.first_name || 'User',
          last_name: userData?.last_name || 'User',
          email: userEmail,
          phone: null,
          gender: null,
          date_of_birth: null,
          age: null,
          blood_group: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
          medical_conditions: null,
          allergies: null,
          medications: null,
          profile_completed: false,
          account_status: 'active' as const
        };

        profile = await this.createProfile(basicProfile);
        console.log('Created basic profile for user:', userEmail);
      }

      return profile;
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      throw error;
    }
  }
}