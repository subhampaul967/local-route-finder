'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Autocomplete } from "@/components/ui/autocomplete";
import { sampleStations, sampleColleges } from "@/lib/demoData";

interface AutocompleteItem {
  id: string;
  name: string;
  location?: string;
  type?: string;
  popular?: boolean;
}

interface Props {
  from: string;
  to: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  onSubmit: () => void;
  showSubmitButton?: boolean;
}

export const SearchForm: React.FC<Props> = ({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  onSubmit,
  showSubmitButton,
}) => {
  // Convert sample data to autocomplete format
  const stationItems: AutocompleteItem[] = sampleStations.map(station => ({
    id: station.name.toLowerCase().replace(/\s+/g, '-'),
    name: station.name,
    location: station.location,
    type: 'Station',
    popular: station.popular
  }));

  const collegeItems: AutocompleteItem[] = sampleColleges.map(college => ({
    id: college.name.toLowerCase().replace(/\s+/g, '-'),
    name: college.name,
    location: college.location,
    type: college.type,
    popular: false
  }));

  const handleStationSelect = (item: AutocompleteItem) => {
    // Additional logic can be added here if needed
    console.log('Selected station:', item);
  };

  const handleCollegeSelect = (item: AutocompleteItem) => {
    // Additional logic can be added here if needed
    console.log('Selected college:', item);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1">
        <Label htmlFor="from-input">From</Label>
        <Autocomplete
          value={from}
          onChange={onChangeFrom}
          onSelect={handleStationSelect}
          placeholder="Railway Station"
          items={stationItems}
          debounceMs={300}
          maxSuggestions={6}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="to-input">To</Label>
        <Autocomplete
          value={to}
          onChange={onChangeTo}
          onSelect={handleCollegeSelect}
          placeholder="Government College"
          items={collegeItems}
          debounceMs={300}
          maxSuggestions={6}
        />
      </div>
      {showSubmitButton && (
        <Button className="mt-1 w-full" onClick={onSubmit}>
          Search routes
        </Button>
      )}
    </div>
  );
};
