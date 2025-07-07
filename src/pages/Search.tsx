
import { useState, useEffect } from 'react';
import { MobileAppLayout } from '@/components/MobileAppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  FileText, 
  Users, 
  Calendar as CalendarIcon, 
  Filter,
  Clock,
  Tag,
  User,
  Building,
  Heart,
  TestTube,
  Pill,
  Activity,
  X,
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface SearchResult {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  provider?: string;
  type: 'health_record' | 'appointment' | 'family_member';
  excerpt?: string;
  file_type?: string;
}

interface SearchFilters {
  category: string;
  dateRange: DateRange | undefined;
  provider: string;
  tags: string[];
  type: string;
}

const SearchPage = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    dateRange: undefined,
    provider: '',
    tags: [],
    type: ''
  });
  const [sortBy, setSortBy] = useState<'date' | 'relevance' | 'title'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Sample data for demonstration
  const categories = [
    'Lab Results', 'Prescriptions', 'Imaging', 'Visit Notes', 
    'Vaccinations', 'Procedures', 'Insurance', 'General'
  ];

  const providers = [
    'City General Hospital', 'Dr. Smith Clinic', 'HealthCare Plus',
    'Medical Center', 'Specialist Clinic'
  ];

  const availableTags = [
    'Cardiology', 'Dental', 'Ophthalmology', 'Neurology', 'Diabetes',
    'Hypertension', 'Cholesterol', 'Routine', 'Urgent', 'Follow-up'
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const performSearch = async () => {
    if (!searchQuery.trim() && !hasActiveFilters()) return;

    setIsSearching(true);
    try {
      // Save to recent searches
      if (searchQuery.trim()) {
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recent-searches', JSON.stringify(updated));
      }

      // Simulate search with mock data for now
      // In real implementation, this would query Supabase
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Blood Test Results - Complete Blood Count',
          category: 'Lab Results',
          tags: ['Routine', 'Cardiology'],
          date: '2024-01-15',
          provider: 'City General Hospital',
          type: 'health_record',
          excerpt: 'Hemoglobin: 14.2 g/dL, White Blood Cells: 6,800/μL...',
          file_type: 'PDF'
        },
        {
          id: '2',
          title: 'Prescription - Lisinopril 10mg',
          category: 'Prescriptions',
          tags: ['Hypertension'],
          date: '2024-01-20',
          provider: 'Dr. Smith Clinic',
          type: 'health_record',
          excerpt: 'Take once daily with food. Refills: 2',
          file_type: 'PDF'
        },
        {
          id: '3',
          title: 'Appointment with Dr. Johnson',
          category: 'Appointments',
          tags: ['Follow-up'],
          date: '2024-02-01',
          provider: 'HealthCare Plus',
          type: 'appointment',
          excerpt: 'Cardiology follow-up appointment scheduled'
        }
      ];

      // Apply filters
      let filteredResults = mockResults;
      
      if (searchQuery.trim()) {
        filteredResults = filteredResults.filter(result =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      if (filters.category) {
        filteredResults = filteredResults.filter(result => result.category === filters.category);
      }

      if (filters.type) {
        filteredResults = filteredResults.filter(result => result.type === filters.type);
      }

      if (filters.provider) {
        filteredResults = filteredResults.filter(result => result.provider === filters.provider);
      }

      if (filters.tags.length > 0) {
        filteredResults = filteredResults.filter(result =>
          filters.tags.some(tag => result.tags.includes(tag))
        );
      }

      // Apply sorting
      filteredResults.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'date':
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'relevance':
          default:
            // Simple relevance based on query match
            const aRelevance = searchQuery ? (a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0) : 0;
            const bRelevance = searchQuery ? (b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0) : 0;
            comparison = bRelevance - aRelevance;
            break;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const hasActiveFilters = () => {
    return filters.category || filters.provider || filters.tags.length > 0 || 
           filters.type || filters.dateRange?.from || filters.dateRange?.to;
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      dateRange: undefined,
      provider: '',
      tags: [],
      type: ''
    });
  };

  const removeTag = (tagToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const getResultIcon = (type: string, category?: string) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon className="w-5 h-5 text-blue-500" />;
      case 'family_member':
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        switch (category) {
          case 'Lab Results':
            return <TestTube className="w-5 h-5 text-purple-500" />;
          case 'Prescriptions':
            return <Pill className="w-5 h-5 text-orange-500" />;
          case 'Imaging':
            return <Activity className="w-5 h-5 text-red-500" />;
          default:
            return <FileText className="w-5 h-5 text-gray-500" />;
        }
    }
  };

  if (isMobile) {
    return (
      <MobileAppLayout title="Search" showTabBar={true}>
        <div className="px-4 py-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search health records, symptoms, doctors..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
            />
          </div>

          {/* Quick Search Categories */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start" onClick={() => setFilters(prev => ({ ...prev, type: 'health_record' }))}>
              <FileText className="w-4 h-4 mr-2" />
              Records
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => setFilters(prev => ({ ...prev, type: 'appointment' }))}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Appointments
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => setFilters(prev => ({ ...prev, type: 'family_member' }))}>
              <Users className="w-4 h-4 mr-2" />
              Family
            </Button>
            <Button variant="outline" className="justify-start" onClick={performSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search All
            </Button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        performSearch();
                      }}
                      className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="w-5 h-5" />
                Search Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Use specific terms like "blood test" or "X-ray"</p>
                <p>• Search by doctor name or medical facility</p>
                <p>• Try date ranges like "2024" or "last month"</p>
                <p>• Search symptoms or conditions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileAppLayout>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Health Records</h1>
          <p className="text-lg text-gray-600">Find your medical documents, appointments, and health information</p>
        </div>

        {/* Search Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Search Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input 
                      placeholder="Search health records, symptoms, doctors, medications..." 
                      className="pl-12 h-12 text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                    />
                  </div>
                  <Button 
                    onClick={performSearch} 
                    size="lg" 
                    className="px-8"
                    disabled={isSearching}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {/* Active Filters */}
                {hasActiveFilters() && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    {filters.category && (
                      <Badge variant="secondary" className="gap-1">
                        Category: {filters.category}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, category: '' }))} />
                      </Badge>
                    )}
                    {filters.type && (
                      <Badge variant="secondary" className="gap-1">
                        Type: {filters.type}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, type: '' }))} />
                      </Badge>
                    )}
                    {filters.provider && (
                      <Badge variant="secondary" className="gap-1">
                        Provider: {filters.provider}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, provider: '' }))} />
                      </Badge>
                    )}
                    {filters.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Results */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Search Results ({searchResults.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery || hasActiveFilters() ? 'No results found' : 'Start your search'}
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery || hasActiveFilters() 
                        ? 'Try adjusting your search terms or filters'
                        : 'Enter a search term or use the filters to find your health records'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getResultIcon(result.type, result.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                  {result.title}
                                </h3>
                                {result.excerpt && (
                                  <p className="text-gray-600 text-sm mb-2">{result.excerpt}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                  <Badge variant="outline">{result.category}</Badge>
                                  <span>•</span>
                                  <span>{format(new Date(result.date), 'MMM dd, yyyy')}</span>
                                  {result.provider && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Building className="w-3 h-3" />
                                        {result.provider}
                                      </span>
                                    </>
                                  )}
                                  {result.file_type && (
                                    <>
                                      <span>•</span>
                                      <span>{result.file_type}</span>
                                    </>
                                  )}
                                </div>
                                {result.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {result.tags.map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, type: 'health_record' }));
                    performSearch();
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  All Records
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, type: 'appointment' }));
                    performSearch();
                  }}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Appointments
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: 'Lab Results' }));
                    performSearch();
                  }}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Lab Results
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: 'Prescriptions' }));
                    performSearch();
                  }}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Prescriptions
                </Button>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </span>
                  {hasActiveFilters() && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all-categories' ? '' : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === 'all-types' ? '' : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All types</SelectItem>
                      <SelectItem value="health_record">Health Records</SelectItem>
                      <SelectItem value="appointment">Appointments</SelectItem>
                      <SelectItem value="family_member">Family Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Provider Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Provider</label>
                  <Select value={filters.provider} onValueChange={(value) => setFilters(prev => ({ ...prev, provider: value === 'all-providers' ? '' : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-providers">All providers</SelectItem>
                      {providers.map(provider => (
                        <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
                  <div className="space-y-2">
                    <Select onValueChange={addTag}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add tag filter" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTags.filter(tag => !filters.tags.includes(tag)).map(tag => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filters.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {filters.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange?.from ? (
                            filters.dateRange.to ? (
                              <>
                                {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                                {format(filters.dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(filters.dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={filters.dateRange?.from}
                          selected={filters.dateRange}
                          onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    {filters.dateRange && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFilters(prev => ({ ...prev, dateRange: undefined }))}
                        className="w-full"
                      >
                        Clear dates
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(search);
                          performSearch();
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-100 text-sm transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Tips */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5" />
                  Search Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>Use specific medical terms like "blood pressure" or "cholesterol"</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>Search by doctor name or medical facility</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>Try medication names or procedure types</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>Use filters to narrow down results by category or date</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>Search symptoms or conditions for related records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
