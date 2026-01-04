'use client';

import { useState, useEffect, useRef } from 'react';
import { debounce } from '@/lib/utils';
import { Website } from '@/lib/types';

interface EnhancedSearchBarProps {
  onSearch: (query: string) => void;
  websites: Website[];
  placeholder?: string;
}

export default function EnhancedSearchBar({ 
  onSearch, 
  websites, 
  placeholder = 'Search by name, description, or category...' 
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Website[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate search suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = websites
      .filter(website => 
        website.name.toLowerCase().includes(query.toLowerCase()) ||
        website.description.toLowerCase().includes(query.toLowerCase()) ||
        website.category.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [query, websites]);

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce((searchQuery: string) => {
      onSearch(searchQuery);
    }, 300);
    
    debouncedSearch(query);
  }, [query, onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedWebsite = suggestions[selectedIndex];
          setQuery(selectedWebsite.name);
          setShowSuggestions(false);
          onSearch(selectedWebsite.name);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (website: Website) => {
    setQuery(website.name);
    setShowSuggestions(false);
    onSearch(website.name);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch('');
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        {/* Search Icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (query.length >= 2) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay hiding suggestions to allow clicking on them
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={placeholder}
          className="w-full border border-gray-300 bg-white py-2.5 sm:py-3 pl-10 sm:pl-11 pr-10 text-sm placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ borderRadius: '50px' }}
          aria-label="Search websites by name or description"
          autoComplete="off"
        />
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
          {suggestions.map((website, index) => (
            <button
              key={website.id}
              onClick={() => handleSuggestionClick(website)}
              className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{website.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {website.description}
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {website.category}
                </div>
              </div>
            </button>
          ))}
          
          {/* Search tip */}
          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
            💡 Press Enter to search or use arrow keys to navigate
          </div>
        </div>
      )}

      {/* Search Tips - Only show when focused and no query */}
      {isFocused && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 hidden sm:block z-40">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">Try: &quot;SaaS&quot;</span>
            <span className="bg-gray-100 px-2 py-1 rounded">&quot;Portfolio&quot;</span>
            <span className="bg-gray-100 px-2 py-1 rounded">&quot;E-commerce&quot;</span>
            <span className="bg-gray-100 px-2 py-1 rounded">&quot;Creative&quot;</span>
          </div>
        </div>
      )}
    </div>
  );
}
