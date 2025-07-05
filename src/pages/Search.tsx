
import { AppLayout } from '@/components/AppLayout';
import { MobileCard } from '@/components/MobileCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Users, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SearchPage = () => {
  const isMobile = useIsMobile();

  const searchContent = isMobile ? (
    <div className="px-4 py-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          placeholder="Search health records, symptoms, doctors..." 
          className="pl-10"
        />
      </div>

      {/* Quick Search Categories */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="justify-start">
          <FileText className="w-4 h-4 mr-2" />
          Records
        </Button>
        <Button variant="outline" className="justify-start">
          <Users className="w-4 h-4 mr-2" />
          Doctors
        </Button>
        <Button variant="outline" className="justify-start">
          <Calendar className="w-4 h-4 mr-2" />
          Appointments
        </Button>
        <Button variant="outline" className="justify-start">
          <Search className="w-4 h-4 mr-2" />
          Symptoms
        </Button>
      </div>

      {/* Recent Searches */}
      <MobileCard title="Recent Searches" subtitle="Your latest search queries" icon={<Search className="w-6 h-6" />}>
        <div className="space-y-2">
          <div className="p-2 rounded-lg bg-gray-50">
            <p className="text-sm">Blood pressure readings</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50">
            <p className="text-sm">Dr. Smith reports</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50">
            <p className="text-sm">Vaccination records</p>
          </div>
        </div>
      </MobileCard>

      {/* Search Tips */}
      <MobileCard title="Search Tips" subtitle="Get better results" icon={<Search className="w-6 h-6" />}>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Use specific terms like "blood test" or "X-ray"</p>
          <p>• Search by doctor name or medical facility</p>
          <p>• Try date ranges like "2024" or "last month"</p>
          <p>• Search symptoms or conditions</p>
        </div>
      </MobileCard>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search Health Records</h1>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search health records, symptoms, doctors..." 
            className="pl-12 h-12"
          />
        </div>
        <p className="text-gray-600">Search functionality coming soon...</p>
      </div>
    </div>
  );

  return (
    <AppLayout title="Search" showTabBar={true}>
      {searchContent}
    </AppLayout>
  );
};

export default SearchPage;
