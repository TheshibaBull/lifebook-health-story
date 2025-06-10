
import { Button } from '@/components/ui/button';
import { DeviceCapability } from '@/types/deviceCapability';
import { DeviceStatusBadge } from './DeviceStatusBadge';

interface DeviceCapabilityItemProps {
  capability: DeviceCapability;
  onRequestPermission: (capabilityName: string) => void;
  onTestVibration?: () => void;
}

const DeviceCapabilityItem = ({ 
  capability, 
  onRequestPermission, 
  onTestVibration 
}: DeviceCapabilityItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
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
        <DeviceStatusBadge status={capability.status} />
        {capability.available && capability.status === 'permission-needed' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onRequestPermission(capability.name)}
          >
            Enable
          </Button>
        )}
        {capability.name === 'Vibration' && capability.available && onTestVibration && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onTestVibration}
          >
            Test
          </Button>
        )}
      </div>
    </div>
  );
};

export { DeviceCapabilityItem };
