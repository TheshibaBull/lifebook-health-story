
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import type { FamilyMember } from '@/lib/supabase';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onViewProfile: (member: FamilyMember) => void;
}

const FamilyMemberCard = ({ member, onViewProfile }: FamilyMemberCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{member.name}</CardTitle>
          {member.emergency_contact && (
            <Badge variant="destructive" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Emergency
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">{member.relation}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm min-h-[80px]">
          <p className="text-gray-600">
            Age: {member.date_of_birth 
              ? new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()
              : 'Not specified'
            }
          </p>
          <p className="text-gray-600">
            Blood Group: {member.blood_group || 'Not specified'}
          </p>
          {member.medical_conditions && member.medical_conditions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {member.medical_conditions.slice(0, 2).map((condition, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {condition}
                </Badge>
              ))}
              {member.medical_conditions.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{member.medical_conditions.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button 
          className="w-full mt-4" 
          variant="outline"
          onClick={() => onViewProfile(member)}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export { FamilyMemberCard };
