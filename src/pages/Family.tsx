
import { AppLayout } from '@/components/AppLayout';
import { FamilyVault } from '@/components/FamilyVault';
import { useIsMobile } from '@/hooks/use-mobile';

const FamilyPage = () => {
  const isMobile = useIsMobile();

  return (
    <AppLayout title="Family Health" showTabBar={true}>
      <div className={isMobile ? "px-4 py-4" : "min-h-screen bg-gray-50 p-4"}>
        <div className={isMobile ? "" : "max-w-4xl mx-auto"}>
          <FamilyVault />
        </div>
      </div>
    </AppLayout>
  );
};

export default FamilyPage;
