
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OfflineRecord {
  id: string;
  type: 'health_record' | 'family_member' | 'user_profile';
  data: any;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: string;
  syncAttempts: number;
  lastSyncAttempt?: string;
}

export class OfflineDataSyncService {
  private static readonly STORAGE_KEY = 'lifebook-offline-data';
  private static readonly MAX_SYNC_ATTEMPTS = 3;
  private static isOnline = navigator.onLine;
  private static syncQueue: OfflineRecord[] = [];

  static initialize(): void {
    // Load offline data from localStorage
    this.loadOfflineData();
    
    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Initial sync if online
    if (this.isOnline) {
      this.syncOfflineData();
    }
  }

  static async storeOfflineData(record: Omit<OfflineRecord, 'id' | 'timestamp' | 'syncAttempts'>): Promise<void> {
    const offlineRecord: OfflineRecord = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      syncAttempts: 0,
      ...record
    };

    this.syncQueue.push(offlineRecord);
    this.saveOfflineData();
    
    console.log('Stored offline record:', offlineRecord);
  }

  static async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    console.log(`Syncing ${this.syncQueue.length} offline records...`);
    
    const recordsToSync = [...this.syncQueue];
    const successfulSyncs: string[] = [];
    const failedSyncs: string[] = [];

    for (const record of recordsToSync) {
      try {
        await this.syncRecord(record);
        successfulSyncs.push(record.id);
      } catch (error) {
        console.error('Failed to sync record:', record.id, error);
        
        // Update sync attempts
        record.syncAttempts++;
        record.lastSyncAttempt = new Date().toISOString();
        
        if (record.syncAttempts >= this.MAX_SYNC_ATTEMPTS) {
          console.warn('Max sync attempts reached for record:', record.id);
          failedSyncs.push(record.id);
        }
      }
    }

    // Remove successfully synced records
    this.syncQueue = this.syncQueue.filter(record => !successfulSyncs.includes(record.id));
    
    // Remove permanently failed records
    this.syncQueue = this.syncQueue.filter(record => !failedSyncs.includes(record.id));
    
    this.saveOfflineData();
    
    if (successfulSyncs.length > 0) {
      console.log(`Successfully synced ${successfulSyncs.length} records`);
    }
    
    if (failedSyncs.length > 0) {
      console.warn(`Failed to sync ${failedSyncs.length} records permanently`);
    }
  }

  private static async syncRecord(record: OfflineRecord): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    switch (record.type) {
      case 'health_record':
        await this.syncHealthRecord(record);
        break;
      case 'family_member':
        await this.syncFamilyMember(record);
        break;
      case 'user_profile':
        await this.syncUserProfile(record);
        break;
      default:
        throw new Error(`Unknown record type: ${record.type}`);
    }
  }

  private static async syncHealthRecord(record: OfflineRecord): Promise<void> {
    const { data, error } = await supabase
      .from('health_records')
      .upsert(record.data);
    
    if (error) throw error;
  }

  private static async syncFamilyMember(record: OfflineRecord): Promise<void> {
    switch (record.operation) {
      case 'CREATE':
        const { data: createData, error: createError } = await supabase
          .from('family_members')
          .insert(record.data);
        if (createError) throw createError;
        break;
        
      case 'UPDATE':
        const { data: updateData, error: updateError } = await supabase
          .from('family_members')
          .update(record.data)
          .eq('id', record.data.id);
        if (updateError) throw updateError;
        break;
        
      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('family_members')
          .delete()
          .eq('id', record.data.id);
        if (deleteError) throw deleteError;
        break;
    }
  }

  private static async syncUserProfile(record: OfflineRecord): Promise<void> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(record.data);
    
    if (error) throw error;
  }

  private static handleOnline(): void {
    console.log('Device came online - starting sync');
    this.isOnline = true;
    this.syncOfflineData();
  }

  private static handleOffline(): void {
    console.log('Device went offline');
    this.isOnline = false;
  }

  private static loadOfflineData(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      this.syncQueue = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load offline data:', error);
      this.syncQueue = [];
    }
  }

  private static saveOfflineData(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  static getPendingCount(): number {
    return this.syncQueue.length;
  }

  static getConnectionStatus(): boolean {
    return this.isOnline;
  }
}
