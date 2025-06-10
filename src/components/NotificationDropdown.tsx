
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Bell, ChevronDown, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { PushNotificationService } from '@/services/pushNotificationService';
import { useToast } from '@/hooks/use-toast';

interface NotificationDropdownProps {
  trigger?: React.ReactNode;
}

const NotificationDropdown = ({ trigger }: NotificationDropdownProps) => {
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
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

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
      await PushNotificationService.initialize();
      const subscription = PushNotificationService.getStoredSubscription();
      setIsSubscribed(!!subscription);
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
    
    toast({
      title: "Test Sent",
      description: "Check if you received the notification",
    });
  };

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
    
    toast({
      title: "Setting Updated",
      description: `${key} notifications ${value ? 'enabled' : 'disabled'}`,
    });
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

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="w-full justify-between">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Manage Notifications
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        <ChevronDown className="w-4 h-4" />
      </div>
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notification Settings</span>
          {getStatusBadge()}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notificationPermission !== 'granted' ? (
          <div className="p-4 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-orange-500 mx-auto" />
            <div>
              <p className="font-medium text-sm">Enable Notifications</p>
              <p className="text-xs text-gray-600 mb-3">
                Get timely health reminders and updates
              </p>
              <Button onClick={handleEnableNotifications} size="sm" className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Enable Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="px-2 py-1">
              <div className="flex items-center gap-2 text-green-600 mb-3">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Notifications Active</span>
              </div>
            </div>

            <DropdownMenuItem className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-sm">Medication Reminders</p>
                <p className="text-xs text-gray-500">Daily medication alerts</p>
              </div>
              <Switch
                checked={settings.medicationReminders}
                onCheckedChange={(checked) => updateSetting('medicationReminders', checked)}
              />
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-sm">Appointment Reminders</p>
                <p className="text-xs text-gray-500">Upcoming appointments</p>
              </div>
              <Switch
                checked={settings.appointmentReminders}
                onCheckedChange={(checked) => updateSetting('appointmentReminders', checked)}
              />
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-sm">Health Goals</p>
                <p className="text-xs text-gray-500">Progress updates</p>
              </div>
              <Switch
                checked={settings.healthGoals}
                onCheckedChange={(checked) => updateSetting('healthGoals', checked)}
              />
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-sm">Family Updates</p>
                <p className="text-xs text-gray-500">Family member health updates</p>
              </div>
              <Switch
                checked={settings.familyUpdates}
                onCheckedChange={(checked) => updateSetting('familyUpdates', checked)}
              />
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-sm">Emergency Alerts</p>
                <p className="text-xs text-gray-500">Critical health notifications</p>
              </div>
              <Switch
                checked={settings.emergencyAlerts}
                onCheckedChange={(checked) => updateSetting('emergencyAlerts', checked)}
              />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleTestNotification} className="p-3">
              <Bell className="w-4 h-4 mr-2" />
              Test Notification
            </DropdownMenuItem>

            <DropdownMenuItem className="p-3">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Test Reminder
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { NotificationDropdown };
