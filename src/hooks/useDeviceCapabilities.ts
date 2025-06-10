
import { useState, useEffect } from 'react';
import { Camera, Mic, MapPin, Vibrate, Bell, Bluetooth } from 'lucide-react';
import { DeviceCapability } from '@/types/deviceCapability';
import { useToast } from '@/hooks/use-toast';

export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState<DeviceCapability[]>([]);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    checkDeviceCapabilities();
    getBatteryStatus();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkDeviceCapabilities = () => {
    const caps: DeviceCapability[] = [
      {
        name: 'Camera',
        icon: Camera({ className: "w-5 h-5" }),
        available: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        status: 'permission-needed',
        description: 'Take photos of medical documents'
      },
      {
        name: 'Microphone',
        icon: Mic({ className: "w-5 h-5" }),
        available: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        status: 'permission-needed',
        description: 'Voice notes and dictation'
      },
      {
        name: 'Location',
        icon: MapPin({ className: "w-5 h-5" }),
        available: !!(navigator.geolocation),
        status: 'permission-needed',
        description: 'Emergency location sharing'
      },
      {
        name: 'Vibration',
        icon: Vibrate({ className: "w-5 h-5" }),
        available: !!(navigator.vibrate),
        status: 'active',
        description: 'Haptic feedback for alerts'
      },
      {
        name: 'Notifications',
        icon: Bell({ className: "w-5 h-5" }),
        available: 'Notification' in window,
        status: Notification.permission === 'granted' ? 'active' : 'permission-needed',
        description: 'Health reminders and alerts'
      },
      {
        name: 'Bluetooth',
        icon: Bluetooth({ className: "w-5 h-5" }),
        available: !!(navigator as any).bluetooth,
        status: 'inactive',
        description: 'Connect health devices'
      }
    ];
    
    setCapabilities(caps);
  };

  const getBatteryStatus = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setBatteryLevel(Math.round(battery.level * 100));
      } catch (error) {
        console.log('Battery API not available');
      }
    }
  };

  const requestPermission = async (capability: string) => {
    try {
      switch (capability) {
        case 'Camera':
          await navigator.mediaDevices.getUserMedia({ video: true });
          toast({
            title: "Camera Access Granted",
            description: "You can now use camera features"
          });
          break;
        case 'Microphone':
          await navigator.mediaDevices.getUserMedia({ audio: true });
          toast({
            title: "Microphone Access Granted",
            description: "You can now use voice features"
          });
          break;
        case 'Location':
          navigator.geolocation.getCurrentPosition(
            () => {
              toast({
                title: "Location Access Granted",
                description: "Emergency features are now available"
              });
            },
            () => {
              toast({
                title: "Location Access Denied",
                description: "Some emergency features may not work",
                variant: "destructive"
              });
            }
          );
          break;
        case 'Notifications':
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            toast({
              title: "Notifications Enabled",
              description: "You'll receive health reminders"
            });
          }
          break;
      }
      checkDeviceCapabilities();
    } catch (error) {
      toast({
        title: "Permission Denied",
        description: `Could not access ${capability}`,
        variant: "destructive"
      });
    }
  };

  const testVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
      toast({
        title: "Vibration Test",
        description: "Did you feel that?"
      });
    }
  };

  return {
    capabilities,
    batteryLevel,
    isOnline,
    requestPermission,
    testVibration
  };
};
