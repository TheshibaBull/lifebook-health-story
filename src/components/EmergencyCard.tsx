
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Shield, AlertTriangle, Download, Printer, Phone, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmergencyCard = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const emergencyInfo = {
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    conditions: ['Hypertension', 'Asthma'],
    medications: ['Lisinopril 10mg', 'Albuterol Inhaler'],
    emergencyContact: '+1 (555) 123-4567',
    organDonor: true
  };

  const handleDownloadQR = () => {
    // Generate QR code data
    const qrData = {
      name: "Emergency Medical Information",
      bloodGroup: emergencyInfo.bloodGroup,
      allergies: emergencyInfo.allergies.join(', '),
      conditions: emergencyInfo.conditions.join(', '),
      medications: emergencyInfo.medications.join(', '),
      emergencyContact: emergencyInfo.emergencyContact,
      organDonor: emergencyInfo.organDonor
    };
    
    // Create a data URL for the QR code
    const qrString = JSON.stringify(qrData);
    const blob = new Blob([qrString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emergency-medical-info.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "QR Code Downloaded",
      description: "Emergency information has been downloaded as a text file.",
    });
  };

  const handlePrintCard = () => {
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "Your emergency card is ready to print.",
    });
  };

  const handleCopyContact = async () => {
    try {
      await navigator.clipboard.writeText(emergencyInfo.emergencyContact);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Contact Copied",
        description: "Emergency contact number copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCallEmergency = () => {
    window.location.href = `tel:${emergencyInfo.emergencyContact}`;
  };

  return (
    <div className="space-y-6">
      {/* QR Code Card */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <QrCode className="text-red-500" />
            Emergency Access Card
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <div className="relative">
              <div className="w-48 h-48 mx-auto bg-white rounded-2xl flex items-center justify-center border-2 border-red-200 shadow-lg">
                <QrCode className="w-32 h-32 text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium">
                Scan for Emergency Medical Information
              </p>
              <p className="text-xs text-gray-600">
                Contains critical health data for first responders
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button 
                size="sm" 
                onClick={handleDownloadQR}
                className="bg-red-600 hover:bg-red-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrintCard}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Information Card */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Shield className="text-emerald-500" />
            Emergency Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Critical Information */}
            <div className="space-y-6">
              <div className="bg-white/60 rounded-xl p-5 border border-emerald-200">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-emerald-800">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Critical Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Blood Group:</span>
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      {emergencyInfo.bloodGroup}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Organ Donor:</span>
                    <Badge 
                      variant={emergencyInfo.organDonor ? "default" : "secondary"}
                      className="px-3 py-1"
                    >
                      {emergencyInfo.organDonor ? "✓ Yes" : "✗ No"}
                    </Badge>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Emergency Contact:</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleCopyContact}
                          className="h-8 px-2"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleCallEmergency}
                          className="h-8 px-2 bg-green-600 hover:bg-green-700"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <span className="font-mono text-lg font-semibold text-green-700">
                      {emergencyInfo.emergencyContact}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-6">
              <div className="bg-white/60 rounded-xl p-5 border border-emerald-200">
                <h3 className="font-semibold mb-4 text-emerald-800">Medical History</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Active Conditions:</p>
                    <div className="flex gap-2 flex-wrap">
                      {emergencyInfo.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">⚠️ Allergies:</p>
                    <div className="flex gap-2 flex-wrap">
                      {emergencyInfo.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="bg-red-100 text-red-800 border-red-300">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">💊 Current Medications:</p>
                    <div className="flex gap-2 flex-wrap">
                      {emergencyInfo.medications.map((med, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Instructions */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Emergency Instructions</h4>
                <p className="text-sm text-amber-700">
                  In case of emergency, scan the QR code above for complete medical information or call the emergency contact immediately. 
                  Show this card to medical personnel for quick access to critical health data.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { EmergencyCard };
