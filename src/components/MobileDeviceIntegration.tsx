
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { DeviceCapabilityItem } from './DeviceCapabilityItem';
import { DeviceStatusHeader } from './DeviceStatusHeader';

const MobileDeviceIntegration = () => {
  const {
    capabilities,
    batteryLevel,
    isOnline,
    requestPermission,
    testVibration
  } = useDeviceCapabilities();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Device Integration</span>
          <DeviceStatusHeader isOnline={isOnline} batteryLevel={batteryLevel} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {capabilities.map((capability) => (
          <DeviceCapabilityItem
            key={capability.name}
            capability={capability}
            onRequestPermission={requestPermission}
            onTestVibration={capability.name === 'Vibration' ? testVibration : undefined}
          />
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
