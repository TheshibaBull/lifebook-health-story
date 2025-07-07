
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Heart, Shield, Activity, TrendingUp } from 'lucide-react';
import { AddFamilyMemberDialog } from '@/components/AddFamilyMemberDialog';
import { FamilyMemberProfile } from '@/components/FamilyMemberProfile';
import { FamilyHealthAnalytics } from '@/components/FamilyHealthAnalytics';
import { ExerciseRecommendations } from '@/components/ExerciseRecommendations';
import { FamilyMembersService } from '@/services/familyMembersService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { FamilyMember } from '@/lib/supabase';

const FamilyVault = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadFamilyMembers = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const members = await FamilyMembersService.getFamilyMembers(user.id);
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error loading family members:', error);
      toast({
        title: "Error",
        description: "Failed to load family members. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFamilyMembers();
  }, [user?.id]);

  const handleMemberAdded = () => {
    loadFamilyMembers();
    setIsAddDialogOpen(false);
    toast({
      title: "Family Member Added",
      description: "Family member has been successfully added to your vault.",
    });
  };

  const handleMemberUpdated = () => {
    loadFamilyMembers();
    setSelectedMember(null);
    toast({
      title: "Profile Updated",
      description: "Family member profile has been updated successfully.",
    });
  };

  const handleMemberDeleted = () => {
    loadFamilyMembers();
    setSelectedMember(null);
    toast({
      title: "Member Removed",
      description: "Family member has been removed from your vault.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Family Health Vault
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your family's health information and get personalized insights
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Family Member
        </Button>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="exercise" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Exercise Plans
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Emergency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          {familyMembers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Family Members Added</h3>
                <p className="text-gray-600 mb-6">
                  Start building your family health vault by adding family members
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Family Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                    <div className="space-y-2 text-sm">
                      {member.date_of_birth && (
                        <p className="text-gray-600">
                          Age: {new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()}
                        </p>
                      )}
                      {member.blood_group && (
                        <p className="text-gray-600">Blood Group: {member.blood_group}</p>
                      )}
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
                      onClick={() => setSelectedMember(member)}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <FamilyHealthAnalytics />
        </TabsContent>

        <TabsContent value="exercise">
          <ExerciseRecommendations />
        </TabsContent>

        <TabsContent value="emergency">
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
        </TabsContent>
      </Tabs>

      <AddFamilyMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onMemberAdded={handleMemberAdded}
      />

      {selectedMember && (
        <FamilyMemberProfile
          member={selectedMember}
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)}
          onMemberUpdated={handleMemberUpdated}
          onMemberDeleted={handleMemberDeleted}
        />
      )}
    </div>
  );
};

export { FamilyVault };
