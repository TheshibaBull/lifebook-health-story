import { supabase } from '@/lib/supabase'
import type { HealthRecord } from '@/lib/supabase'

export class HealthRecordsService {
  static async createRecord(record: Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('health_records')
      .insert([record])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getRecords(userId: string): Promise<HealthRecord[]> {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getRecord(recordId: string): Promise<HealthRecord | null> {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('id', recordId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updateRecord(recordId: string, updates: Partial<HealthRecord>) {
    const { data, error } = await supabase
      .from('health_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteRecord(recordId: string) {
    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', recordId)
    
    if (error) throw error
  }

  static async searchRecords(userId: string, query: string): Promise<HealthRecord[]> {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,extracted_text.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getRecordsByCategory(userId: string, category: string): Promise<HealthRecord[]> {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('health-records')
      .upload(path, file)
    
    if (error) throw error
    return data
  }

  static async getFileUrl(path: string) {
    const { data } = supabase.storage
      .from('health-records')
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  static async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('health-records')
      .remove([path])
    
    if (error) throw error
  }
}