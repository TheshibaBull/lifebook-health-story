
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmergencyQRCode } from './EmergencyQRCode';
import { QuickEmergencyAccess } from './QuickEmergencyAccess';

const EmergencyCard = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="access" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="access">Quick Access</TabsTrigger>
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="access" className="space-y-4">
          <QuickEmergencyAccess />
        </TabsContent>
        
        <TabsContent value="qrcode" className="space-y-4">
          <EmergencyQRCode />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { EmergencyCard };
