
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FamilyMemberCard } from './FamilyMemberCard';
import { EmptyFamilyState } from './EmptyFamilyState';
import { useIsMobile } from '@/hooks/use-mobile';
import type { FamilyMember } from '@/lib/supabase';

interface FamilyMembersListProps {
  familyMembers: FamilyMember[];
  onViewProfile: (member: FamilyMember) => void;
  onAddMember: () => void;
}

const FamilyMembersList = ({ 
  familyMembers, 
  onViewProfile, 
  onAddMember 
}: FamilyMembersListProps) => {
  const isMobile = useIsMobile();

  if (familyMembers.length === 0) {
    return <EmptyFamilyState onAddMember={onAddMember} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyMembers.map((member) => (
          <FamilyMemberCard
            key={member.id}
            member={member}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>
      
      {isMobile && (
        <div className="pt-4">
          <Button onClick={onAddMember} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Family Member
          </Button>
        </div>
      )}
    </div>
  );
};

export { FamilyMembersList };
