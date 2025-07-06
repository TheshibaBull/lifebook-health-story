import { supabase } from '@/lib/supabase'
import type { HealthMetric } from '@/lib/supabase'

export class HealthMetricsService {
  static async createMetric(metric: Omit<HealthMetric, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('health_metrics')
      .insert([metric])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getMetrics(userId: string, metricType?: string): Promise<HealthMetric[]> {
    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
    
    if (metricType) {
      query = query.eq('metric_type', metricType)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }

  static async getLatestMetrics(userId: string): Promise<Record<string, HealthMetric>> {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
    
    if (error) throw error
    
    // Group by metric type and get the latest for each
    const latestMetrics: Record<string, HealthMetric> = {}
    data?.forEach(metric => {
      if (!latestMetrics[metric.metric_type]) {
        latestMetrics[metric.metric_type] = metric
      }
    })
    
    return latestMetrics
  }

  static async getMetricHistory(userId: string, metricType: string, days: number = 30): Promise<HealthMetric[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', metricType)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  static async updateMetric(metricId: string, updates: Partial<HealthMetric>) {
    const { data, error } = await supabase
      .from('health_metrics')
      .update(updates)
      .eq('id', metricId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteMetric(metricId: string) {
    const { error } = await supabase
      .from('health_metrics')
      .delete()
      .eq('id', metricId)
    
    if (error) throw error
  }

  static async calculateHealthScore(userId: string): Promise<number> {
    const latestMetrics = await this.getLatestMetrics(userId)
    
    let score = 100
    let factors = 0
    
    // Steps (target: 10,000)
    if (latestMetrics.steps) {
      const stepsScore = Math.min(100, (latestMetrics.steps.value / 10000) * 100)
      score = (score * factors + stepsScore) / (factors + 1)
      factors++
    }
    
    // Heart rate (resting: 60-100 bpm, optimal: 60-80)
    if (latestMetrics.heart_rate) {
      const hr = latestMetrics.heart_rate.value
      const hrScore = hr >= 60 && hr <= 80 ? 100 : hr < 60 ? 90 : hr <= 100 ? 80 : 60
      score = (score * factors + hrScore) / (factors + 1)
      factors++
    }
    
    // Sleep (target: 7-9 hours)
    if (latestMetrics.sleep_hours) {
      const sleep = latestMetrics.sleep_hours.value
      const sleepScore = sleep >= 7 && sleep <= 9 ? 100 : sleep >= 6 && sleep <= 10 ? 85 : 70
      score = (score * factors + sleepScore) / (factors + 1)
      factors++
    }
    
    // Exercise (target: 150 min/week = ~22 min/day)
    if (latestMetrics.exercise_minutes) {
      const exerciseScore = Math.min(100, (latestMetrics.exercise_minutes.value / 30) * 100)
      score = (score * factors + exerciseScore) / (factors + 1)
      factors++
    }
    
    return Math.round(score)
  }
}