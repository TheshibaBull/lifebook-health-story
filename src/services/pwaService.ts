
export class PWAService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  
  static async initialize(): Promise<void> {
    // Skip Service Worker registration in development environments
    if (process.env.NODE_ENV !== 'production') {
      console.log('Service Worker registration skipped in development environment');
      return;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                this.showUpdateNotification();
              }
            });
          }
        });
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
  
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  static async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Push notifications not available in development environment');
      return null;
    }
    
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return null;
    }
    
    if (!await this.requestNotificationPermission()) {
      console.warn('Notification permission not granted');
      return null;
    }
    
    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa40HI0DLxaUBCAV7Wh')
      });
      
      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }
  
  static async scheduleBackgroundSync(tag: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Background sync not available in development environment');
      return;
    }
    
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return;
    }
    
    // Type assertion for sync property which may not be recognized by TypeScript
    const registration = this.swRegistration as ServiceWorkerRegistration & {
      sync?: {
        register: (tag: string) => Promise<void>;
      };
    };
    
    if (registration.sync) {
      try {
        await registration.sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }
  
  static isInstallable(): boolean {
    return typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window;
  }
  
  static async installApp(): Promise<void> {
    // This would be triggered by a user gesture
    console.log('App installation would be triggered here');
  }
  
  private static showUpdateNotification(): void {
    if (confirm('A new version of the app is available. Would you like to reload to update?')) {
      window.location.reload();
    }
  }
  
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    try {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      console.error('Error converting base64 to Uint8Array:', error);
      return new Uint8Array();
    }
  }
}
