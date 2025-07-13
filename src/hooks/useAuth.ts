import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'

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
  const [loading, setLoading] = useState<boolean>(true)
  const isInitialized = useRef<boolean>(false)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!isInitialized.current) {
        isInitialized.current = true;
        setLoading(false);
      }
    });

    // Check for existing session only once
    if (!isInitialized.current) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        isInitialized.current = true;
        setLoading(false);
      });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
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
        await supabase.rpc('track_user_login', {
          p_user_id: data.user.id,
          p_email: email,
          p_ip_address: null
        });
      } catch (trackErr) {
        console.warn('Failed to track login (non-critical):', trackErr)
        // Don't throw error for tracking failure - it's not critical for user experience
      }
      
      // Set user and session after successful login (moved after tracking)
      setUser(data.user);
      setSession(data.session);
      
      return data.user
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      // Track failed login attempt (non-critical)
      try {
        await supabase.rpc('track_failed_login', {
          p_email: email,
          p_ip_address: null
        });
      } catch (trackErr) {
        console.warn('Failed to track failed login (non-critical):', trackErr)
      }
      
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [toast])

  const signUp = useCallback(async (email: string, password: string, profileData?: SignUpData) => {
    try {
      setLoading(true)
      
      // Calculate age from date of birth
      const calculateAge = (dateOfBirth: string): number => 
        Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

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

      // Create user profile if signup successful and profile data provided
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

        
        const { data: newProfile, error: profileError } = await supabase 
          .from('user_profiles')
          .insert(profilePayload)
          .select()
          .single()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account. You can complete your profile after signing in.",
          })
        } else {
          toast({
            title: "Account Created Successfully",
            description: "Please check your email to verify your account.",
          })
        }
      } else {
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
  }, [toast])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
      
      // Clear user and session data
      setUser(null);
      setSession(null);
      
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
  }, [toast])

  const resetPassword = useCallback(async (email: string) => {
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
  }, [toast])
  
  // Function to update user password after reset
  const updatePassword = useCallback(async (newPassword: string) => {
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
  }, [toast])

  const isAuthenticated = useMemo(() => !!user, [user])
  
  // Memoize the auth object to prevent unnecessary re-renders
  const authObject = useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
    isAuthenticated
  }), [user, session, loading, signIn, signUp, resetPassword, updatePassword, signOut, isAuthenticated]);

  return authObject;
}