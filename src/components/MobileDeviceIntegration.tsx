
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Mic, MapPin, Vibrate, Battery, Wifi, Bluetooth, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeviceCapability {
  name: string;
  icon: React.ReactNode;
  available: boolean;
  status: 'active' | 'inactive' | 'permission-needed';
  description: string;
}

const MobileDeviceIntegration = () => {
  const [capabilities, setCapabilities] = useState<DeviceCapability[]>([]);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    checkDeviceCapabilities();
    getBatteryStatus();
    
    // Listen for online/offline events
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
        icon: <Camera className="w-5 h-5" />,
        available: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        status: 'permission-needed',
        description: 'Take photos of medical documents'
      },
      {
        name: 'Microphone',
        icon: <Mic className="w-5 h-5" />,
        available: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        status: 'permission-needed',
        description: 'Voice notes and dictation'
      },
      {
        name: 'Location',
        icon: <MapPin className="w-5 h-5" />,
        available: !!(navigator.geolocation),
        status: 'permission-needed',
        description: 'Emergency location sharing'
      },
      {
        name: 'Vibration',
        icon: <Vibrate className="w-5 h-5" />,
        available: !!(navigator.vibrate),
        status: 'active',
        description: 'Haptic feedback for alerts'
      },
      {
        name: 'Notifications',
        icon: <Bell className="w-5 h-5" />,
        available: 'Notification' in window,
        status: Notification.permission === 'granted' ? 'active' : 'permission-needed',
        description: 'Health reminders and alerts'
      },
      {
        name: 'Bluetooth',
        icon: <Bluetooth className="w-5 h-5" />,
        available: !!(navigator.bluetooth),
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

  const getStatusBadge = (status: DeviceCapability['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'permission-needed':
        return <Badge variant="outline" className="text-orange-600">Permission Needed</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Device Integration</span>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="outline" className="text-green-600">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">Offline</Badge>
            )}
            {batteryLevel !== null && (
              <Badge variant="outline">
                <Battery className="w-3 h-3 mr-1" />
                {batteryLevel}%
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {capabilities.map((capability) => (
          <div key={capability.name} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-blue-500">
                {capability.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{capability.name}</p>
                <p className="text-xs text-gray-600">{capability.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(capability.status)}
              {capability.available && capability.status === 'permission-needed' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => requestPermission(capability.name)}
                >
                  Enable
                </Button>
              )}
              {capability.name === 'Vibration' && capability.available && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={testVibration}
                >
                  Test
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Enhanced Mobile Features</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Offline data synchronization</li>
            <li>• Native-like navigation gestures</li>
            <li>• Haptic feedback for important actions</li>
            <li>• Background app refresh</li>
            <li>• Biometric authentication support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export { MobileDeviceIntegration };
