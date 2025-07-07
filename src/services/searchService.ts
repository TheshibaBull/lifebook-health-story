
export interface SearchResult {
  id: string;
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  relevanceScore: number;
  date?: string;
  type: 'health_record' | 'family_member' | 'appointment';
}

export interface SearchFilters {
  categories?: string[];
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  providers?: string[];
}

export class SearchService {
  static async searchHealthRecords(
    query: string, 
    filters?: SearchFilters,
    userId?: string
  ): Promise<SearchResult[]> {
    console.log('Searching health records:', { query, filters });
    
    // This would integrate with the health records service
    // For now, return mock results that demonstrate the functionality
    
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Blood Test Results - January 2024',
        category: 'Lab Results',
        tags: ['Blood Work', 'Routine'],
        excerpt: 'Complete blood count and basic metabolic panel showing normal ranges for hemoglobin (14.2 g/dL), glucose (95 mg/dL)...',
        relevanceScore: 0.95,
        date: '2024-01-15',
        type: 'health_record'
      },
      {
        id: '2',
        title: 'Prescription - Lisinopril',
        category: 'Prescriptions',
        tags: ['Medication', 'Hypertension'],
        excerpt: 'Prescription for Lisinopril 10mg tablets, quantity 30, take once daily for blood pressure management...',
        relevanceScore: 0.87,
        date: '2024-01-20',
        type: 'health_record'
      },
      {
        id: '3',
        title: 'Chest X-Ray Report',
        category: 'Imaging',
        tags: ['X-Ray', 'Routine'],
        excerpt: 'Normal chest radiograph showing clear lungs bilaterally with no evidence of consolidation or abnormalities...',
        relevanceScore: 0.82,
        date: '2024-01-10',
        type: 'health_record'
      }
    ];
    
    // Filter results based on query
    let filteredResults = mockResults;
    
    if (query) {
      const queryLower = query.toLowerCase();
      filteredResults = filteredResults.filter(result => 
        result.title.toLowerCase().includes(queryLower) ||
        result.excerpt.toLowerCase().includes(queryLower) ||
        result.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        result.category.toLowerCase().includes(queryLower)
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        filteredResults = filteredResults.filter(result =>
          filters.categories!.includes(result.category)
        );
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filteredResults = filteredResults.filter(result =>
          result.tags.some(tag => filters.tags!.includes(tag))
        );
      }
      
      if (filters.dateRange) {
        filteredResults = filteredResults.filter(result => {
          if (!result.date) return false;
          const resultDate = new Date(result.date);
          return resultDate >= filters.dateRange!.from && resultDate <= filters.dateRange!.to;
        });
      }
    }
    
    // Sort by relevance score
    return filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  static async getSearchSuggestions(query: string): Promise<string[]> {
    const suggestions = [
      'blood test',
      'prescription',
      'x-ray',
      'blood pressure',
      'cholesterol',
      'diabetes',
      'medication',
      'lab results',
      'imaging',
      'vaccination'
    ];
    
    if (!query) return suggestions.slice(0, 5);
    
    const queryLower = query.toLowerCase();
    return suggestions
      .filter(suggestion => suggestion.includes(queryLower))
      .slice(0, 5);
  }
  
  static async getPopularSearches(): Promise<string[]> {
    return [
      'blood test results',
      'prescription medications',
      'x-ray reports',
      'lab work',
      'vaccination records'
    ];
  }
}
