import { useState, useEffect } from 'react'
import { AuthService } from '@/services/authService'
import { UserProfileService } from '@/services/userProfileService'
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    AuthService.getCurrentUser().then(user => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
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
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }
}