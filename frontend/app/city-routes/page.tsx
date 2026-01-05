'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCityRoutes } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CitySelector } from '@/components/CitySelector';
import GoogleRouteMap from "@/components/map/GoogleRouteMap";
import type { RouteDTO } from "@local/shared";

interface Route {
  id: string;
  fromLocation: { name: string };
  toLocation: { name: string };
  vehicleType: string;
  autoColor?: string;
  fares: Array<{ minFare: number; maxFare: number; notes?: string }>;
}

function CityRoutesContent() {
  const searchParams = useSearchParams();
  const city = searchParams?.get('city') || 'Kolkata';
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentCity, setCurrentCity] = useState(city);
  const [showMap, setShowMap] = useState(false);

  const handleCityChange = (newCity: string) => {
    setCurrentCity(newCity);
    // Navigate to the new city routes
    window.location.href = `/city-routes?city=${encodeURIComponent(newCity)}`;
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        console.log('Fetching routes for city:', city);
        const response = await getCityRoutes(city);
        console.log('City routes response:', response.data);
        setRoutes(response.data.routes);
        console.log('Routes with coordinates:', response.data.routes.map((r: any) => ({
          id: r.id,
          from: r.fromLocation.name,
          fromLat: r.fromLocation.lat,
          fromLng: r.fromLocation.lng,
          to: r.toLocation.name,
          toLat: r.toLocation.lat,
          toLng: r.toLocation.lng,
        })));
      } catch (err) {
        console.error('Error fetching city routes:', err);
        setError('Failed to load routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [city]);

  if (loading) {
    return (
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
        <div className="text-center">
          <div className="text-lg">Loading routes for {city}...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
        <div className="text-center">
          <div className="text-red-400">{error}</div>
          <Link href="/" className="text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-brand-foreground">
              All Routes in {city}
            </h1>
            <p className="text-sm text-slate-400">
              {routes.length} routes found
            </p>
          </div>
          <CitySelector 
            currentCity={currentCity} 
            onCityChange={handleCityChange}
          />
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
              ← Back to Home
            </Button>
          </Link>
          {routes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap((v) => !v)}
              className="border-green-500 text-green-400 hover:bg-green-500/10"
            >
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          )}
        </div>
      </div>

      {showMap && routes.length > 0 && (
        <div className="mt-4">
          <GoogleRouteMap routes={routes as RouteDTO[]} />
        </div>
      )}

      {routes.length === 0 ? (
        <Card className="p-8 text-center bg-slate-900/60">
          <div className="text-lg text-slate-300">No routes found for {city}</div>
          <p className="text-sm text-slate-400 mt-2">
            Be the first to add a route for this city!
          </p>
          <Link href="/add-route">
            <Button className="mt-4">
              Add Route
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <Card key={route.id} className="p-4 bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-lg font-medium text-brand-foreground">
                    <span>{route.fromLocation.name}</span>
                    <span className="text-slate-400">→</span>
                    <span>{route.toLocation.name}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span className="capitalize">
                      {route.vehicleType === 'AUTO' ? '🛺 Auto' : '🚌 Bus'}
                    </span>
                    {route.autoColor && (
                      <span>Color: {route.autoColor}</span>
                    )}
                    {route.fares.length > 0 && (
                      <span>
                        ₹{route.fares[0].minFare} - ₹{route.fares[0].maxFare}
                      </span>
                    )}
                  </div>
                  {route.fares[0]?.notes && (
                    <p className="text-xs text-slate-500 mt-1">
                      {route.fares[0].notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/results?from=${encodeURIComponent(route.fromLocation.name)}&to=${encodeURIComponent(route.toLocation.name)}`}>
                    <Button variant="outline" size="sm" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

export default function CityRoutesPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </main>
    }>
      <CityRoutesContent />
    </Suspense>
  );
}
