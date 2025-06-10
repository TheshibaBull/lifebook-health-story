
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertCircle, CheckCircle, Clock, Heart } from 'lucide-react';
import { PushNotificationService } from '@/services/pushNotificationService';
import { useToast } from '@/hooks/use-toast';

const MobilePushNotifications = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [settings, setSettings] = useState({
    medicationReminders: true,
    appointmentReminders: true,
    healthGoals: false,
    familyUpdates: true,
    emergencyAlerts: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      const subscription = PushNotificationService.getStoredSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await PushNotificationService.requestPermission();
    if (granted) {
      const subscription = await PushNotificationService.subscribeToPush();
      if (subscription) {
        PushNotificationService.storeSubscription(subscription);
        setIsSubscribed(true);
        setNotificationPermission('granted');
        
        toast({
          title: "Notifications Enabled",
          description: "You'll receive health reminders and updates",
        });

        // Send a test notification
        setTimeout(() => {
          PushNotificationService.sendLocalNotification({
            title: "Welcome to Lifebook Health!",
            body: "Your health notifications are now active",
            icon: "/favicon.ico"
          });
        }, 1000);
      }
    } else {
      toast({
        title: "Permission Denied",
        description: "Enable notifications in your browser settings",
        variant: "destructive"
      });
    }
  };

  const handleTestNotification = () => {
    PushNotificationService.sendLocalNotification({
      title: "Test Notification",
      body: "Your notifications are working perfectly!",
      icon: "/favicon.ico"
    });
  };

  const handleScheduleReminder = () => {
    const reminderTime = new Date();
    reminderTime.setMinutes(reminderTime.getMinutes() + 1); // 1 minute from now

    PushNotificationService.scheduleHealthReminder(
      'medication',
      'Time to take your evening medication',
      reminderTime
    );

    toast({
      title: "Reminder Scheduled",
      description: "You'll receive a notification in 1 minute",
    });
  };

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem('notification-settings', JSON.stringify({ ...settings, [key]: value }));
  };

  const getStatusBadge = () => {
    if (notificationPermission === 'granted' && isSubscribed) {
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    } else if (notificationPermission === 'denied') {
      return <Badge variant="destructive">Blocked</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="text-blue-500" />
          Push Notifications
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationPermission !== 'granted' ? (
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
            <div>
              <p className="font-medium mb-2">Enable Health Notifications</p>
              <p className="text-sm text-gray-600 mb-4">
                Get timely reminders for medications, appointments, and health goals
              </p>
              <Button onClick={handleEnableNotifications} className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Notifications Active</span>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Medication Reminders</p>
                  <p className="text-sm text-gray-500">Daily medication alerts</p>
                </div>
                <Switch
                  checked={settings.medicationReminders}
                  onCheckedChange={(checked) => updateSetting('medicationReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-sm text-gray-500">Upcoming appointments</p>
                </div>
                <Switch
                  checked={settings.appointmentReminders}
                  onCheckedChange={(checked) => updateSetting('appointmentReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Health Goals</p>
                  <p className="text-sm text-gray-500">Progress updates and motivational reminders</p>
                </div>
                <Switch
                  checked={settings.healthGoals}
                  onCheckedChange={(checked) => updateSetting('healthGoals', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Family Updates</p>
                  <p className="text-sm text-gray-500">Family member health updates</p>
                </div>
                <Switch
                  checked={settings.familyUpdates}
                  onCheckedChange={(checked) => updateSetting('familyUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Emergency Alerts</p>
                  <p className="text-sm text-gray-500">Critical health notifications</p>
                </div>
                <Switch
                  checked={settings.emergencyAlerts}
                  onCheckedChange={(checked) => updateSetting('emergencyAlerts', checked)}
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button 
                variant="outline" 
                onClick={handleTestNotification}
                className="w-full"
                size="sm"
              >
                <Bell className="w-4 h-4 mr-2" />
                Test Notification
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleScheduleReminder}
                className="w-full"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-2" />
                Schedule Test Reminder
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { MobilePushNotifications };
