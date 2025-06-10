
interface SyncableData {
  id: string;
  type: 'health_record' | 'family_member' | 'reminder' | 'note';
  data: any;
  timestamp: Date;
  action: 'create' | 'update' | 'delete';
  synced: boolean;
}

export class OfflineDataSync {
  private static readonly STORAGE_KEY = 'lifebook_offline_data';
  private static syncInProgress = false;

  static addToSyncQueue(data: Omit<SyncableData, 'id' | 'timestamp' | 'synced'>): void {
    const syncData: SyncableData = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      synced: false,
      ...data
    };

    const existingData = this.getSyncQueue();
    existingData.push(syncData);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
  }

  static getSyncQueue(): SyncableData[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async syncAll(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;
    const queue = this.getSyncQueue();
    const unsynced = queue.filter(item => !item.synced);

    try {
      for (const item of unsynced) {
        await this.syncItem(item);
        this.markAsSynced(item.id);
      }
      
      // Clean up old synced items
      this.cleanupSyncedItems();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private static async syncItem(item: SyncableData): Promise<void> {
    // Simulate API call - in real app, this would sync with backend
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Synced ${item.type} ${item.action}:`, item.data);
        resolve();
      }, 1000);
    });
  }

  private static markAsSynced(itemId: string): void {
    const queue = this.getSyncQueue();
    const updated = queue.map(item => 
      item.id === itemId ? { ...item, synced: true } : item
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  private static cleanupSyncedItems(): void {
    const queue = this.getSyncQueue();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep 7 days of synced items
    
    const filtered = queue.filter(item => 
      !item.synced || new Date(item.timestamp) > cutoffDate
    );
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static getPendingSyncCount(): number {
    return this.getSyncQueue().filter(item => !item.synced).length;
  }

  static startAutoSync(): void {
    // Auto-sync when online
    window.addEventListener('online', () => {
      this.syncAll();
    });

    // Periodic sync
    setInterval(() => {
      if (navigator.onLine) {
        this.syncAll();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}
