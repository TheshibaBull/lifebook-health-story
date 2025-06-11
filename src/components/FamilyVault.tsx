import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart3, Settings, Plus } from 'lucide-react';
import { AddFamilyMemberDialog } from '@/components/AddFamilyMemberDialog';
import { FamilyMemberProfile } from '@/components/FamilyMemberProfile';
import { FamilyHealthAnalytics } from '@/components/FamilyHealthAnalytics';
import { OfflineDataSync } from '@/services/offlineDataSync';
import { useIsMobile } from '@/hooks/use-mobile';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  status: string;
  lastUpdate: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  emergencyContact?: boolean;
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  accessLevel: 'full' | 'limited' | 'view-only';
}

const FamilyVault = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load family members from localStorage with persistence
    const stored = localStorage.getItem('family-members');
    if (stored) {
      setFamilyMembers(JSON.parse(stored));
    } else {
      // Initialize with sample data
      const initialMembers: FamilyMember[] = [
        { 
          id: '1', 
          name: 'Mle', 
          relation: 'Partner', 
          avatar: 'M',
          status: 'Active',
          lastUpdate: '2 days ago',
          email: 'mle@example.com',
          phone: '+1234567890',
          emergencyContact: true,
          accessLevel: 'full',
          medicalConditions: ['Hypertension'],
          allergies: ['Peanuts'],
          medications: ['Lisinopril']
        },
        { 
          id: '2', 
          name: 'Swapnil', 
          relation: 'Sibling', 
          avatar: 'S',
          status: 'Active',
          lastUpdate: '1 week ago',
          email: 'swapnil@example.com',
          accessLevel: 'limited',
          medicalConditions: ['Diabetes Type 2'],
          medications: ['Metformin']
        },
      ];
      setFamilyMembers(initialMembers);
      localStorage.setItem('family-members', JSON.stringify(initialMembers));
    }
  }, []);

  const handleAddMember = (newMemberData: any) => {
    const newMember: FamilyMember = {
      id: crypto.randomUUID(),
      ...newMemberData,
      status: 'Active',
      lastUpdate: 'Just now',
      accessLevel: 'view-only' as const
    };

    const updatedMembers = [...familyMembers, newMember];
    setFamilyMembers(updatedMembers);
    localStorage.setItem('family-members', JSON.stringify(updatedMembers));

    OfflineDataSync.addToSyncQueue({
      type: 'family_member',
      action: 'create',
      data: newMember
    });
  };

  const handleUpdateMember = (updatedMember: FamilyMember) => {
    const updatedMembers = familyMembers.map(member => 
      member.id === updatedMember.id ? updatedMember : member
    );
    setFamilyMembers(updatedMembers);
    localStorage.setItem('family-members', JSON.stringify(updatedMembers));

    OfflineDataSync.addToSyncQueue({
      type: 'family_member',
      action: 'update',
      data: updatedMember
    });

    setSelectedMember(null);
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'text-green-600';
      case 'limited': return 'text-yellow-600';
      case 'view-only': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (selectedMember) {
    return (
      <FamilyMemberProfile
        member={selectedMember}
        onUpdateMember={handleUpdateMember}
        onClose={() => setSelectedMember(null)}
      />
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4 mt-4">
            {familyMembers.map((member) => (
              <div 
                key={member.id} 
                className="p-4 rounded-lg border bg-white"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-lg">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.relation}</p>
                    <p className="text-xs text-gray-500 mt-1">Last updated: {member.lastUpdate}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{member.status}</Badge>
                      {member.emergencyContact && (
                        <Badge variant="destructive" className="text-xs">Emergency Contact</Badge>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${getAccessLevelColor(member.accessLevel)}`}>
                      {member.accessLevel.replace('-', ' ')} access
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setSelectedMember(member)}
                  className="w-full mt-3" 
                  size="sm"
                >
                  View Profile
                </Button>
              </div>
            ))}
            
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-white">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-3">Add a family member to manage their health records</p>
              <AddFamilyMemberDialog onAddMember={handleAddMember} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <FamilyHealthAnalytics />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Family Access Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Default Access Level</h4>
                  <p className="text-sm text-gray-600 mb-3">New family members will be assigned this access level by default</p>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="view-only">View Only</option>
                    <option value="limited">Limited Access</option>
                    <option value="full">Full Access</option>
                  </select>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Data Sharing Preferences</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Allow family members to view my health summaries</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Share emergency medical information</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Allow family analytics and insights</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Family Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Notify when family member adds new health record</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Alert for family health emergencies</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Weekly family health summary</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-green-500" />
          Family Health Vault
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4 mt-4">
            {familyMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedMember(member)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-lg">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.relation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">Last updated: {member.lastUpdate}</p>
                      {member.emergencyContact && (
                        <Badge variant="destructive" className="text-xs">Emergency Contact</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge variant="secondary">{member.status}</Badge>
                    <p className={`text-xs mt-1 ${getAccessLevelColor(member.accessLevel)}`}>
                      {member.accessLevel.replace('-', ' ')} access
                    </p>
                  </div>
                  <Button variant="outline" size="sm">View Profile</Button>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-3">Add a family member to manage their health records</p>
              <AddFamilyMemberDialog onAddMember={handleAddMember} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <FamilyHealthAnalytics />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Family Access Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Default Access Level</h4>
                  <p className="text-sm text-gray-600 mb-3">New family members will be assigned this access level by default</p>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="view-only">View Only</option>
                    <option value="limited">Limited Access</option>
                    <option value="full">Full Access</option>
                  </select>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Data Sharing Preferences</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Allow family members to view my health summaries</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Share emergency medical information</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Allow family analytics and insights</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Family Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Notify when family member adds new health record</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Alert for family health emergencies</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Weekly family health summary</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export { FamilyVault };
