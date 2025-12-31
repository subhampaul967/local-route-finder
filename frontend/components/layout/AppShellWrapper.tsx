'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const AppShell = dynamic(
  () => import("@/components/layout/AppShell").then((mod) => mod.AppShell),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

interface AppShellWrapperProps {
  children: ReactNode;
}

export default function AppShellWrapper({ children }: AppShellWrapperProps) {
  return <AppShell>{children}</AppShell>;
}
