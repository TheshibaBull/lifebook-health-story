import { supabase } from '@/integrations/supabase/client'
import type { Tables, TablesInsert } from '@/integrations/supabase/types'

type HealthMetric = Tables<'health_metrics'>
type HealthMetricInsert = TablesInsert<'health_metrics'>

export class HealthMetricsService {
  static async createHealthMetric(metric: HealthMetricInsert) {
    const { data, error } = await supabase
      .from('health_metrics')
      .insert([metric])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getHealthMetrics(userId: string): Promise<HealthMetric[]> {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getHealthMetricsByType(userId: string, metricType: string): Promise<HealthMetric[]> {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', metricType)
      .order('recorded_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async updateHealthMetric(metricId: string, updates: Partial<HealthMetric>) {
    const { data, error } = await supabase
      .from('health_metrics')
      .update(updates)
      .eq('id', metricId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteHealthMetric(metricId: string) {
    const { error } = await supabase
      .from('health_metrics')
      .delete()
      .eq('id', metricId)
    
    if (error) throw error
  }

  static async getHealthMetricsByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<HealthMetric[]> {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', startDate)
      .lte('recorded_at', endDate)
      .order('recorded_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getLatestMetrics(userId: string): Promise<HealthMetric[]> {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data || []
  }
}