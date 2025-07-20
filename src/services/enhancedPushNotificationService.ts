
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPayload {
  title: string;
  body: string;
  type: 'health_reminder' | 'document_processed' | 'family_update' | 'appointment';
  data?: any;
  scheduledFor?: Date;
}

export class EnhancedPushNotificationService {
  private static subscription: PushSubscription | null = null;
  private static isInitialized = false;

  static async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      }

      // Request notification permission
      const permission = await this.requestPermission();
      if (!permission) {
        console.warn('Notification permission denied');
        return false;
      }

      // Subscribe to push notifications
      await this.subscribeToPush();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async subscribeToPush(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push messaging is not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
        await this.saveSubscriptionToDatabase(existingSubscription);
        return;
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa40HI0DLxaUBCAV7Wh')
      });

      this.subscription = subscription;
      await this.saveSubscriptionToDatabase(subscription);
      
      console.log('Push subscription successful');
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  static async saveSubscriptionToDatabase(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          push_subscription: subscription.toJSON(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save push subscription:', error);
    }
  }

  static async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Send via edge function
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: user.id,
          ...payload
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  static async scheduleHealthReminder(
    type: 'medication' | 'appointment' | 'checkup',
    message: string,
    scheduledTime: Date
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: `Health Reminder: ${type}`,
      body: message,
      type: 'health_reminder',
      data: { type, scheduledTime: scheduledTime.toISOString() },
      scheduledFor: scheduledTime
    };

    await this.sendNotification(payload);
  }

  static async notifyDocumentProcessed(fileName: string, category: string): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Document Processed',
      body: `${fileName} has been analyzed and categorized as ${category}`,
      type: 'document_processed',
      data: { fileName, category }
    };

    await this.sendNotification(payload);
  }

  static async notifyFamilyUpdate(memberName: string, updateType: string): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Family Health Update',
      body: `${memberName} has a new ${updateType} update`,
      type: 'family_update',
      data: { memberName, updateType }
    };

    await this.sendNotification(payload);
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
