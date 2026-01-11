import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  SortAsc, 
  SortDesc,
  Calendar,
  Star,
  Users,
  Globe,
  Code,
  Lightbulb,
  Heart,
  TrendingUp
} from 'lucide-react';
import Fuse from 'fuse.js';

interface SearchFilters {
  query: string;
  sdgs: number[];
  categories: string[];
  dateRange: {
    start: string;
    end: string;
  };
  rating: {
    min: number;
    max: number;
  };
  sortBy: 'relevance' | 'date' | 'rating' | 'views' | 'trending';
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  rating: number;
  views: number;
  createdAt: string;
  sdgs: Array<{ id: number; name: string; color: string }>;
  team: {
    name: string;
    members: number;
  };
  tags: string[];
}

const AdvancedSearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sdgs: [],
    categories: [],
    dateRange: { start: '', end: '' },
    rating: { min: 0, max: 5 },
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Mock data
  const mockResults: SearchResult[] = [
    {
      id: 1,
      title: 'Smart Water Management System',
      description: 'AI-powered water conservation system for urban areas',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
      rating: 4.8,
      views: 1234,
      createdAt: '2024-01-15',
      sdgs: [
        { id: 6, name: 'Clean Water', color: '#26BDE2' },
        { id: 11, name: 'Sustainable Cities', color: '#F99D33' }
      ],
      team: { name: 'AquaTech', members: 4 },
      tags: ['AI', 'IoT', 'Sustainability', 'Water']
    },
    {
      id: 2,
      title: 'Renewable Energy Tracker',
      description: 'Real-time monitoring of renewable energy sources',
      thumbnailUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400',
      rating: 4.6,
      views: 987,
      createdAt: '2024-01-10',
      sdgs: [
        { id: 7, name: 'Clean Energy', color: '#FCC30B' },
        { id: 13, name: 'Climate Action', color: '#4C9F38' }
      ],
      team: { name: 'GreenTech', members: 3 },
      tags: ['Energy', 'Monitoring', 'Climate', 'Data']
    }
  ];

  const sdgOptions = [
    { id: 1, name: 'No Poverty', color: '#E5243B' },
    { id: 2, name: 'Zero Hunger', color: '#DDA63A' },
    { id: 3, name: 'Good Health', color: '#4C9F38' },
    { id: 4, name: 'Quality Education', color: '#C5192D' },
    { id: 5, name: 'Gender Equality', color: '#FF3A21' },
    { id: 6, name: 'Clean Water', color: '#26BDE2' },
    { id: 7, name: 'Clean Energy', color: '#FCC30B' },
    { id: 8, name: 'Good Jobs', color: '#A21942' },
    { id: 9, name: 'Innovation', color: '#FD6925' },
    { id: 10, name: 'Reduced Inequalities', color: '#DD1367' },
    { id: 11, name: 'Sustainable Cities', color: '#F99D33' },
    { id: 12, name: 'Responsible Consumption', color: '#BF8B2E' },
    { id: 13, name: 'Climate Action', color: '#3F7E44' },
    { id: 14, name: 'Life Below Water', color: '#0A97D9' },
    { id: 15, name: 'Life on Land', color: '#56C02B' },
    { id: 16, name: 'Peace & Justice', color: '#00689D' },
    { id: 17, name: 'Partnerships', color: '#19486A' },
  ];

  const categoryOptions = [
    'Technology', 'Environment', 'Health', 'Education', 'Social Impact',
    'Innovation', 'Sustainability', 'Community', 'Research', 'Development'
  ];

  const fuse = new Fuse(mockResults, {
    keys: ['title', 'description', 'tags'],
    threshold: 0.3,
  });

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredResults = [...mockResults];
      
      // Apply text search
      if (filters.query) {
        const searchResults = fuse.search(filters.query);
        filteredResults = searchResults.map(result => result.item);
      }
      
      // Apply SDG filter
      if (filters.sdgs.length > 0) {
        filteredResults = filteredResults.filter(result =>
          result.sdgs.some(sdg => filters.sdgs.includes(sdg.id))
        );
      }
      
      // Apply rating filter
      filteredResults = filteredResults.filter(result =>
        result.rating >= filters.rating.min && result.rating <= filters.rating.max
      );
      
      // Apply sorting
      filteredResults.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'views':
            comparison = a.views - b.views;
            break;
          case 'trending':
            comparison = (a.views / 100) + a.rating - (b.views / 100) - b.rating;
            break;
          default:
            return 0;
        }
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
      
      setResults(filteredResults);
      setLoading(false);
    };

    performSearch();
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSDG = (sdgId: number) => {
    setFilters(prev => ({
      ...prev,
      sdgs: prev.sdgs.includes(sdgId)
        ? prev.sdgs.filter(id => id !== sdgId)
        : [...prev.sdgs, sdgId]
    }));
  };

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      sdgs: [],
      categories: [],
      dateRange: { start: '', end: '' },
      rating: { min: 0, max: 5 },
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, teams, or technologies..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* SDG Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Sustainable Development Goals
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sdgOptions.map((sdg) => (
                    <label key={sdg.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.sdgs.includes(sdg.id)}
                        onChange={() => toggleSDG(sdg.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: sdg.color }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {sdg.id}. {sdg.name}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Categories
                </label>
                <div className="space-y-2">
                  {categoryOptions.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating & Sort */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={filters.rating.min}
                      onChange={(e) => handleFilterChange('rating', { ...filters.rating, min: parseFloat(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {filters.rating.min} - {filters.rating.max}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date</option>
                    <option value="rating">Rating</option>
                    <option value="views">Views</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    <span className="text-sm">{filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {loading ? 'Searching...' : `${results.length} results found`}
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={result.thumbnailUrl}
                  alt={result.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {result.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {result.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{result.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{result.team.members}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.sdgs.slice(0, 2).map((sdg) => (
                      <span
                        key={sdg.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: sdg.color }}
                      >
                        {sdg.name}
                      </span>
                    ))}
                    {result.sdgs.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        +{result.sdgs.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{result.views} views</span>
                    <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
