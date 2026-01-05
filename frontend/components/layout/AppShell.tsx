"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAdminStore } from "@/stores/adminStore";
import { Button } from "@/components/ui/button";

// Application shell with top nav, offline banner, and service worker registration.
export const AppShell = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const online = useOnlineStatus();
  const { admin, logout } = useAdminStore();

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
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <Link href="/" className="text-sm font-semibold text-brand-foreground">
            Local Transport Wiki
          </Link>
          <nav className="flex items-center gap-2 text-xs text-slate-200">
            <Link href="/add-route" className="hover:text-brand-foreground">
              Add Route
            </Link>
            <Link href="/results?from=Railway+Station&to=Government+College" className="hover:text-brand-foreground">
              Sample Search
            </Link>
            <Link href="/admin" className="hover:text-brand-foreground">
              Admin
            </Link>
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
