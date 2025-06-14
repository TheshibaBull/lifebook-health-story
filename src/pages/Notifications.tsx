
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAppLayout } from '@/components/MobileAppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ArrowLeft, CheckCircle, Clock, AlertCircle, Settings } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          {/* Header Section */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500 mt-1">Stay updated with your health</p>
              </div>
              <NotificationModal trigger={
                <Button variant="outline" size="sm" className="bg-white/50 border-gray-200">
                  <Settings className="w-4 h-4" />
                </Button>
              } />
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-6 space-y-4">
            {notifications.map((notification, index) => (
              <Card 
                key={notification.id} 
                className={`
                  transition-all duration-200 hover:shadow-md border-0 shadow-sm
                  ${!notification.read 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-25 border-l-4 border-l-blue-400' 
                    : 'bg-white'
                  }
                `}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200 flex-shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-16 px-4">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Bell className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500 text-sm">You're all caught up! New notifications will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-white/80">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Manage your health alerts and reminders</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Settings Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notification Settings
                </span>
                <NotificationModal />
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Notifications Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`
                    p-5 rounded-xl border transition-all duration-200 hover:shadow-sm
                    ${!notification.read 
                      ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-25 border-l-4 border-l-blue-400' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 leading-tight">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 flex-shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-400 font-medium">
                        {notification.time}
                      </p>
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
