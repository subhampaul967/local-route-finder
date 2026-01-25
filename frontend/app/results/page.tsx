'use client';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { RouteDTO } from "@/types";
import { searchRoutes } from "@/lib/api";
import { saveSearchToCache, getCachedSearch } from "@/lib/searchCache";
import { RouteCard } from "@/components/routes/RouteCard";
import { Button } from "@/components/ui/button";

const RouteMap = dynamic(
  () => import("@/components/map/RouteMap").then((m) => m.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="mt-3 h-64 rounded-lg bg-slate-900/60 p-4 text-sm text-slate-300">
        Loading map…
      </div>
    ),
  }
);

function ResultsContent() {
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") ?? "";
  const to = searchParams?.get("to") ?? "";

  const [routes, setRoutes] = useState<RouteDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!from || !to) return;

    const key = `${from.trim().toLowerCase()}::${to.trim().toLowerCase()}`;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchRoutes(from, to);
        const data = response.data as { routes: RouteDTO[] };
        setRoutes(data.routes);
        saveSearchToCache(key, data.routes);
      } catch (err) {
        console.error(err);
        const cached = getCachedSearch(key);
        if (cached) {
          setRoutes(cached.routes);
          setError("Showing cached results because you are offline or the server is unreachable.");
        } else {
          setError("Unable to load routes. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to]);

  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 px-4 py-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-brand-foreground">
          Routes: {from || "?"} → {to || "?"}
        </h1>
        <p className="text-xs text-slate-300">
          Community-sourced shared autos and local buses. Fares are indicative and may vary.
        </p>
      </header>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          {loading && "Loading routes…"}
          {!loading && routes && routes.length === 0 && "No routes found yet. Be the first to add one!"}
          {!loading && routes && routes.length > 0 && `${routes.length} route(s) found.`}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMap((v) => !v)}
          disabled={!routes || routes.length === 0}
        >
          {showMap ? "Hide Map" : "Show Map"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-amber-500/60 bg-amber-950/40 p-2 text-xs text-amber-100">
          {error}
        </div>
      )}

      {showMap && routes && routes.length > 0 && <RouteMap routes={routes} />}

      <section className="mt-2 flex flex-col gap-3 pb-4">
        {routes?.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </section>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 px-4 py-4">
        <div className="text-center text-slate-400">Loading...</div>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}
