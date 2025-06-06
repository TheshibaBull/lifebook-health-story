
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Shield, AlertTriangle } from 'lucide-react';

const EmergencyCard = () => {
  const emergencyInfo = {
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    conditions: ['Hypertension', 'Asthma'],
    medications: ['Lisinopril 10mg', 'Albuterol Inhaler'],
    emergencyContact: '+1 (555) 123-4567',
    organDonor: true
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="text-red-500" />
            Emergency Access Card
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
              <QrCode className="w-32 h-32 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              Scan this QR code in case of emergency to access critical health information
            </p>
            <div className="flex gap-2 justify-center">
              <Button size="sm">Download QR</Button>
              <Button variant="outline" size="sm">Print Card</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-green-500" />
            Emergency Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Critical Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <Badge variant="destructive">{emergencyInfo.bloodGroup}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Organ Donor:</span>
                  <Badge variant={emergencyInfo.organDonor ? "default" : "secondary"}>
                    {emergencyInfo.organDonor ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span className="font-mono">{emergencyInfo.emergencyContact}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Medical Conditions</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Conditions:</p>
                  <div className="flex gap-1 flex-wrap">
                    {emergencyInfo.conditions.map((condition, index) => (
                      <Badge key={index} variant="outline">{condition}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Allergies:</p>
                  <div className="flex gap-1 flex-wrap">
                    {emergencyInfo.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive">{allergy}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Medications:</p>
                  <div className="flex gap-1 flex-wrap">
                    {emergencyInfo.medications.map((med, index) => (
                      <Badge key={index} variant="secondary">{med}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { EmergencyCard };
