'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const INDIAN_CITIES = [
  "Kolkata",
  "Delhi",
  "Mumbai",
  "Durgapur",
  "Nabadwip",
  "Chandigarh",
  "Goa",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Ahmedabad",
  "Surat",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Kalyan-Dombivali",
  "Vasai-Virar",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Navi Mumbai",
  "Allahabad",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Guwahati",
  "Hubli-Dharwad",
  "Cochin",
  "Cuttack",
  "Dehradun",
  "Asansol",
  "Rourkela",
  "Nanded",
  "Kolhapur",
  "Ajmer",
  "Akola",
  "Amravati",
  "Bokaro",
  "Bhilai",
  "Bilaspur",
  "Bikaner",
  "Bhubaneswar",
  "Davanagere",
  "Dharwad",
  "Erode",
  "Gulbarga",
  "Kurnool",
  "Latur",
  "Nellore",
  "Pondicherry",
  "Sangli",
  "Siliguri",
  "Tiruchirappalli",
  "Tirupur",
  "Ujjain",
  "Warangal",
];

interface CitySelectorProps {
  currentCity: string;
  onCityChange: (city: string) => void;
}

export function CitySelector({ currentCity, onCityChange }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(currentCity);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
    onCityChange(city);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
      >
        📍 {selectedCity || 'Select City'}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 z-50 mt-2 w-64 max-h-80 overflow-y-auto bg-slate-900/95 backdrop-blur-sm border border-slate-700">
          <div className="p-2">
            <div className="text-xs text-slate-400 mb-2 px-2">Select your city:</div>
            <div className="space-y-1">
              {INDIAN_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    city === selectedCity
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
