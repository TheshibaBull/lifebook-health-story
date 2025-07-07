
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Activity, Shield } from 'lucide-react';
import { AddFamilyMemberDialog } from '@/components/AddFamilyMemberDialog';
import { FamilyMemberProfile } from '@/components/FamilyMemberProfile';
import { FamilyHealthAnalytics } from '@/components/FamilyHealthAnalytics';
import { ExerciseRecommendations } from '@/components/ExerciseRecommendations';
import { FamilyMembersService } from '@/services/familyMembersService';
import { FamilyVaultHeader } from '@/components/family/FamilyVaultHeader';
import { FamilyMembersList } from '@/components/family/FamilyMembersList';
import { EmergencyContactsTab } from '@/components/family/EmergencyContactsTab';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import type { Tables } from '@/integrations/supabase/types';

type FamilyMember = Tables<'family_members'>;

const FamilyVault = () => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const {
    familyMembers,
    isLoading,
    handleMemberAdded,
    handleMemberUpdated,
    handleMemberDeleted
  } = useFamilyMembers();

  const handleAddMemberClick = () => {
    setIsAddDialogOpen(true);
  };

  const handleViewProfile = (member: FamilyMember) => {
    setSelectedMember(member);
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
      <FamilyVaultHeader />

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
          <FamilyMembersList
            familyMembers={familyMembers}
            onViewProfile={handleViewProfile}
            onAddMember={handleAddMemberClick}
          />
          <div className="mt-8">
            <AddFamilyMemberDialog
              onAddMember={handleMemberAdded}
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <FamilyHealthAnalytics />
        </TabsContent>

        <TabsContent value="exercise">
          <ExerciseRecommendations />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyContactsTab familyMembers={familyMembers} />
        </TabsContent>
      </Tabs>

      {selectedMember && (
        <FamilyMemberProfile
          member={selectedMember}
          onUpdateMember={async (updatedMember) => {
            await FamilyMembersService.updateFamilyMember(updatedMember.id, updatedMember);
            handleMemberUpdated();
          }}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export { FamilyVault };
