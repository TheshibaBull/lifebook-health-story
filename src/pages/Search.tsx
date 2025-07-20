import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search as SearchIcon, 
  Filter, 
  Calendar,
  FileText,
  User,
  Tag,
  Clock,
  TrendingUp
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { BackToHome } from '@/components/BackToHome';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'Blood test results',
    'Vaccination records',
    'X-ray chest',
    'Prescription medications'
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (!query.trim() || !user) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id)
        .ilike('title', `%${query}%`);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search records. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <AppLayout title="Search Health Records">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <BackToHome />
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Health Records</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find specific health records, documents, and medical information instantly
            </p>
          </div>

          {/* Search Bar */}
          <Card className="border-0 shadow-xl mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    className="pl-12 h-12 text-lg"
                    placeholder="Search for health records, symptoms, medications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={() => handleSearch(searchQuery)}
                  disabled={isSearching}
                  className="h-12 px-6"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
                <Button variant="outline" className="h-12 px-6">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Results */}
            <div className="lg:col-span-2 space-y-6">
              {searchQuery && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Search Results {searchResults.length > 0 && `(${searchResults.length})`}
                  </h2>
                  
                  {searchResults.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-8 text-center">
                        <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                        <p className="text-gray-600">
                          Try adjusting your search terms or check your spelling
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.map((record) => (
                        <Card key={record.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-blue-500" />
                                <div>
                                  <h3 className="font-semibold text-lg">{record.title}</h3>
                                  <p className="text-gray-600">{record.record_type}</p>
                                </div>
                              </div>
                              <Badge variant="secondary">
                                {new Date(record.created_at).toLocaleDateString()}
                              </Badge>
                            </div>
                            {record.description && (
                              <p className="text-gray-700 mb-4">{record.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(record.created_at).toLocaleDateString()}
                              </span>
                              {record.file_url && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  Document attached
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Search Suggestions */}
              {!searchQuery && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Popular Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Blood Test Results',
                        'Vaccination Records',
                        'X-ray Images',
                        'Prescription History',
                        'Lab Reports',
                        'Medical Imaging',
                        'Doctor Visits',
                        'Medication List'
                      ].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          className="justify-start"
                          onClick={() => handleQuickSearch(suggestion)}
                        >
                          <SearchIcon className="w-4 h-4 mr-2" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Searches */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                        onClick={() => handleQuickSearch(search)}
                      >
                        <span className="text-sm text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Search Tips */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-500" />
                    Search Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div>
                      <strong>Use keywords:</strong> Try "blood test", "x-ray", or "medication"
                    </div>
                    <div>
                      <strong>Date ranges:</strong> Search for "January 2024" or "last month"
                    </div>
                    <div>
                      <strong>Doctor names:</strong> Find records by healthcare provider
                    </div>
                    <div>
                      <strong>Symptoms:</strong> Search for "headache", "fever", or other symptoms
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Upload New Record
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Family Records
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;
