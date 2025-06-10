
export interface DeviceCapability {
  name: string;
  icon: React.ReactNode;
  available: boolean;
  status: 'active' | 'inactive' | 'permission-needed';
  description: string;
}
