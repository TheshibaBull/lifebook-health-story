
import { Users } from 'lucide-react';

interface FamilyVaultHeaderProps {}

const FamilyVaultHeader = ({}: FamilyVaultHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="w-8 h-8 text-blue-500" />
        Family Health Vault
      </h1>
      <p className="text-gray-600 mt-1">
        Manage your family's health information and get personalized insights
      </p>
    </div>
  );
};

export { FamilyVaultHeader };
