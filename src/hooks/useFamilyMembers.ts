
import { useState, useEffect } from 'react';
import { FamilyMembersService } from '@/services/familyMembersService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { FamilyMember } from '@/lib/supabase';

export const useFamilyMembers = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
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

  const handleMemberAdded = async (memberData: any) => {
    if (!user?.id) return;
    
    try {
      await FamilyMembersService.createFamilyMember({
        ...memberData,
        user_id: user.id
      });
      
      loadFamilyMembers();
      toast({
        title: "Family Member Added",
        description: "Family member has been successfully added to your vault.",
      });
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        title: "Error",
        description: "Failed to add family member. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMemberUpdated = () => {
    loadFamilyMembers();
    toast({
      title: "Profile Updated",
      description: "Family member profile has been updated successfully.",
    });
  };

  const handleMemberDeleted = () => {
    loadFamilyMembers();
    toast({
      title: "Member Removed",
      description: "Family member has been removed from your vault.",
    });
  };

  return {
    familyMembers,
    isLoading,
    handleMemberAdded,
    handleMemberUpdated,
    handleMemberDeleted,
    refreshMembers: loadFamilyMembers
  };
};
