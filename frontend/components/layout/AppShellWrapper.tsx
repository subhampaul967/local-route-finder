'use client';

import dynamic from 'next/dynamic';

const AppShell = dynamic(
  () => import("@/components/layout/AppShell").then((mod) => mod.AppShell),
  {
    ssr: false,
  }
);

export default function AppShellWrapper({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
