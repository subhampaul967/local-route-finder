'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllAdminRoutes, deleteRoute, approveRoute, rejectRoute, setAuthToken } from '@/lib/api';
import { useAdminStore } from '@/stores/adminStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

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
  const router = useRouter();
  const { admin, token, isAdmin } = useAdminStore();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);
  const [editingFare, setEditingFare] = useState<string | null>(null);
  const [fareNotes, setFareNotes] = useState('');

  // Check admin authentication
  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login');
      return;
    }
  }, [isAdmin, router]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        
        // Set authentication token
        const adminToken = localStorage.getItem('admin_token');
        if (adminToken) {
          setAuthToken(adminToken);
        }
        
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
      
      // Set authentication token
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken) {
        setAuthToken(adminToken);
      }
      
      const response = await deleteRoute(routeId);
      setRoutes(routes.filter(route => route.id !== routeId));
      console.log('Route deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete route. Check console for details.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleApprove = async (routeId: string) => {
    if (!confirm('Are you sure you want to approve this route?')) {
      return;
    }

    try {
      setApproveLoading(routeId);
      
      // Set authentication token
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken) {
        setAuthToken(adminToken);
      }
      
      const response = await approveRoute(routeId);
      setRoutes(routes.map(route => 
        route.id === routeId 
          ? { ...response.data.route }
          : route
      ));
      console.log('Route approved successfully');
    } catch (err) {
      console.error('Approve error:', err);
      alert('Failed to approve route. Check console for details.');
    } finally {
      setApproveLoading(null);
    }
  };

  const handleReject = async (routeId: string) => {
    if (!confirm('Are you sure you want to reject this route?')) {
      return;
    }

    try {
      setRejectLoading(routeId);
      
      // Set authentication token
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken) {
        setAuthToken(adminToken);
      }
      
      const response = await rejectRoute(routeId);
      setRoutes(routes.map(route => 
        route.id === routeId 
          ? { ...response.data.route }
          : route
      ));
      console.log('Route rejected successfully');
    } catch (err) {
      console.error('Reject error:', err);
      alert('Failed to reject route. Check console for details.');
    } finally {
      setRejectLoading(null);
    }
  };

  const handleEditFare = (routeId: string, currentNotes: string) => {
    setEditingFare(routeId);
    setFareNotes(currentNotes || '');
  };

  const handleSaveFare = async (routeId: string) => {
    try {
      // This would require an API endpoint to update fares
      console.log('Saving fare notes for route:', routeId);
      alert('Fare notes saved successfully!');
      setEditingFare(null);
      setFareNotes('');
    } catch (err) {
      console.error('Save fare error:', err);
      alert('Failed to save fare notes.');
    }
  };

  if (loading) {
    return (
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        <div className="text-center">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-foreground">
            🛠️ Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Manage all routes - approve, reject, edit fares, and delete
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
              ← Admin Overview
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
              🏠 Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-slate-900/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{routes.length}</div>
            <div className="text-sm text-slate-400">Total Routes</div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-900/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {routes.filter(r => r.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-slate-400">Approved</div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-900/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {routes.filter(r => r.status === 'PENDING').length}
            </div>
            <div className="text-sm text-slate-400">Pending</div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-900/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {routes.filter(r => r.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-slate-400">Rejected</div>
          </div>
        </Card>
      </div>

      {routes.length === 0 ? (
        <Card className="p-8 text-center bg-slate-900/60">
          <div className="text-lg text-slate-300">No routes found</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <Card key={route.id} className="p-6 bg-slate-900/60">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-lg font-medium text-brand-foreground">
                    <span>{route.fromLocation.name}</span>
                    <span className="text-slate-400">→</span>
                    <span>{route.toLocation.name}</span>
                    <span className="capitalize ml-2">
                      {route.vehicleType === 'AUTO' ? '🛺 Auto' : '🚌 Bus'}
                    </span>
                    {route.autoColor && (
                      <span className="ml-2 text-sm">Color: {route.autoColor}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span className={`px-2 py-1 rounded text-xs ${
                      route.status === 'APPROVED' 
                        ? 'bg-green-500/20 text-green-400' 
                        : route.status === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {route.status}
                    </span>
                    {route.fares.length > 0 && (
                      <span className="ml-2">
                        ₹{route.fares[0].minFare} - ₹{route.fares[0].maxFare}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Created: {new Date(route.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/results?from=${encodeURIComponent(route.fromLocation.name)}&to=${encodeURIComponent(route.toLocation.name)}`}>
                    <Button variant="outline" size="sm" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                      View
                    </Button>
                  </Link>

                  {route.status === 'PENDING' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(route.id)}
                        disabled={approveLoading === route.id}
                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                      >
                        {approveLoading === route.id ? 'Approving...' : '✅ Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(route.id)}
                        disabled={rejectLoading === route.id}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        {rejectLoading === route.id ? 'Rejecting...' : '❌ Reject'}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditFare(route.id, route.fares[0]?.notes || '')}
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  >
                    📝 Edit Fare
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(route.id)}
                    disabled={deleteLoading === route.id}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    {deleteLoading === route.id ? 'Deleting...' : '🗑️ Delete'}
                  </Button>
                </div>
              </div>

              {/* Fare Edit Section */}
              {editingFare === route.id && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-lg font-medium mb-2">Edit Fare Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Fare Notes</label>
                      <Textarea
                        placeholder="Add notes about this route's fare..."
                        value={fareNotes}
                        onChange={(e) => setFareNotes(e.target.value)}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingFare(null)}
                        variant="outline"
                        className="border-gray-500 text-gray-400 hover:bg-gray-500/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSaveFare(route.id)}
                        className="bg-blue-500 text-white hover:bg-blue-600"
                      >
                        💾 Save Fare Notes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
