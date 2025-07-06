import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart3, Settings, Plus } from 'lucide-react';
import { AddFamilyMemberDialog } from '@/components/AddFamilyMemberDialog';
import { FamilyMemberProfile } from '@/components/FamilyMemberProfile';
import { FamilyHealthAnalytics } from '@/components/FamilyHealthAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { FamilyMembersService } from '@/services/familyMembersService';
import { useToast } from '@/hooks/use-toast';
import type { FamilyMember } from '@/lib/supabase';

const FamilyVault = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadFamilyMembers();
    }
  }, [user]);

  const loadFamilyMembers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const members = await FamilyMembersService.getFamilyMembers(user.id);
      setFamilyMembers(members);
    } catch (error: any) {
      console.error('Error loading family members:', error);
      toast({
        title: "Error",
        description: "Failed to load family members. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (memberData: any) => {
    if (!user) return;

    try {
      const newMember = await FamilyMembersService.createFamilyMember({
        user_id: user.id,
        name: memberData.name,
        relation: memberData.relation,
        email: memberData.email,
        phone: memberData.phone,
        date_of_birth: memberData.dateOfBirth,
        emergency_contact: memberData.emergencyContact || false,
        access_level: 'view-only'
      });

      setFamilyMembers(prev => [...prev, newMember]);
      
      toast({
        title: "Family Member Added",
        description: `${memberData.name} has been added to your family vault.`,
      });
    } catch (error: any) {
      console.error('Error adding family member:', error);
      toast({
        title: "Error",
        description: "Failed to add family member. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMember = async (updatedMember: FamilyMember) => {
    try {
      const updated = await FamilyMembersService.updateFamilyMember(updatedMember.id, updatedMember);
      setFamilyMembers(prev => prev.map(member => 
        member.id === updated.id ? updated : member
      ));
      setSelectedMember(null);
      
      toast({
        title: "Member Updated",
        description: "Family member information has been updated.",
      });
    } catch (error: any) {
      console.error('Error updating family member:', error);
      toast({
        title: "Error",
        description: "Failed to update family member. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'text-green-600';
      case 'limited': return 'text-yellow-600';
      case 'view-only': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading family members...</p>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-card">
        <div className="space-y-6 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4 mt-6">
              {familyMembers.map((member) => (
                <Card 
                  key={member.id} 
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground mb-1">{member.name}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{member.relation}</p>
                        <p className="text-xs text-muted-foreground/80 mb-3">
                          Added: {new Date(member.created_at).toLocaleDateString()}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {member.emergency_contact && (
                            <Badge variant="destructive" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                              Emergency Contact
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            member.access_level === 'full' ? 'bg-green-500' :
                            member.access_level === 'limited' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <p className="text-xs text-muted-foreground">
                            {member.access_level.replace('-', ' ')} access
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setSelectedMember(member)}
                      className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground shadow-sm" 
                      variant="outline"
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-2 border-dashed border-muted bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Add Family Member</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Manage health records for your loved ones
                  </p>
                  <AddFamilyMemberDialog onAddMember={handleAddMember} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-1">
                <FamilyHealthAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-6">
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    Family Access Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Default Access Level</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        New family members will be assigned this access level by default
                      </p>
                      <select className="w-full p-3 border rounded-lg bg-background text-foreground">
                        <option value="view-only">View Only</option>
                        <option value="limited">Limited Access</option>
                        <option value="full">Full Access</option>
                      </select>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Data Sharing Preferences</h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <input type="checkbox" defaultChecked className="w-4 h-4" />
                          <span className="text-sm text-foreground">Allow family members to view my health summaries</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <input type="checkbox" defaultChecked className="w-4 h-4" />
                          <span className="text-sm text-foreground">Share emergency medical information</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="text-sm text-foreground">Allow family analytics and insights</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Family Notifications</h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <input type="checkbox" defaultChecked className="w-4 h-4" />
                          <span className="text-sm text-foreground">Notify when family member adds new health record</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <input type="checkbox" defaultChecked className="w-4 h-4" />
                          <span className="text-sm text-foreground">Alert for family health emergencies</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="text-sm text-foreground">Weekly family health summary</span>
                        </label>
                      </div>
                    </div>

                    <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
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
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-lg">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.relation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        Added: {new Date(member.created_at).toLocaleDateString()}
                      </p>
                      {member.emergency_contact && (
                        <Badge variant="destructive" className="text-xs">Emergency Contact</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-xs mt-1 ${getAccessLevelColor(member.access_level)}`}>
                      {member.access_level.replace('-', ' ')} access
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