
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar as CalendarIcon, 
  Users, 
  TestTube, 
  Pill, 
  Search 
} from 'lucide-react';

interface QuickActionsProps {
  onQuickSearch: (filters: any) => void;
  isMobile?: boolean;
}

const QuickActions = ({ onQuickSearch, isMobile = false }: QuickActionsProps) => {
  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="justify-start" 
          onClick={() => onQuickSearch({ type: 'health_record' })}
        >
          <FileText className="w-4 h-4 mr-2" />
          Records
        </Button>
        <Button 
          variant="outline" 
          className="justify-start" 
          onClick={() => onQuickSearch({ type: 'appointment' })}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Appointments
        </Button>
        <Button 
          variant="outline" 
          className="justify-start" 
          onClick={() => onQuickSearch({ type: 'family_member' })}
        >
          <Users className="w-4 h-4 mr-2" />
          Family
        </Button>
        <Button 
          variant="outline" 
          className="justify-start" 
          onClick={() => onQuickSearch({})}
        >
          <Search className="w-4 h-4 mr-2" />
          Search All
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Quick Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => onQuickSearch({ type: 'health_record' })}
        >
          <FileText className="w-4 h-4 mr-2" />
          All Records
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => onQuickSearch({ type: 'appointment' })}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Appointments
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => onQuickSearch({ category: 'Lab Results' })}
        >
          <TestTube className="w-4 h-4 mr-2" />
          Lab Results
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => onQuickSearch({ category: 'Prescriptions' })}
        >
          <Pill className="w-4 h-4 mr-2" />
          Prescriptions
        </Button>
      </CardContent>
    </Card>
  );
};

export { QuickActions };
