
import { Badge } from '@/components/ui/badge';
import { Wifi, Battery } from 'lucide-react';

interface DeviceStatusHeaderProps {
  isOnline: boolean;
  batteryLevel: number | null;
}

const DeviceStatusHeader = ({ isOnline, batteryLevel }: DeviceStatusHeaderProps) => {
  return (
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
  );
};

export { DeviceStatusHeader };
