
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, QrCode, Heart, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuickEmergencyAccess = () => {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const { toast } = useToast();

  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', type: 'emergency' },
    { name: 'Poison Control', number: '1-800-222-1222', type: 'poison' },
    { name: 'Primary Doctor', number: '(555) 123-4567', type: 'doctor' },
    { name: 'Emergency Contact', number: '(555) 987-6543', type: 'personal' }
  ];

  const criticalInfo = {
    bloodType: 'A+',
    allergies: 'Penicillin, Shellfish',
    conditions: 'Diabetes Type 2, Hypertension',
    medications: 'Metformin 500mg, Lisinopril 10mg'
  };

  const activateEmergencyMode = () => {
    setEmergencyMode(true);
    
    // Flash the screen red briefly
    document.body.style.backgroundColor = '#fee2e2';
    setTimeout(() => {
      document.body.style.backgroundColor = '';
    }, 200);
    
    toast({
      title: "Emergency Mode Activated",
      description: "Critical medical information is now displayed",
      variant: "destructive"
    });
  };

  const callEmergency = (number: string, name: string) => {
    if (navigator.userAgent.includes('Mobile')) {
      window.location.href = `tel:${number}`;
    } else {
      navigator.clipboard.writeText(number);
      toast({
        title: "Phone Number Copied",
        description: `${name}: ${number} copied to clipboard`,
      });
    }
  };

  return (
    <div className="space-y-4">
      {!emergencyMode ? (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="text-red-500" />
              Emergency Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Quickly access critical medical information and emergency contacts
            </p>
            
            <Button 
              onClick={activateEmergencyMode}
              variant="destructive" 
              size="lg" 
              className="w-full h-16 text-lg"
            >
              <AlertTriangle className="w-6 h-6 mr-2" />
              ACTIVATE EMERGENCY MODE
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                This will display your critical medical information
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Emergency Header */}
          <Card className="border-red-500 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div>
                    <h2 className="text-xl font-bold text-red-700">EMERGENCY MODE</h2>
                    <p className="text-red-600">Critical Medical Information</p>
                  </div>
                </div>
                <Badge variant="destructive" className="animate-pulse">
                  ACTIVE
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="text-red-500" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {emergencyContacts.map((contact, index) => (
                  <Button
                    key={index}
                    variant={contact.type === 'emergency' ? 'destructive' : 'outline'}
                    size="lg"
                    onClick={() => callEmergency(contact.number, contact.name)}
                    className="justify-between h-auto p-4"
                  >
                    <div className="text-left">
                      <div className="font-semibold">{contact.name}</div>
                      <div className="text-sm opacity-90">{contact.number}</div>
                    </div>
                    <Phone className="w-5 h-5" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Medical Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="text-red-500" />
                Critical Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-bold text-red-700 mb-2">Blood Type</h3>
                  <p className="text-2xl font-bold text-red-600">{criticalInfo.bloodType}</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-bold text-orange-700 mb-2">Allergies</h3>
                  <p className="text-orange-600">{criticalInfo.allergies}</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-blue-700 mb-2">Medical Conditions</h3>
                  <p className="text-blue-600">{criticalInfo.conditions}</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-bold text-purple-700 mb-2">Current Medications</h3>
                  <p className="text-purple-600">{criticalInfo.medications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="text-red-500" />
                Show QR Code to Emergency Personnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="lg" className="w-full">
                <QrCode className="w-6 h-6 mr-2" />
                Display Emergency QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Deactivate Button */}
          <Button 
            onClick={() => setEmergencyMode(false)}
            variant="secondary" 
            className="w-full"
          >
            Deactivate Emergency Mode
          </Button>
        </div>
      )}
    </div>
  );
};

export { QuickEmergencyAccess };
