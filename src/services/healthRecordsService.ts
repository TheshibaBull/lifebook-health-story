import { supabase } from '@/integrations/supabase/client'
import type { Tables, TablesInsert } from '@/integrations/supabase/types'
import { FileUploadService } from './fileUploadService'

type HealthRecord = Tables<'health_records'>
type HealthRecordInsert = TablesInsert<'health_records'>

export class HealthRecordsService {
  static async createRecord(record: HealthRecordInsert) {
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

  static async getRecordWithUrl(recordId: string): Promise<HealthRecord & { fileUrl?: string } | null> {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('id', recordId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Get file URL if file_path exists
      let fileUrl = null;
      if (data.file_path) {
        fileUrl = await FileUploadService.getFileUrl(data.file_path);
      }
      
      return { ...data, fileUrl: fileUrl || undefined };
    } catch (error) {
      console.error('Error fetching record with URL:', error);
      throw error;
    }
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

  static async deleteRecordWithFile(recordId: string): Promise<void> {
    try {
      // First get the record to get the file path
      const record = await this.getRecord(recordId);
      if (!record) {
        throw new Error('Record not found');
      }
      
      // Delete the file from storage if it exists
      if (record.file_path) {
        await FileUploadService.deleteFile(record.file_path);
      }
      
      // Delete the record from the database
      await this.deleteRecord(recordId);
    } catch (error) {
      console.error('Error deleting record with file:', error);
      throw error;
    }
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

  static async getRecordsByDateRange(userId: string, startDate: string, endDate: string): Promise<HealthRecord[]> {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date_of_record', startDate)
      .lte('date_of_record', endDate)
      .order('date_of_record', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
}