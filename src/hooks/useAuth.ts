import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface SignUpData {
  firstName: string;
  lastName: string;
  phone?: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string;
  allergies?: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.')
        } else {
          throw new Error(error.message)
        }
      }
      
      return data.user
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, profileData?: SignUpData) => {
    try {
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: profileData?.firstName || '',
            last_name: profileData?.lastName || '',
          }
        }
      })
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.')
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.')
        } else {
          throw new Error(error.message)
        }
      }

      // Create user profile if signup successful and user exists
      if (data.user && profileData) {
        console.log('Creating user profile for:', data.user.email)
        
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

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(profilePayload)

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Still throw error for profile creation issues so user knows
          throw new Error(`Account created but profile setup failed: ${profileError.message}. Please contact support.`)
        }
        
        console.log('User profile created successfully')
      }
      
      return data.user
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }
}