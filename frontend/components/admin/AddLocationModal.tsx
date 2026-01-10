'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Location {
  id: string;
  name: string;
  type: string;
  lat?: number;
  lng?: number;
}

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationCreated: (location: Location) => void;
  initialName: string;
}

export function AddLocationModal({ isOpen, onClose, onLocationCreated, initialName }: AddLocationModalProps) {
  const [locationName, setLocationName] = useState(initialName);
  const [locationType, setLocationType] = useState('LANDMARK');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationName.trim()) {
      alert('Please enter a location name.');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: locationName.trim(),
          type: locationType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create location');
      }

      const newLocation = await response.json();
      onLocationCreated(newLocation);
      setLocationName('');
      onClose();
      alert('Location created successfully!');
    } catch (err: any) {
      console.error('Add location error:', err);
      alert(`Failed to create location: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 bg-slate-900/95">
        <h3 className="text-lg font-semibold text-white mb-4">
          ➕ Add New Location
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location Name
            </label>
            <Input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Railway Station, Government College"
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location Type
            </label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
            >
              <option value="LANDMARK">🏛️ Landmark</option>
              <option value="BUS_STOP">🚏 Bus Stop</option>
              <option value="MARKET">🏪 Market</option>
              <option value="HOSPITAL">🏥 Hospital</option>
              <option value="SCHOOL">🏫 School</option>
              <option value="COLLEGE">🎓 College</option>
              <option value="STATION">🚉 Station</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              {loading ? 'Creating...' : '➕ Create Location'}
            </Button>
            
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-gray-500 text-gray-400 hover:bg-gray-500/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
