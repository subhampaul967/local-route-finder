'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock } from 'lucide-react';

interface AutocompleteItem {
  id: string;
  name: string;
  location?: string;
  type?: string;
  popular?: boolean;
  description?: string;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: AutocompleteItem) => void;
  placeholder: string;
  items: AutocompleteItem[];
  debounceMs?: number;
  maxSuggestions?: number;
  className?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  items,
  debounceMs = 300,
  maxSuggestions = 8,
  className = ""
}) => {
  const [filteredItems, setFilteredItems] = useState<AutocompleteItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim()) {
        const filtered = items
          .filter(item => 
            item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.location?.toLowerCase().includes(value.toLowerCase())
          )
          .sort((a, b) => {
            // Prioritize popular items
            if (a.popular && !b.popular) return -1;
            if (!a.popular && b.popular) return 1;
            
            // Then prioritize exact matches
            const aExact = a.name.toLowerCase().startsWith(value.toLowerCase());
            const bExact = b.name.toLowerCase().startsWith(value.toLowerCase());
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            
            // Then alphabetically
            return a.name.localeCompare(b.name);
          })
          .slice(0, maxSuggestions);
        
        setFilteredItems(filtered);
        setIsOpen(filtered.length > 0);
        setHighlightedIndex(-1);
      } else {
        setFilteredItems([]);
        setIsOpen(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, items, debounceMs, maxSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleItemClick = (item: AutocompleteItem) => {
    onChange(item.name);
    onSelect(item);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleItemClick(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className="font-semibold text-blue-600">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value.trim() && setIsOpen(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto bg-white border shadow-lg">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                index === highlightedIndex 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {highlightMatch(item.name, value)}
                    </span>
                    {item.popular && (
                      <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  {item.location && (
                    <div className="text-xs text-gray-500 mb-1">
                      📍 {highlightMatch(item.location, value)}
                    </div>
                  )}
                  
                  {item.type && (
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="p-3 text-center text-gray-500 text-sm">
              No matches found
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
