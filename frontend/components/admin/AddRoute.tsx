'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitRoute, setAuthToken } from '@/lib/api';
import { LocationSearch } from './LocationSearch';
import { AddLocationModal } from './AddLocationModal';

interface Location {
  id: string;
  name: string;
  type: string;
  lat?: number;
  lng?: number;
}

interface AddRouteProps {
  onRouteAdded: () => void;
}

export function AddRoute({ onRouteAdded }: AddRouteProps) {
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [vehicleType, setVehicleType] = useState('AUTO');
  const [autoColor, setAutoColor] = useState('');
  const [minFare, setMinFare] = useState('');
  const [maxFare, setMaxFare] = useState('');
  const [fareNotes, setFareNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState<'from' | 'to' | null>(null);

  const handleAddLocation = (type: 'from' | 'to') => {
    const locationName = type === 'from' 
      ? (document.querySelector('input[placeholder*="starting"]') as HTMLInputElement)?.value
      : (document.querySelector('input[placeholder*="destination"]') as HTMLInputElement)?.value;
    
    if (!locationName?.trim()) {
      alert('Please enter a location name first');
      return;
    }
    
    setShowAddLocation(type);
  };

  const handleLocationCreated = (newLocation: Location) => {
    if (showAddLocation === 'from') {
      setFromLocation(newLocation);
    } else if (showAddLocation === 'to') {
      setToLocation(newLocation);
    }
    setShowAddLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromLocation || !toLocation) {
      alert('Please select both From and To locations.');
      return;
    }

    if (!minFare || !maxFare) {
      alert('Please fill in both minimum and maximum fare.');
      return;
    }

    try {
      setLoading(true);
      
      // Set authentication token if available (for admin users)
      const adminToken = localStorage.getItem('admin_token');
      const userToken = localStorage.getItem('auth_token');
      const token = adminToken || userToken;
      
      if (token) {
        setAuthToken(token);
        console.log('Authentication token set for route submission');
      } else {
        console.log('No authentication token found, submitting as public user');
      }
      
      const routeData = {
        fromName: fromLocation.name,
        toName: toLocation.name,
        vehicleType,
        autoColor: vehicleType === 'AUTO' ? autoColor : undefined,
        minFare: parseFloat(minFare),
        maxFare: parseFloat(maxFare),
        notes: fareNotes.trim() || undefined,
      };

      console.log('Submitting route data:', routeData);
      const response = await submitRoute(routeData);
      console.log('Route added successfully:', response.data);
      
      // Reset form
      setFromLocation(null);
      setToLocation(null);
      setVehicleType('AUTO');
      setAutoColor('');
      setMinFare('');
      setMaxFare('');
      setFareNotes('');
      
      alert('Route submitted successfully! It will be reviewed by admin.');
      onRouteAdded();
    } catch (err: any) {
      console.error('Add route error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      alert(`Failed to submit route: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-6 bg-slate-900/60">
        <h3 className="text-lg font-semibold text-brand-foreground mb-4">
          ➕ Add New Route
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <LocationSearch
                label="From Location"
                placeholder="Enter starting location"
                value={fromLocation?.name || ''}
                onChange={setFromLocation}
                onAddLocation={() => handleAddLocation('from')}
              />
            </div>
            
            <div>
              <LocationSearch
                label="To Location"
                placeholder="Enter destination location"
                value={toLocation?.name || ''}
                onChange={setToLocation}
                onAddLocation={() => handleAddLocation('to')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="AUTO">🛺 Auto</option>
                <option value="BUS">🚌 Bus</option>
              </select>
            </div>
            
            {vehicleType === 'AUTO' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Auto Color
                </label>
                <Input
                  type="text"
                  value={autoColor}
                  onChange={(e) => setAutoColor(e.target.value)}
                  placeholder="e.g., Yellow, White, Blue"
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Minimum Fare (₹)
              </label>
              <Input
                type="number"
                value={minFare}
                onChange={(e) => setMinFare(e.target.value)}
                placeholder="e.g., 20"
                min="0"
                step="0.01"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Maximum Fare (₹)
              </label>
              <Input
                type="number"
                value={maxFare}
                onChange={(e) => setMaxFare(e.target.value)}
                placeholder="e.g., 50"
                min="0"
                step="0.01"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fare Notes (Optional)
            </label>
            <Textarea
              value={fareNotes}
              onChange={(e) => setFareNotes(e.target.value)}
              placeholder="Add notes about this route's fare..."
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              {loading ? 'Adding Route...' : '➕ Add Route'}
            </Button>
            
            <Button
              type="button"
              onClick={() => {
                setFromLocation(null);
                setToLocation(null);
                setVehicleType('AUTO');
                setAutoColor('');
                setMinFare('');
                setMaxFare('');
                setFareNotes('');
              }}
              variant="outline"
              className="border-gray-500 text-gray-400 hover:bg-gray-500/10"
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>

      <AddLocationModal
        isOpen={showAddLocation !== null}
        onClose={() => setShowAddLocation(null)}
        onLocationCreated={handleLocationCreated}
        initialName={showAddLocation === 'from' 
          ? (document.querySelector('input[placeholder*="starting"]') as HTMLInputElement)?.value || ''
          : (document.querySelector('input[placeholder*="destination"]') as HTMLInputElement)?.value || ''
        }
      />
    </>
  );
}
