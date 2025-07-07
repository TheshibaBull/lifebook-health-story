
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  hasActiveFilters: boolean;
  activeFilters: any;
  onClearFilters: () => void;
  onRemoveFilter: (filterType: string, value?: string) => void;
  isMobile?: boolean;
}

const SearchBar = ({
  searchQuery,
  onSearchChange,
  onSearch,
  isSearching,
  hasActiveFilters,
  activeFilters,
  onClearFilters,
  onRemoveFilter,
  isMobile = false
}: SearchBarProps) => {
  if (isMobile) {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          placeholder="Search health records, symptoms, doctors..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Search health records, symptoms, doctors, medications..." 
              className="pl-12 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>
          <Button 
            onClick={onSearch} 
            size="lg" 
            className="px-8"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {activeFilters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {activeFilters.category}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onRemoveFilter('category')} />
              </Badge>
            )}
            {activeFilters.type && (
              <Badge variant="secondary" className="gap-1">
                Type: {activeFilters.type}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onRemoveFilter('type')} />
              </Badge>
            )}
            {activeFilters.provider && (
              <Badge variant="secondary" className="gap-1">
                Provider: {activeFilters.provider}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onRemoveFilter('provider')} />
              </Badge>
            )}
            {activeFilters.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onRemoveFilter('tags', tag)} />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { SearchBar };
