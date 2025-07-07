
import { useState, useEffect } from 'react';
import { SearchService, type SearchResult, type SearchFilters } from '@/services/searchService';
import { SearchHeader } from '@/components/search/SearchHeader';
import { SearchBar } from '@/components/search/SearchBar';
import { QuickActions } from '@/components/search/QuickActions';
import { AdvancedSearchDialog } from '@/components/search/AdvancedSearchDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/AppLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FileText, Calendar, Tag, Filter, Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      loadSuggestions();
    }
  }, [searchQuery]);

  const loadInitialData = async () => {
    const popular = await SearchService.getPopularSearches();
    setPopularSearches(popular);
  };

  const loadSuggestions = async () => {
    const newSuggestions = await SearchService.getSearchSuggestions(searchQuery);
    setSuggestions(newSuggestions);
  };

  const handleSearch = async (query: string = searchQuery, filters: SearchFilters = activeFilters) => {
    if (!query.trim() && Object.keys(filters).length === 0) return;

    setIsSearching(true);
    try {
      const results = await SearchService.searchHealthRecords(query, filters);
      setSearchResults(results);
      setActiveFilters(filters);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdvancedSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    handleSearch(query, filters);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setActiveFilters({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <AppLayout title="Search Health Records">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <SearchHeader />

        <div className="max-w-3xl mx-auto space-y-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => handleSearch()}
            suggestions={suggestions}
            onSuggestionClick={(suggestion) => {
              setSearchQuery(suggestion);
              handleSearch(suggestion);
            }}
          />

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(true)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Advanced Search
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearSearch}
                className="text-red-600 hover:text-red-700"
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {activeFilters.categories?.map((category) => (
                    <Badge key={category} variant="secondary">
                      Category: {category}
                    </Badge>
                  ))}
                  {activeFilters.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      Tag: {tag}
                    </Badge>
                  ))}
                  {activeFilters.dateRange && (
                    <Badge variant="secondary">
                      Date: {format(activeFilters.dateRange.from, 'MMM dd')} - {format(activeFilters.dateRange.to, 'MMM dd')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {isSearching ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Searching..." />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Search Results ({searchResults.length})
              </h2>
              
              {searchResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <h3 className="font-semibold text-lg">{result.title}</h3>
                          <Badge variant="outline">{result.category}</Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {result.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {result.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(result.date), 'MMM dd, yyyy')}
                            </div>
                          )}
                          
                          {result.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {result.tags.slice(0, 2).join(', ')}
                              {result.tags.length > 2 && ` +${result.tags.length - 2} more`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <div className="text-xs text-gray-500 mb-1">
                          Relevance: {Math.round(result.relevanceScore * 100)}%
                        </div>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchQuery || hasActiveFilters ? (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <QuickActions onActionClick={(action) => console.log('Quick action:', action)} />
              
              {/* Popular Searches */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(search);
                          handleSearch(search);
                        }}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <AdvancedSearchDialog
          open={showAdvancedSearch}
          onOpenChange={setShowAdvancedSearch}
          onSearch={handleAdvancedSearch}
        />
      </div>
    </AppLayout>
  );
};

export default Search;
