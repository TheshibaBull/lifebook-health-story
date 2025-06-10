
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { MobilePushNotifications } from './MobilePushNotifications';

interface NotificationModalProps {
  trigger?: React.ReactNode;
}

const NotificationModal = ({ trigger }: NotificationModalProps) => {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="w-full">
      <Bell className="w-4 h-4 mr-2" />
      Manage Notifications
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <MobilePushNotifications onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export { NotificationModal };
