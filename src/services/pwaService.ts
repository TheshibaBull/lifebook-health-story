
export class PWAService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  
  private static isUnsupportedEnvironment(): boolean {
    // Check if running in StackBlitz or other iframe-based environments
    try {
      return window.self !== window.top || 
             window.location.hostname.includes('stackblitz') ||
             window.location.hostname.includes('webcontainer');
    } catch {
      // If we can't access window.top due to cross-origin restrictions,
      // we're likely in an iframe
      return true;
    }
  }
  
  static async initialize(): Promise<void> {
    // Skip Service Worker registration in unsupported environments
    if (this.isUnsupportedEnvironment()) {
      console.log('Service Worker registration skipped: unsupported environment');
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
    if (this.isUnsupportedEnvironment()) {
      console.log('Push notifications not available in this environment');
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
    if (this.isUnsupportedEnvironment()) {
      console.log('Background sync not available in this environment');
      return;
    }
    
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return;
    }
    
    if ('sync' in this.swRegistration) {
      try {
        await this.swRegistration.sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }
  
  static isInstallable(): boolean {
    return 'BeforeInstallPromptEvent' in window;
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
  }
}
