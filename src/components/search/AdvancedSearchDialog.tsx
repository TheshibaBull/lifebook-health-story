
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import type { SearchFilters } from '@/services/searchService';
import type { DateRange } from 'react-day-picker';

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string, filters: SearchFilters) => void;
}

const categories = [
  'Lab Results',
  'Prescriptions', 
  'Imaging',
  'Visit Notes',
  'Vaccinations',
  'Procedures',
  'Insurance'
];

const tags = [
  'Routine',
  'Urgent',
  'Follow-up',
  'Blood Work',
  'Medication',
  'Hypertension',
  'Diabetes',
  'Cholesterol'
];

export const AdvancedSearchDialog = ({ open, onOpenChange, onSearch }: AdvancedSearchDialogProps) => {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    }
  };

  const handleSearch = () => {
    const filters: SearchFilters = {
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      dateRange: dateRange?.from && dateRange?.to ? {
        from: dateRange.from,
        to: dateRange.to
      } : undefined
    };

    onSearch(query, filters);
    onOpenChange(false);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setDateRange(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Terms</Label>
            <Input
              id="search-query"
              placeholder="Enter keywords to search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <Label>Categories</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`category-${category}`} 
                    className="text-sm font-normal"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="grid grid-cols-2 gap-3">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={(checked) => 
                      handleTagChange(tag, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`tag-${tag}`} 
                    className="text-sm font-normal"
                  >
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
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
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
