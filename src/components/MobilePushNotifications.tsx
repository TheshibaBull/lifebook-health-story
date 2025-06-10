
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Smartphone, Clock, AlertTriangle } from 'lucide-react';
import { PushNotificationService } from '@/services/pushNotificationService';
import { useToast } from '@/hooks/use-toast';

const MobilePushNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState({
    healthReminders: true,
    familyAlerts: true,
    appointmentReminders: true,
    medicationReminders: true,
    emergencyAlerts: true
  });
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationStatus();
    PushNotificationService.initialize();
  }, []);

  const checkNotificationStatus = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await PushNotificationService.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        await PushNotificationService.subscribeToNotifications();
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive health reminders and alerts",
        });

        // Send welcome notification
        setTimeout(() => {
          PushNotificationService.showNotification({
            title: "Welcome to Lifebook Notifications!",
            body: "You'll receive important health reminders and family alerts",
            icon: "/favicon.ico"
          });
        }, 1000);
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You won't receive push notifications",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable notifications",
        variant: "destructive"
      });
    }
  };

  const toggleNotificationSetting = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));

    // Save to localStorage
    localStorage.setItem('notification-settings', JSON.stringify({
      ...settings,
      [setting]: !settings[setting]
    }));
  };

  const sendTestNotification = () => {
    PushNotificationService.showNotification({
      title: "Test Notification",
      body: "This is a test notification from Lifebook Health",
      icon: "/favicon.ico",
      tag: "test"
    });
  };

  const scheduleHealthReminder = () => {
    PushNotificationService.scheduleReminder(
      "Health Reminder",
      "Don't forget to take your medication!",
      5000 // 5 seconds for demo
    );
    
    toast({
      title: "Reminder Scheduled",
      description: "You'll receive a test reminder in 5 seconds",
    });
  };

  const notificationTypes = [
    {
      key: 'healthReminders' as keyof typeof settings,
      title: 'Health Reminders',
      description: 'Medication, exercise, and wellness reminders',
      icon: <Clock className="w-5 h-5 text-blue-500" />
    },
    {
      key: 'familyAlerts' as keyof typeof settings,
      title: 'Family Health Alerts',
      description: 'Updates about family member health changes',
      icon: <Bell className="w-5 h-5 text-green-500" />
    },
    {
      key: 'appointmentReminders' as keyof typeof settings,
      title: 'Appointment Reminders',
      description: 'Upcoming doctor visits and medical appointments',
      icon: <Clock className="w-5 h-5 text-purple-500" />
    },
    {
      key: 'medicationReminders' as keyof typeof settings,
      title: 'Medication Alerts',
      description: 'Medicine dosage and refill reminders',
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />
    },
    {
      key: 'emergencyAlerts' as keyof typeof settings,
      title: 'Emergency Alerts',
      description: 'Critical health alerts and emergency notifications',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="text-blue-500" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {notificationsEnabled ? (
              <Bell className="w-6 h-6 text-green-500" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-600">
                {permission === 'granted' ? 'Enabled' : 
                 permission === 'denied' ? 'Blocked' : 'Not enabled'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {permission !== 'granted' && (
              <Button onClick={requestNotificationPermission} size="sm">
                Enable
              </Button>
            )}
            {permission === 'granted' && (
              <Badge variant="outline" className="text-green-600">
                Active
              </Badge>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        {notificationsEnabled && (
          <div className="space-y-4">
            <h4 className="font-medium">Notification Preferences</h4>
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {type.icon}
                  <div>
                    <p className="font-medium text-sm">{type.title}</p>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[type.key]}
                  onCheckedChange={() => toggleNotificationSetting(type.key)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Test Controls */}
        {notificationsEnabled && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Test Notifications</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={sendTestNotification}>
                Send Test
              </Button>
              <Button variant="outline" size="sm" onClick={scheduleHealthReminder}>
                Schedule Reminder
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Note:</strong> Push notifications help you stay on top of your health goals and receive important family health updates even when the app is closed.
        </div>
      </CardContent>
    </Card>
  );
};

export { MobilePushNotifications };
