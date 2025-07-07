
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Heart } from 'lucide-react';
import type { FamilyMember } from '@/lib/supabase';

interface EmergencyContactsTabProps {
  familyMembers: FamilyMember[];
}

const EmergencyContactsTab = ({ familyMembers }: EmergencyContactsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="w-5 h-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {familyMembers.filter(member => member.emergency_contact).length === 0 ? (
            <p className="text-gray-600">No emergency contacts set</p>
          ) : (
            <div className="space-y-3">
              {familyMembers
                .filter(member => member.emergency_contact)
                .map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.relation}</p>
                      {member.phone && (
                        <p className="text-sm text-blue-600">{member.phone}</p>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      Call
                    </Button>
                  </div>
                ))
              }
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Heart className="w-5 h-5" />
            Critical Health Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {familyMembers.map((member) => {
              const criticalInfo = [];
              if (member.allergies && member.allergies.length > 0) {
                criticalInfo.push(`Allergies: ${member.allergies.join(', ')}`);
              }
              if (member.medical_conditions && member.medical_conditions.length > 0) {
                criticalInfo.push(`Conditions: ${member.medical_conditions.join(', ')}`);
              }
              if (member.medications && member.medications.length > 0) {
                criticalInfo.push(`Medications: ${member.medications.join(', ')}`);
              }

              if (criticalInfo.length === 0) return null;

              return (
                <div key={member.id} className="border rounded-lg p-3">
                  <h4 className="font-medium">{member.name}</h4>
                  <div className="mt-2 space-y-1">
                    {criticalInfo.map((info, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {info}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { EmergencyContactsTab };
