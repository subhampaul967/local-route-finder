'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Location {
  id: string;
  name: string;
  type: string;
  lat?: number;
  lng?: number;
}

interface LocationSearchProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (location: Location) => void;
  onTextChange?: (text: string) => void;
}

export function LocationSearch({ label, placeholder, value, onChange, onTextChange }: LocationSearchProps) {
  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.locations || []);
    } catch (err) {
      console.error('Location search error:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchText !== value) {
        searchLocations(searchText);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText, value]);

  const handleSelect = (location: Location) => {
    onChange(location);
    setSearchText(location.name);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setIsOpen(true);
    onTextChange?.(text);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <Input
          type="text"
          value={searchText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
          onFocus={() => setIsOpen(true)}
        />
        
        {loading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 p-2">
            <div className="text-slate-400">Searching...</div>
          </div>
        )}

        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((location, index) => (
              <div
                key={location.id}
                className={`p-3 cursor-pointer hover:bg-slate-700 border-b border-slate-700 last:border-b-0 ${
                  index === 0 ? 'border-t-0' : ''
                }`}
                onClick={() => handleSelect(location)}
              >
                <div className="font-medium text-white">{location.name}</div>
                <div className="text-xs text-slate-400">{location.type}</div>
              </div>
            ))}
          </div>
        )}

        {isOpen && !loading && suggestions.length === 0 && searchText && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 p-2">
            <div className="text-slate-400">No locations found</div>
          </div>
        )}
      </div>
    </div>
  );
}
