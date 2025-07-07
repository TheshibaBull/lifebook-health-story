
import { Button } from '@/components/ui/button';
import { FilePlus2 } from 'lucide-react';

interface RecordsHeaderProps {
  onNavigateToUpload: () => void;
}

const RecordsHeader = ({ onNavigateToUpload }: RecordsHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600 mt-2">View and manage your medical documents</p>
        </div>
        <Button onClick={onNavigateToUpload} className="hidden md:flex">
          <FilePlus2 className="mr-2 h-4 w-4" />
          Upload New Record
        </Button>
      </div>
    </div>
  );
};

export { RecordsHeader };
