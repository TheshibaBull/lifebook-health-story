
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const FamilyHealthDashboard = () => {
  const familyMembers = [
    {
      name: 'Dad (Robert)',
      age: 58,
      status: 'warning',
      alert: 'Sugar test due in 5 days',
      lastCheckup: '2 months ago'
    },
    {
      name: 'Mom (Sarah)',
      age: 55,
      status: 'good',
      alert: 'All tests up to date',
      lastCheckup: '1 month ago'
    },
    {
      name: 'Emma (Daughter)',
      age: 12,
      status: 'pending',
      alert: 'School vaccination pending',
      lastCheckup: '6 months ago'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-green-500" />
          Family Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {familyMembers.map((member, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-bold">{member.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-600">Age {member.age} • Last checkup: {member.lastCheckup}</p>
                <div className="flex items-center gap-2 mt-1">
                  {member.status === 'warning' && <AlertCircle className="w-3 h-3 text-amber-500" />}
                  {member.status === 'good' && <CheckCircle className="w-3 h-3 text-green-500" />}
                  {member.status === 'pending' && <Clock className="w-3 h-3 text-blue-500" />}
                  <span className="text-xs">{member.alert}</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline">
              View
            </Button>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          Manage Family Access
        </Button>
      </CardContent>
    </Card>
  );
};

export { FamilyHealthDashboard };
