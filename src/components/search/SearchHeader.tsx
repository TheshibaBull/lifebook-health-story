
interface SearchHeaderProps {
  isMobile?: boolean;
}

const SearchHeader = ({ isMobile = false }: SearchHeaderProps) => {
  if (isMobile) {
    return null; // Mobile uses MobileAppLayout title
  }

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Health Records</h1>
      <p className="text-lg text-gray-600">Find your medical documents, appointments, and health information</p>
    </div>
  );
};

export { SearchHeader };
