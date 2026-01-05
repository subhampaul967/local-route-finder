'use client';

import { useEffect, useState } from "react";
import { useAdminStore } from "@/stores/adminStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const SimpleAppShell = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { admin, logout } = useAdminStore();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register a very small service worker for PWA/offline support.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("SW registration failed", err));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-3 py-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-brand-foreground">
            🚌 Local Route Finder
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {admin ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="px-2 text-[11px] text-slate-300"
              >
                Admin Logout
              </Button>
            ) : null}
          </nav>
        </div>
      </header>

      {!online && (
        <div className="bg-amber-950/70 py-1 text-center text-[11px] text-amber-100">
          You appear to be offline. Showing cached data where available.
        </div>
      )}

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
};
