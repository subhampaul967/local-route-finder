'use client';

import { useEffect, useState } from 'react';
import { getAllAdminRoutes, deleteRoute } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface Route {
  id: string;
  fromLocation: { name: string };
  toLocation: { name: string };
  vehicleType: string;
  autoColor?: string;
  status: string;
  fares: Array<{ minFare: number; maxFare: number; notes?: string }>;
  createdAt: string;
}

export default function AdminRoutesPage() {
  const { user } = useAuthStore();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await getAllAdminRoutes();
        setRoutes(response.data.routes);
      } catch (err) {
        console.error('Error fetching admin routes:', err);
        setError('Failed to load routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleDelete = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(routeId);
      console.log('Deleting route:', routeId);
      const response = await deleteRoute(routeId);
      console.log('Delete response:', response);
      setRoutes(routes.filter(route => route.id !== routeId));
      console.log('Route deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete route. Check console for details.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
        <Card className="p-8 text-center bg-slate-900/60">
          <div className="text-red-400">Access denied. Admin privileges required.</div>
          <Link href="/" className="text-blue-400 hover:underline mt-4 inline-block">
            ← Back to Home
          </Link>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
        <div className="text-center">
          <div className="text-lg">Loading all routes...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
        <div className="text-center">
          <div className="text-red-400">{error}</div>
          <Link href="/admin" className="text-blue-400 hover:underline">
            ← Back to Admin
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-foreground">
            All Routes Management
          </h1>
          <p className="text-sm text-slate-400">
            {routes.length} total routes
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
              ← Admin Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
              Home
            </Button>
          </Link>
        </div>
      </div>

      {routes.length === 0 ? (
        <Card className="p-8 text-center bg-slate-900/60">
          <div className="text-lg text-slate-300">No routes found</div>
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
                    <span className={`px-2 py-1 rounded text-xs ${
                      route.status === 'APPROVED' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {route.status}
                    </span>
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
                  <p className="text-xs text-slate-500 mt-2">
                    Created: {new Date(route.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/results?from=${encodeURIComponent(route.fromLocation.name)}&to=${encodeURIComponent(route.toLocation.name)}`}>
                    <Button variant="outline" size="sm" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(route.id)}
                    disabled={deleteLoading === route.id}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    {deleteLoading === route.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
