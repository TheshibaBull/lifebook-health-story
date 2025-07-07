
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

interface EmptyFamilyStateProps {
  onAddMember: () => void;
}

const EmptyFamilyState = ({ onAddMember }: EmptyFamilyStateProps) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Family Members Added</h3>
        <p className="text-gray-600 mb-6">
          Start building your family health vault by adding family members
        </p>
        <Button onClick={onAddMember}>
          <Plus className="w-4 h-4 mr-2" />
          Add First Family Member
        </Button>
      </CardContent>
    </Card>
  );
};

export { EmptyFamilyState };
