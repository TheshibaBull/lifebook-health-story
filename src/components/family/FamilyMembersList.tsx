
import { FamilyMemberCard } from './FamilyMemberCard';
import { EmptyFamilyState } from './EmptyFamilyState';
import type { Tables } from '@/integrations/supabase/types';

type FamilyMember = Tables<'family_members'>;

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
  if (familyMembers.length === 0) {
    return <EmptyFamilyState onAddMember={onAddMember} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {familyMembers.map((member) => (
        <FamilyMemberCard
          key={member.id}
          member={member}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
};

export { FamilyMembersList };
