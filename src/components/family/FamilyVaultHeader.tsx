
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FamilyVaultHeaderProps {
  onAddMember: () => void;
}

const FamilyVaultHeader = ({ onAddMember }: FamilyVaultHeaderProps) => {
  return (
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
      <Button onClick={onAddMember}>
        <Plus className="w-4 h-4 mr-2" />
        Add Family Member
      </Button>
    </div>
  );
};

export { FamilyVaultHeader };
