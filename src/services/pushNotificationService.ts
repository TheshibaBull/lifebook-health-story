
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PushNotificationService {
  private static readonly VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // This would be configured in production

  static async requestPermission(): Promise<boolean> {
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

  static async subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
      });

      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  static async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!await this.requestPermission()) {
      console.warn('Notification permission not granted');
      return;
    }

    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge,
      tag: payload.tag,
    });
  }

  static scheduleHealthReminder(type: 'medication' | 'appointment' | 'checkup', message: string, scheduledTime: Date): void {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        this.sendLocalNotification({
          title: `Health Reminder: ${type}`,
          body: message,
          icon: '/favicon.ico',
          tag: `health-reminder-${type}`,
          actions: [
            { action: 'view', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        });
      }, delay);
    }
  }

  static async scheduleRecurringReminder(
    type: 'medication' | 'appointment' | 'checkup',
    message: string,
    intervalHours: number
  ): Promise<void> {
    const interval = intervalHours * 60 * 60 * 1000; // Convert to milliseconds
    
    const sendReminder = () => {
      this.sendLocalNotification({
        title: `Health Reminder: ${type}`,
        body: message,
        tag: `recurring-${type}`,
      });
    };

    // Send immediately if permission granted
    if (await this.requestPermission()) {
      sendReminder();
      setInterval(sendReminder, interval);
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

  static getStoredSubscription(): PushSubscription | null {
    const stored = localStorage.getItem('push-subscription');
    return stored ? JSON.parse(stored) : null;
  }

  static storeSubscription(subscription: PushSubscription): void {
    localStorage.setItem('push-subscription', JSON.stringify(subscription));
  }
}
