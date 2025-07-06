import { useState, useEffect } from 'react'
import { AuthService } from '@/services/authService'
import { UserProfileService } from '@/services/userProfileService'
import type { User, Session } from '@supabase/supabase-js'

interface SignUpProfileData {
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
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user)
      setSession(user ? session : null)
      setLoading(false)
    })

    // THEN check for existing session
    AuthService.getCurrentUser().then(user => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { user } = await AuthService.signIn(email, password)
    return user
  }

  const signUp = async (email: string, password: string, profileData?: SignUpProfileData) => {
    const { user } = await AuthService.signUp(email, password, profileData)
    return user
  }

  const signOut = async () => {
    await AuthService.signOut()
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