
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share, Download, Plus, Smartphone, Store, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallProps {
  onClose?: () => void;
}

const MobileAppShell = ({ onClose }: PWAInstallProps) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is installed/standalone
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    setIsInstalled(localStorage.getItem('pwa-installed') === 'true');

    // Listen for install prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) {
      // Fallback for iOS and other browsers
      showInstallInstructions();
      return;
    }

    try {
      const result = await installPrompt.prompt();
      
      if (result.outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setIsInstalled(true);
        setInstallPrompt(null);
        
        toast({
          title: "App Installed!",
          description: "Lifebook Health is now available on your home screen"
        });
      }
    } catch (error) {
      console.error('Installation failed:', error);
      showInstallInstructions();
    }
  };

  const showInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = "To install this app:";
    
    if (isIOS) {
      instructions += "\n1. Tap the Share button (⎋)\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' to confirm";
    } else if (isAndroid) {
      instructions += "\n1. Tap the menu button (⋮)\n2. Tap 'Add to Home screen'\n3. Tap 'Add' to confirm";
    } else {
      instructions += "\n1. Click the browser menu\n2. Look for 'Install app' or 'Add to home screen'\n3. Follow the prompts";
    }
    
    toast({
      title: "Install Instructions",
      description: instructions
    });
  };

  const shareApp = async () => {
    const shareData = {
      title: 'Lifebook Health',
      text: 'Your lifelong health record, all in one place',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers without Web Share API
        navigator.clipboard.writeText(window.location.origin);
        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin)}`;
    
    // Create and download QR code
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'lifebook-health-qr.png';
    link.click();
    
    toast({
      title: "QR Code Generated",
      description: "QR code downloaded for easy sharing"
    });
  };

  const getAppStoreUrl = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      return "https://apps.apple.com/search?term=progressive%20web%20app";
    } else if (isAndroid) {
      return "https://play.google.com/store/search?q=progressive%20web%20app";
    }
    return null;
  };

  if (isStandalone || isInstalled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="text-green-500" />
            App Installed
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="text-green-500 mb-2">
              <Smartphone className="w-12 h-12 mx-auto" />
            </div>
            <p className="font-medium">Great! You're using the app version</p>
            <p className="text-sm text-gray-600">
              Enjoy native-like performance and offline capabilities
            </p>
          </div>
          
          <div className="space-y-2">
            <Button onClick={shareApp} variant="outline" className="w-full">
              <Share className="w-4 h-4 mr-2" />
              Share App
            </Button>
            <Button onClick={generateQRCode} variant="outline" className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="text-blue-500" />
          Install Mobile App
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            ×
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          <Smartphone className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="font-medium mb-2">Get the Mobile App Experience</h3>
          <p className="text-sm text-gray-600 mb-4">
            Install Lifebook Health for faster access, offline support, and native features
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleInstallPWA} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {installPrompt ? 'Install App' : 'Add to Home Screen'}
          </Button>
          
          <Button onClick={shareApp} variant="outline" className="w-full">
            <Share className="w-4 h-4 mr-2" />
            Share App
          </Button>

          {getAppStoreUrl() && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(getAppStoreUrl()!, '_blank')}
            >
              <Store className="w-4 h-4 mr-2" />
              View in App Store
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>App Benefits:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Works offline with data sync</li>
            <li>Home screen access</li>
            <li>Native notifications</li>
            <li>Faster loading times</li>
            <li>Full-screen experience</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export { MobileAppShell };
