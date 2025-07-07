import { supabase } from '@/integrations/supabase/client';
import { UserProfileService } from './userProfileService';

export class AuthService {
  /**
   * Resend verification email to the user
   * @param email User's email address
   * @returns Promise resolving to success or error
   */
  static async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Resend verification error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to resend verification email' 
      };
    }
  }

  /**
   * Check if a user's email is verified
   * @param userId User ID to check
   * @returns Promise resolving to verification status
   */
  static async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error) {
        throw error;
      }
      
      return data?.user?.email_confirmed_at != null;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  }

  /**
   * Track a failed login attempt
   * @param email Email that failed login
   * @returns Promise resolving to success or error
   */
  static async trackFailedLogin(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('track_failed_login', {
        p_email: email
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error tracking failed login:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to track login attempt' 
      };
    }
  }

  /**
   * Get user's login history
   * @param userId User ID to get history for
   * @returns Promise resolving to login history
   */
  static async getLoginHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('last_login_at, last_login_ip, login_attempts')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting login history:', error);
      return [];
    }
  }

  /**
   * Check if account is locked due to too many failed attempts
   * @param email Email to check
   * @returns Promise resolving to lock status
   */
  static async isAccountLocked(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('account_locked_until')
        .eq('email', email)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data || !data.account_locked_until) {
        return false;
      }
      
      const lockUntil = new Date(data.account_locked_until);
      return lockUntil > new Date();
    } catch (error) {
      console.error('Error checking account lock:', error);
      return false;
    }
  }
}