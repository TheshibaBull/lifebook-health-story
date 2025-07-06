import { supabase } from '@/lib/supabase'
import { UserProfileService } from './userProfileService'
import type { User } from '@supabase/supabase-js'

interface SignUpProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string;
  allergies?: string[];
}

export class AuthService {
  static async signUp(email: string, password: string, profileData?: SignUpProfileData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      // Provide more specific error messages
      if (error.message.includes('already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.')
      }
      throw new Error(error.message || 'Failed to create account')
    }

    // If user is created successfully, create their profile
    if (data.user) {
      try {
        // Create comprehensive user profile
        await UserProfileService.createProfile({
          id: data.user.id,
          first_name: profileData?.firstName || '',
          last_name: profileData?.lastName || '',
          email: email,
          phone: profileData?.phone || '',
          gender: profileData?.gender || '',
          date_of_birth: profileData?.dateOfBirth || '',
          blood_group: profileData?.bloodGroup || '',
          allergies: profileData?.allergies || [],
          profile_completed: !!profileData
        })

        // Create user credentials record for login tracking
        const { error: credentialsError } = await supabase
          .from('user_credentials')
          .insert({
            user_id: data.user.id,
            email: email,
            login_attempts: 0,
            failed_login_attempts: 0
          })
        
        if (credentialsError) {
          console.error('Failed to create user credentials:', credentialsError)
          // Don't throw here as the user account was created successfully
        }
      } catch (error) {
        console.error('Error creating user profile and credentials:', error)
      }
    }

    return data
  }

  static async signIn(email: string, password: string) {
    // Update login attempt tracking
    try {
      await supabase
        .from('user_credentials')
        .update({
          login_attempts: supabase.sql`login_attempts + 1`,
          last_login_at: new Date().toISOString()
        })
        .eq('email', email)
    } catch (error) {
      console.error('Failed to update login tracking:', error)
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      // Provide more specific error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.')
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.')
      }
      throw new Error(error.message || 'Failed to sign in')
    }
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  }

  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }
}