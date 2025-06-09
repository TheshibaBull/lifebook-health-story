
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { AddFamilyMemberDialog } from '@/components/AddFamilyMemberDialog';

const FamilyVault = () => {
  const [familyMembers, setFamilyMembers] = useState([
    { 
      id: '1', 
      name: 'Mle', 
      relation: 'Partner', 
      avatar: 'M',
      status: 'Active',
      lastUpdate: '2 days ago'
    },
    { 
      id: '2', 
      name: 'Swapnil', 
      relation: 'Sibling', 
      avatar: 'S',
      status: 'Active',
      lastUpdate: '1 week ago'
    },
  ]);

  const handleAddMember = (newMember: any) => {
    setFamilyMembers(prev => [...prev, newMember]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-green-500" />
          Family Health Vault
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {familyMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {member.avatar}
                </div>
                <div>
                  <p className="font-medium text-lg">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.relation}</p>
                  <p className="text-xs text-gray-500">Last updated: {member.lastUpdate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{member.status}</Badge>
                <Button variant="outline" size="sm">View Records</Button>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-3">Add a family member to manage their health records</p>
            <AddFamilyMemberDialog onAddMember={handleAddMember} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { FamilyVault };
