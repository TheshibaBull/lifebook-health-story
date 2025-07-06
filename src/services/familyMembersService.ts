import { supabase } from '@/lib/supabase'
import type { FamilyMember } from '@/lib/supabase'

export class FamilyMembersService {
  static async createFamilyMember(member: Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('family_members')
      .insert([member])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getFamilyMember(memberId: string): Promise<FamilyMember | null> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', memberId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updateFamilyMember(memberId: string, updates: Partial<FamilyMember>) {
    const { data, error } = await supabase
      .from('family_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteFamilyMember(memberId: string) {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId)
    
    if (error) throw error
  }

  static async getEmergencyContacts(userId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .eq('emergency_contact', true)
    
    if (error) throw error
    return data || []
  }
}