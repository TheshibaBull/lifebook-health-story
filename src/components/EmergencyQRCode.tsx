
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Share2, Eye, EyeOff, Phone, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmergencyData {
  fullName: string;
  dateOfBirth: string;
  bloodType: string;
  allergies: string;
  medications: string;
  medicalConditions: string;
  emergencyContact1: string;
  emergencyContact2: string;
  insuranceInfo: string;
  doctorInfo: string;
}

const EmergencyQRCode = () => {
  const [emergencyData, setEmergencyData] = useState<EmergencyData>({
    fullName: '',
    dateOfBirth: '',
    bloodType: '',
    allergies: '',
    medications: '',
    medicalConditions: '',
    emergencyContact1: '',
    emergencyContact2: '',
    insuranceInfo: '',
    doctorInfo: ''
  });
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEmergencyData();
  }, []);

  useEffect(() => {
    if (isDataComplete()) {
      generateQRCode();
    }
  }, [emergencyData]);

  const loadEmergencyData = () => {
    const saved = localStorage.getItem('emergency-data');
    if (saved) {
      const data = JSON.parse(saved);
      setEmergencyData(data);
      setLastUpdated(new Date(data.lastUpdated || Date.now()));
    }
  };

  const saveEmergencyData = () => {
    const dataToSave = {
      ...emergencyData,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('emergency-data', JSON.stringify(dataToSave));
    setLastUpdated(new Date());
    
    toast({
      title: "Emergency Data Saved",
      description: "Your emergency information has been updated",
    });
  };

  const isDataComplete = () => {
    return emergencyData.fullName && 
           emergencyData.bloodType && 
           emergencyData.emergencyContact1;
  };

  const generateQRCode = async () => {
    try {
      const emergencyUrl = `https://emergency.lifebook.health/view/${btoa(JSON.stringify({
        name: emergencyData.fullName,
        dob: emergencyData.dateOfBirth,
        blood: emergencyData.bloodType,
        allergies: emergencyData.allergies,
        meds: emergencyData.medications,
        conditions: emergencyData.medicalConditions,
        emergency1: emergencyData.emergencyContact1,
        emergency2: emergencyData.emergencyContact2,
        insurance: emergencyData.insuranceInfo,
        doctor: emergencyData.doctorInfo,
        updated: new Date().toISOString()
      }))}`;

      // Generate QR code using a simple QR generator
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(emergencyUrl)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      toast({
        title: "QR Code Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emergency-qr-${emergencyData.fullName || 'code'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "QR Code Downloaded",
        description: "Emergency QR code saved to your device",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download QR code",
        variant: "destructive"
      });
    }
  };

  const shareQRCode = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        await navigator.share({
          title: 'Emergency Medical Information',
          text: 'My emergency medical QR code',
          url: qrCodeUrl
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback - copy to clipboard
      if (qrCodeUrl) {
        navigator.clipboard.writeText(qrCodeUrl);
        toast({
          title: "QR Code Copied",
          description: "QR code URL copied to clipboard",
        });
      }
    }
  };

  const updateField = (field: keyof EmergencyData, value: string) => {
    setEmergencyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="text-red-500" />
            Emergency Medical QR Code
            {isDataComplete() && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            {qrCodeUrl && isDataComplete() ? (
              <div className="space-y-4">
                <div 
                  ref={qrRef}
                  className={`mx-auto w-48 h-48 border-2 border-gray-200 rounded-lg p-4 ${
                    !isVisible ? 'blur-sm' : ''
                  }`}
                >
                  <img 
                    src={qrCodeUrl} 
                    alt="Emergency QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVisible(!isVisible)}
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadQRCode}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareQRCode}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                {lastUpdated && (
                  <p className="text-xs text-gray-500">
                    Last updated: {lastUpdated.toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-8">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Complete your emergency information to generate QR code</p>
                <p className="text-sm text-gray-500">Required: Name, Blood Type, Emergency Contact</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={emergencyData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={emergencyData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="bloodType">Blood Type *</Label>
              <Input
                id="bloodType"
                value={emergencyData.bloodType}
                onChange={(e) => updateField('bloodType', e.target.value)}
                placeholder="e.g., A+, O-, AB+"
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyContact1">Emergency Contact 1 *</Label>
              <Input
                id="emergencyContact1"
                value={emergencyData.emergencyContact1}
                onChange={(e) => updateField('emergencyContact1', e.target.value)}
                placeholder="Name and phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyContact2">Emergency Contact 2</Label>
              <Input
                id="emergencyContact2"
                value={emergencyData.emergencyContact2}
                onChange={(e) => updateField('emergencyContact2', e.target.value)}
                placeholder="Name and phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="doctorInfo">Primary Doctor</Label>
              <Input
                id="doctorInfo"
                value={emergencyData.doctorInfo}
                onChange={(e) => updateField('doctorInfo', e.target.value)}
                placeholder="Doctor name and contact"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={emergencyData.allergies}
              onChange={(e) => updateField('allergies', e.target.value)}
              placeholder="List any allergies (medications, food, environmental)"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="medications">Current Medications</Label>
            <Textarea
              id="medications"
              value={emergencyData.medications}
              onChange={(e) => updateField('medications', e.target.value)}
              placeholder="List current medications and dosages"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="medicalConditions">Medical Conditions</Label>
            <Textarea
              id="medicalConditions"
              value={emergencyData.medicalConditions}
              onChange={(e) => updateField('medicalConditions', e.target.value)}
              placeholder="List relevant medical conditions"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="insuranceInfo">Insurance Information</Label>
            <Textarea
              id="insuranceInfo"
              value={emergencyData.insuranceInfo}
              onChange={(e) => updateField('insuranceInfo', e.target.value)}
              placeholder="Insurance provider and policy details"
              rows={2}
            />
          </div>
          
          <Button onClick={saveEmergencyData} className="w-full">
            Save Emergency Information
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export { EmergencyQRCode };
