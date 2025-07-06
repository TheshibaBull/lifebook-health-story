import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Accessibility, 
  Palette, 
  Download, 
  Trash2,
  Eye,
  Volume2,
  Moon,
  Sun,
  Type,
  Database,
  ChevronRight,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MobileAppLayout } from '@/components/MobileAppLayout';
import { MobileCard } from '@/components/MobileCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { AllergiesSelector } from '@/components/AllergiesSelector';

interface UserSettings {
  // Profile
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  familyNotifications: boolean;
  emergencyAlerts: boolean;
  
  // Privacy
  dataSharing: boolean;
  analyticsTracking: boolean;
  profileVisibility: 'private' | 'family' | 'public';
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  
  // Theme
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  allergies: string[];
}

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emailNotifications: true,
    pushNotifications: true,
    familyNotifications: true,
    emergencyAlerts: true,
    dataSharing: false,
    analyticsTracking: false,
    profileVisibility: 'family',
    highContrast: false,
    largeText: false,
    screenReader: false,
    reducedMotion: false,
    theme: 'light',
    fontSize: 'medium',
    colorScheme: 'blue',
    allergies: []
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [currentView, setCurrentView] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('user-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load profile data
    const profile = localStorage.getItem('user-profile');
    if (profile) {
      const profileData = JSON.parse(profile);
      setSettings(prev => ({
        ...prev,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || ''
      }));
    }
  }, []);

  // Apply settings immediately when changed
  useEffect(() => {
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply accessibility settings
    const body = document.body;
    
    // High contrast
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    
    // Large text
    if (settings.largeText) {
      body.classList.add('large-text');
    } else {
      body.classList.remove('large-text');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }

    // Apply font size
    body.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (settings.fontSize) {
      case 'small':
        body.classList.add('text-sm');
        break;
      case 'medium':
        body.classList.add('text-base');
        break;
      case 'large':
        body.classList.add('text-lg');
        break;
    }

    // Apply color scheme
    const root = document.documentElement;
    root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
    root.classList.add(`theme-${settings.colorScheme}`);
    
    // Update CSS variables for color scheme
    switch (settings.colorScheme) {
      case 'blue':
        root.style.setProperty('--primary', '222.2 47.4% 11.2%');
        root.style.setProperty('--primary-foreground', '210 40% 98%');
        break;
      case 'green':
        root.style.setProperty('--primary', '142.1 76.2% 36.3%');
        root.style.setProperty('--primary-foreground', '355.7 100% 97.3%');
        break;
      case 'purple':
        root.style.setProperty('--primary', '262.1 83.3% 57.8%');
        root.style.setProperty('--primary-foreground', '210 20% 98%');
        break;
      case 'orange':
        root.style.setProperty('--primary', '24.6 95% 53.1%');
        root.style.setProperty('--primary-foreground', '60 9.1% 97.8%');
        break;
    }
  }, [settings]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('user-settings', JSON.stringify(settings));
    setHasChanges(false);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    const allData = {
      settings,
      profile: JSON.parse(localStorage.getItem('user-profile') || '{}'),
      familyMembers: JSON.parse(localStorage.getItem('family-members') || '[]'),
      healthRecords: JSON.parse(localStorage.getItem('health-records') || '[]'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lifebook-health-data.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your health data has been downloaded.",
    });
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your health data.')) {
      localStorage.clear();
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
        variant: "destructive"
      });
      navigate('/');
    }
  };

  const handleLogout = () => {
    // Clear all authentication and user data
    localStorage.removeItem('user-authenticated');
    localStorage.removeItem('onboarding-completed');
    localStorage.removeItem('user-profile');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/');
  };

  const renderMobileSettings = () => {
    if (currentView === 'main') {
      return (
        <div className="space-y-4">
          {hasChanges && (
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          )}

          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-between h-14 px-4"
              onClick={() => setCurrentView('profile')}
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-500" />
                <span>Profile</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-14 px-4"
              onClick={() => setCurrentView('notifications')}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-500" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-14 px-4"
              onClick={() => setCurrentView('privacy')}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Privacy</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-14 px-4"
              onClick={() => setCurrentView('accessibility')}
            >
              <div className="flex items-center gap-3">
                <Accessibility className="w-5 h-5 text-blue-500" />
                <span>Accessibility</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-14 px-4"
              onClick={() => setCurrentView('appearance')}
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-blue-500" />
                <span>Appearance</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-14 px-4"
              onClick={() => setCurrentView('data')}
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-500" />
                <span>Data Management</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      );
    }

    const renderSubPage = () => {
      const backButton = (
        <Button
          variant="ghost"
          className="mb-4 p-2"
          onClick={() => setCurrentView('main')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      );

      switch (currentView) {
        case 'profile':
          return (
            <div>
              {backButton}
              <MobileCard 
                title="Profile Information" 
                subtitle="Update your personal details"
                icon={<User className="w-6 h-6 text-blue-500" />}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => handleSettingChange('firstName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => handleSettingChange('lastName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleSettingChange('phone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <AllergiesSelector
                    value={settings.allergies}
                    onChange={(allergies) => handleSettingChange('allergies', allergies)}
                    disabled={isLoading}
                    label="Allergies"
                  />
                </div>
              </MobileCard>
            </div>
          );

        case 'notifications':
          return (
            <div>
              {backButton}
              <MobileCard 
                title="Notification Preferences" 
                subtitle="Control your notification settings"
                icon={<Bell className="w-6 h-6 text-blue-500" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Receive push notifications</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Family Notifications</h4>
                      <p className="text-sm text-gray-600">Family member updates</p>
                    </div>
                    <Switch
                      checked={settings.familyNotifications}
                      onCheckedChange={(checked) => handleSettingChange('familyNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Emergency Alerts</h4>
                      <p className="text-sm text-gray-600">Critical notifications</p>
                    </div>
                    <Switch
                      checked={settings.emergencyAlerts}
                      onCheckedChange={(checked) => handleSettingChange('emergencyAlerts', checked)}
                    />
                  </div>
                </div>
              </MobileCard>
            </div>
          );

        case 'privacy':
          return (
            <div>
              {backButton}
              <MobileCard 
                title="Privacy Controls" 
                subtitle="Manage your privacy settings"
                icon={<Shield className="w-6 h-6 text-blue-500" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Sharing</h4>
                      <p className="text-sm text-gray-600">Share data for research</p>
                    </div>
                    <Switch
                      checked={settings.dataSharing}
                      onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Analytics Tracking</h4>
                      <p className="text-sm text-gray-600">Help improve the app</p>
                    </div>
                    <Switch
                      checked={settings.analyticsTracking}
                      onCheckedChange={(checked) => handleSettingChange('analyticsTracking', checked)}
                    />
                  </div>
                  <div>
                    <Label>Profile Visibility</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {(['private', 'family', 'public'] as const).map((visibility) => (
                        <Button
                          key={visibility}
                          variant={settings.profileVisibility === visibility ? 'default' : 'outline'}
                          onClick={() => handleSettingChange('profileVisibility', visibility)}
                          className="capitalize justify-start"
                          size="sm"
                        >
                          {visibility}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </MobileCard>
            </div>
          );

        case 'accessibility':
          return (
            <div>
              {backButton}
              <MobileCard 
                title="Accessibility Options" 
                subtitle="Improve app accessibility"
                icon={<Accessibility className="w-6 h-6 text-blue-500" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium">High Contrast</h4>
                        <p className="text-sm text-gray-600">Better visibility</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Type className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium">Large Text</h4>
                        <p className="text-sm text-gray-600">Increase text size</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.largeText}
                      onCheckedChange={(checked) => handleSettingChange('largeText', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium">Screen Reader</h4>
                        <p className="text-sm text-gray-600">Optimize for screen readers</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.screenReader}
                      onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Reduced Motion</h4>
                      <p className="text-sm text-gray-600">Minimize animations</p>
                    </div>
                    <Switch
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
                    />
                  </div>
                </div>
              </MobileCard>
            </div>
          );

        case 'appearance':
          return (
            <div>
              {backButton}
              <MobileCard 
                title="Theme & Appearance" 
                subtitle="Customize the app's look"
                icon={<Palette className="w-6 h-6 text-blue-500" />}
              >
                <div className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <Button
                        variant={settings.theme === 'light' ? 'default' : 'outline'}
                        onClick={() => handleSettingChange('theme', 'light')}
                        className="justify-start"
                        size="sm"
                      >
                        <Sun className="w-4 h-4 mr-2" />
                        Light
                      </Button>
                      <Button
                        variant={settings.theme === 'dark' ? 'default' : 'outline'}
                        onClick={() => handleSettingChange('theme', 'dark')}
                        className="justify-start"
                        size="sm"
                      >
                        <Moon className="w-4 h-4 mr-2" />
                        Dark
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Font Size</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <Button
                          key={size}
                          variant={settings.fontSize === size ? 'default' : 'outline'}
                          onClick={() => handleSettingChange('fontSize', size)}
                          className="capitalize justify-start"
                          size="sm"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Color Scheme</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(['blue', 'green', 'purple', 'orange'] as const).map((color) => (
                        <Button
                          key={color}
                          variant={settings.colorScheme === color ? 'default' : 'outline'}
                          onClick={() => handleSettingChange('colorScheme', color)}
                          className="capitalize"
                          size="sm"
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </MobileCard>
            </div>
          );

        case 'data':
          return (
            <div>
              {backButton}
              <MobileCard 
                title="Data Management" 
                subtitle="Export or delete your data"
                icon={<Database className="w-6 h-6 text-blue-500" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Export Your Data</h4>
                      <p className="text-sm text-gray-600">Download all your health data</p>
                    </div>
                    <Button variant="outline" onClick={handleExportData} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg border-blue-200">
                    <div>
                      <h4 className="font-medium text-blue-600">Logout</h4>
                      <p className="text-sm text-gray-600">Sign out of your account</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} size="sm">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg border-red-200">
                    <div>
                      <h4 className="font-medium text-red-600">Delete Account</h4>
                      <p className="text-sm text-gray-600">Permanently delete account and data</p>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount} size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </MobileCard>
            </div>
          );

        default:
          return <div>Page not found</div>;
      }
    };

    return renderSubPage();
  };

  if (isMobile) {
    return (
      <MobileAppLayout title="Settings" showTabBar={true}>
        <div className="px-4 py-4">
          {renderMobileSettings()}
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} className="flex items-center gap-2">
              Save Changes
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Accessibility className="w-4 h-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => handleSettingChange('firstName', e.target.value)}
                      aria-label="First Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => handleSettingChange('lastName', e.target.value)}
                      aria-label="Last Name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    aria-label="Email Address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleSettingChange('phone', e.target.value)}
                    aria-label="Phone Number"
                  />
                </div>
                <AllergiesSelector
                  value={settings.allergies}
                  onChange={(allergies) => handleSettingChange('allergies', allergies)}
                  label="Allergies"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Export Your Data</h4>
                    <p className="text-sm text-gray-600">Download all your health data</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <h4 className="font-medium text-blue-600">Logout</h4>
                    <p className="text-sm text-gray-600">Sign out of your account</p>
                  </div>
                  <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-gray-600">Permanently delete your account and data</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount} className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    aria-label="Email Notifications"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    aria-label="Push Notifications"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Family Notifications</h4>
                    <p className="text-sm text-gray-600">Get notified about family member updates</p>
                  </div>
                  <Switch
                    checked={settings.familyNotifications}
                    onCheckedChange={(checked) => handleSettingChange('familyNotifications', checked)}
                    aria-label="Family Notifications"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Emergency Alerts</h4>
                    <p className="text-sm text-gray-600">Critical health and emergency notifications</p>
                  </div>
                  <Switch
                    checked={settings.emergencyAlerts}
                    onCheckedChange={(checked) => handleSettingChange('emergencyAlerts', checked)}
                    aria-label="Emergency Alerts"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-gray-600">Share anonymized data for research</p>
                  </div>
                  <Switch
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
                    aria-label="Data Sharing"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Analytics Tracking</h4>
                    <p className="text-sm text-gray-600">Help improve the app with usage analytics</p>
                  </div>
                  <Switch
                    checked={settings.analyticsTracking}
                    onCheckedChange={(checked) => handleSettingChange('analyticsTracking', checked)}
                    aria-label="Analytics Tracking"
                  />
                </div>
                <div>
                  <Label>Profile Visibility</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(['private', 'family', 'public'] as const).map((visibility) => (
                      <Button
                        key={visibility}
                        variant={settings.profileVisibility === visibility ? 'default' : 'outline'}
                        onClick={() => handleSettingChange('profileVisibility', visibility)}
                        className="capitalize"
                      >
                        {visibility}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">High Contrast</h4>
                      <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                    aria-label="High Contrast Mode"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">Large Text</h4>
                      <p className="text-sm text-gray-600">Increase text size for better readability</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.largeText}
                    onCheckedChange={(checked) => handleSettingChange('largeText', checked)}
                    aria-label="Large Text"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">Screen Reader Support</h4>
                      <p className="text-sm text-gray-600">Optimize for screen readers</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                    aria-label="Screen Reader Support"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reduced Motion</h4>
                    <p className="text-sm text-gray-600">Minimize animations and transitions</p>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
                    aria-label="Reduced Motion"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Theme</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={settings.theme === 'light' ? 'default' : 'outline'}
                      onClick={() => handleSettingChange('theme', 'light')}
                      className="flex items-center gap-2"
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </Button>
                    <Button
                      variant={settings.theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => handleSettingChange('theme', 'dark')}
                      className="flex items-center gap-2"
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Font Size</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <Button
                        key={size}
                        variant={settings.fontSize === size ? 'default' : 'outline'}
                        onClick={() => handleSettingChange('fontSize', size)}
                        className="capitalize"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {(['blue', 'green', 'purple', 'orange'] as const).map((color) => (
                      <Button
                        key={color}
                        variant={settings.colorScheme === color ? 'default' : 'outline'}
                        onClick={() => handleSettingChange('colorScheme', color)}
                        className="capitalize"
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
