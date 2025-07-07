import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'
import { UserProfileService } from '@/services/userProfileService'

interface SignUpData {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string;
  allergies?: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        // Only set loading to false after auth state changes (not initial load)
        if (event !== 'INITIAL_SESSION') {
          setLoading(false)
        }
      }
    )

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      // Set loading to false only after initial session check
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        throw new Error(error.message)
      }
      
      // Track successful login
      try {
        const { error: trackError } = await supabase.rpc('track_user_login', {
          p_user_id: data.user.id,
          p_email: email
        })
        
        if (trackError) {
          console.error('Error tracking login:', trackError)
          // Don't throw here, just log the error
        }
      } catch (trackErr) {
        console.error('Failed to track login:', trackErr)
      }
      console.log('Sign in successful:', data.user?.email)
      return data.user
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, profileData?: SignUpData) => {
    try {
      setLoading(true)
      
      // Calculate age from date of birth
      const calculateAge = (dateOfBirth: string): number => {
        const today = new Date()
        const birthDate = new Date(dateOfBirth)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        
        return age
      }

      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: profileData?.firstName || '',
            last_name: profileData?.lastName || ''
          }
        }
      })
      
      if (error) {
        console.error('Supabase auth signup error:', error)
        throw new Error(error.message)
      }

      // Ensure we have a user object
      if (!data.user) {
        throw new Error('No user returned from signup')
      }

      console.log('Auth signup successful, creating profile for:', data.user.email)
      
      // Create user profile if signup successful and profile data provided
      // This is now handled by UserProfileService
      if (profileData) {
        const profilePayload = {
          id: data.user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: email,
          phone: profileData.phone || null,
          gender: profileData.gender || null,
          date_of_birth: profileData.dateOfBirth || null,
          age: profileData.dateOfBirth ? calculateAge(profileData.dateOfBirth) : null,
          blood_group: profileData.bloodGroup || null,
          allergies: profileData.allergies || [],
          profile_completed: true,
          account_status: 'active'
        }

        console.log('Creating profile with payload:', profilePayload)
        
        const { data: newProfile, error: profileError } = await supabase 
          .from('user_profiles')
          .insert(profilePayload)
          .select()
          .single()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw here - user is created, just profile setup may be incomplete
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account. You can complete your profile after signing in.",
          })
        } else {
          console.log('User profile created successfully')
          toast({
            title: "Account Created Successfully",
            description: "Please check your email to verify your account.",
          })
        }
      } else {
        // No profile data provided, just notify about email verification
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        })
      }
      
      return data.user
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast({
        title: "Sign Up Failed", 
        description: error.message,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      
      if (!email) {
        throw new Error('Email is required')
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      return true
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  // Function to update user password after reset
  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      })
      
      return true
    } catch (error: any) {
      console.error('Password update error:', error)
      toast({
        title: "Password Update Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
    isAuthenticated: !!user
  }
}