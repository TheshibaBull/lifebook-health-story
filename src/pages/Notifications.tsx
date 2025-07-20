
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellRing, 
  Check, 
  Trash2, 
  Calendar,
  Heart,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { BackToDashboard } from '@/components/BackToDashboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      
      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'health_reminder':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'family_update':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'document_processed':
        return <FileText className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Mock notifications if none exist
  const mockNotifications = [
    {
      id: '1',
      title: 'Health Record Processed',
      message: 'Your blood test results have been successfully processed and analyzed.',
      type: 'document_processed',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Medication Reminder',
      message: 'Time to take your evening medication - Vitamin D supplement.',
      type: 'health_reminder',
      read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Family Member Added',
      message: 'John Doe has been successfully added to your family health vault.',
      type: 'family_update',
      read: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;
  const unreadCount = displayNotifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <AppLayout title="Notifications">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Notifications">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <BackToDashboard />
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <BellRing className="w-10 h-10 text-blue-500" />
              Notifications
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with your health records, reminders, and family updates
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold">
                Your Notifications
              </h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="px-3 py-1">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {displayNotifications.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications yet</h3>
                  <p className="text-gray-600">
                    You'll see health reminders, document updates, and family notifications here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              displayNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`border-0 shadow-lg transition-all hover:shadow-xl ${
                    !notification.read ? 'ring-2 ring-blue-500/20 bg-blue-50/30' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {new Date(notification.created_at).toLocaleDateString()} at{' '}
                                {new Date(notification.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">
                                  Unread
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Notification Settings */}
          <Card className="border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage how and when you receive notifications about your health records and family updates.
              </p>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;
