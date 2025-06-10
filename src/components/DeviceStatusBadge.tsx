
import { Badge } from '@/components/ui/badge';
import { DeviceCapability } from '@/types/deviceCapability';

interface DeviceStatusBadgeProps {
  status: DeviceCapability['status'];
}

const DeviceStatusBadge = ({ status }: DeviceStatusBadgeProps) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    case 'permission-needed':
      return <Badge variant="outline" className="text-orange-600">Permission Needed</Badge>;
  }
};

export { DeviceStatusBadge };
