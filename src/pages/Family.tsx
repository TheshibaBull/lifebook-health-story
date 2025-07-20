
import { MobileAppLayout } from '@/components/MobileAppLayout';
import { FamilyVault } from '@/components/FamilyVault';
import { BackToDashboard } from '@/components/BackToDashboard';
import { useIsMobile } from '@/hooks/use-mobile';

const FamilyPage = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileAppLayout title="Family" showTabBar={true}>
        <div className="px-4 py-4">
          <FamilyVault />
        </div>
      </MobileAppLayout>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <BackToDashboard />
        <FamilyVault />
      </div>
    </div>
  );
};

export default FamilyPage;
