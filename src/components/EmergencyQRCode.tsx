
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Share2, Copy, Smartphone, Users, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmergencyQRCode = () => {
  const [qrGenerated, setQrGenerated] = useState(false);
  const [shareMode, setShareMode] = useState<'personal' | 'family' | 'location'>('personal');
  const { toast } = useToast();

  const emergencyData = {
    personal: {
      name: 'John Doe',
      bloodType: 'A+',
      allergies: 'Penicillin, Shellfish',
      conditions: 'Diabetes Type 2, Hypertension',
      medications: 'Metformin 500mg, Lisinopril 10mg',
      emergencyContact: '+1 (555) 987-6543',
      doctor: 'Dr. Smith - (555) 123-4567'
    },
    family: {
      spouse: 'Jane Doe - Type O, No allergies',
      children: '2 children (ages 8, 12)',
      familyContact: '+1 (555) 555-1234'
    },
    location: {
      address: '123 Main St, City, State 12345',
      nearestHospital: 'City General Hospital - 0.5 miles',
      gpsCoords: '40.7128, -74.0060'
    }
  };

  const generateQRCode = () => {
    setQrGenerated(true);
    toast({
      title: "QR Code Generated",
      description: "Emergency information encoded successfully",
    });
  };

  const downloadQRCode = () => {
    // In a real app, this would generate and download the actual QR code
    toast({
      title: "QR Code Downloaded",
      description: "Saved to your device for offline access",
    });
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Medical Information',
          text: 'Access my emergency medical information',
          url: `${window.location.origin}/emergency-info/${btoa('emergency-data')}`
        });
        toast({
          title: "Shared Successfully",
          description: "Emergency QR code shared with selected contacts",
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const emergencyUrl = `${window.location.origin}/emergency-info/${btoa('emergency-data')}`;
    navigator.clipboard.writeText(emergencyUrl);
    toast({
      title: "Link Copied",
      description: "Emergency information link copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* QR Code Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={shareMode === 'personal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShareMode('personal')}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Personal
        </Button>
        <Button
          variant={shareMode === 'family' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShareMode('family')}
        >
          <Users className="w-4 h-4 mr-2" />
          Family
        </Button>
        <Button
          variant={shareMode === 'location' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShareMode('location')}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Location
        </Button>
      </div>

      {/* QR Code Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="text-blue-500" />
            Emergency QR Code - {shareMode.charAt(0).toUpperCase() + shareMode.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!qrGenerated ? (
            <div className="text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <Button onClick={generateQRCode} size="lg">
                <QrCode className="w-4 h-4 mr-2" />
                Generate Emergency QR Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mock QR Code Display */}
              <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Information Preview */}
              <div className="text-center space-y-2">
                <Badge variant="secondary">Encoded Information</Badge>
                <div className="text-sm text-gray-600 space-y-1">
                  {shareMode === 'personal' && (
                    <>
                      <p>• Blood Type: {emergencyData.personal.bloodType}</p>
                      <p>• Allergies: {emergencyData.personal.allergies}</p>
                      <p>• Emergency Contact: {emergencyData.personal.emergencyContact}</p>
                    </>
                  )}
                  {shareMode === 'family' && (
                    <>
                      <p>• Spouse: {emergencyData.family.spouse}</p>
                      <p>• Children: {emergencyData.family.children}</p>
                      <p>• Family Contact: {emergencyData.family.familyContact}</p>
                    </>
                  )}
                  {shareMode === 'location' && (
                    <>
                      <p>• Address: {emergencyData.location.address}</p>
                      <p>• Nearest Hospital: {emergencyData.location.nearestHospital}</p>
                      <p>• GPS: {emergencyData.location.gpsCoords}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadQRCode} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={shareQRCode} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Emergency Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="destructive" size="sm" className="w-full">
            🚨 Call Emergency Services (911)
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            📞 Call Emergency Contact
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            🏥 Call Primary Doctor
          </Button>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Show this QR code to emergency personnel for instant access to your medical information</p>
        <p>• Works offline once generated and downloaded</p>
        <p>• Update regularly to keep information current</p>
      </div>
    </div>
  );
};

export { EmergencyQRCode };
