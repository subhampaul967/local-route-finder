'use client';

import { useEffect, useState } from "react";
import type { RouteDTO } from "@local/shared";
import { useAuthStore } from "@/stores/authStore";
import { fetchPendingRoutes, approveRoute, rejectRoute, upsertFare } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FareEditorProps {
  route: RouteDTO;
  onSaved: () => void;
}

const FareEditor: React.FC<FareEditorProps> = ({ route, onSaved }) => {
  const first = route.fares[0];
  const [minFare, setMinFare] = useState(first?.minFare?.toString() ?? "");
  const [maxFare, setMaxFare] = useState(first?.maxFare?.toString() ?? "");
  const [notes, setNotes] = useState(first?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const min = parseInt(minFare || "0", 10);
    const max = parseInt(maxFare || "0", 10);
    if (!min || !max) {
      alert("Please provide both minimum and maximum fare.");
      return;
    }
    if (min > max) {
      alert("Minimum fare cannot be greater than maximum fare.");
      return;
    }

    setSaving(true);
    try {
      await upsertFare({
        id: first?.id,
        routeId: route.id,
        minFare: min,
        maxFare: max,
        notes: notes || undefined,
      });
      onSaved();
    } catch (err) {
      console.error(err);
      alert("Failed to save fare.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 space-y-1 text-xs">
      <p className="font-semibold text-slate-200">Fare</p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          min={0}
          value={minFare}
          onChange={(e) => setMinFare(e.target.value)}
          placeholder="Min ₹"
        />
        <Input
          type="number"
          min={0}
          value={maxFare}
          onChange={(e) => setMaxFare(e.target.value)}
          placeholder="Max ₹"
        />
      </div>
      <Textarea
        rows={2}
        className="mt-1"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button
        size="sm"
        className="mt-1"
        variant="outline"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving…" : "Save fare"}
      </Button>
    </div>
  );
};

export default function AdminPage() {
  const { user } = useAuthStore();
  const [routes, setRoutes] = useState<RouteDTO[] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPending = async () => {
    setLoading(true);
    try {
      const response = await fetchPendingRoutes();
      const data = response.data as { routes: RouteDTO[] };
      setRoutes(data.routes);
    } catch (err) {
      console.error(err);
      alert("Failed to load pending routes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  if (!user) {
    return (
      <main className="mx-auto flex max-w-xl flex-1 flex-col gap-4 px-4 py-6">
        <h1 className="text-xl font-semibold text-brand-foreground">Admin</h1>
        <p className="text-sm text-slate-300">
          Please login as an admin user to access this page.
        </p>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="mx-auto flex max-w-xl flex-1 flex-col gap-4 px-4 py-6">
        <h1 className="text-xl font-semibold text-brand-foreground">Admin</h1>
        <p className="text-sm text-slate-300">
          Your account does not have admin privileges.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-foreground">Admin Dashboard</h1>
        <Button size="sm" variant="outline" onClick={loadPending} disabled={loading}>
          Refresh
        </Button>
      </div>

      <p className="text-xs text-slate-300">
        Review community-submitted routes. Approve, reject, and update fares.
      </p>

      <div className="mt-2 flex flex-col gap-3 pb-6">
        {routes?.map((route) => (
          <Card key={route.id} className="space-y-2 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {route.vehicleType.replace(/_/g, " ")}
                </p>
                <p className="font-semibold text-slate-50">
                  {route.fromLocation.name} → {route.toLocation.name}
                </p>
                {route.autoColor && (
                  <p className="text-[11px] text-slate-400">
                    Auto color: {route.autoColor}
                  </p>
                )}
                {route.via && route.via.length > 0 && (
                  <p className="text-[11px] text-slate-500">
                    Via {route.via.map((v) => v.name).join(" → ")}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-slate-300">
                <Button
                  size="sm"
                  className="w-24 bg-emerald-600 text-xs hover:bg-emerald-700"
                  onClick={async () => {
                    try {
                      await approveRoute(route.id);
                      await loadPending();
                    } catch (err) {
                      console.error(err);
                      alert("Failed to approve route.");
                    }
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  className="w-24 bg-rose-700 text-xs hover:bg-rose-800"
                  onClick={async () => {
                    try {
                      await rejectRoute(route.id);
                      await loadPending();
                    } catch (err) {
                      console.error(err);
                      alert("Failed to reject route.");
                    }
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>

            <FareEditor
              route={route}
              onSaved={async () => {
                await loadPending();
              }}
            />
          </Card>
        ))}

        {routes && routes.length === 0 && (
          <p className="text-xs text-slate-400">No pending routes at the moment.</p>
        )}
      </div>
    </main>
  );
}
