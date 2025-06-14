
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAppLayout } from '@/components/MobileAppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { NotificationModal } from '@/components/NotificationModal';

const Notifications = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [notifications] = useState([
    {
      id: 1,
      title: 'Medication Reminder',
      message: 'Time to take your evening medication',
      time: '2 hours ago',
      type: 'medication',
      read: false
    },
    {
      id: 2,
      title: 'Appointment Tomorrow',
      message: 'Checkup with Dr. Smith at 10:00 AM',
      time: '1 day ago',
      type: 'appointment',
      read: true
    },
    {
      id: 3,
      title: 'Health Goal Achievement',
      message: 'Congratulations! You completed your weekly exercise goal',
      time: '3 days ago',
      type: 'achievement',
      read: true
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'appointment':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isMobile) {
    return (
      <MobileAppLayout title="Notifications" showTabBar={true}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <NotificationModal />
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`${!notification.read ? 'border-blue-200 bg-blue-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">{notification.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          )}
        </div>
      </MobileAppLayout>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Notification Settings</span>
                <NotificationModal />
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-4 rounded-lg border ${!notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-400">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
