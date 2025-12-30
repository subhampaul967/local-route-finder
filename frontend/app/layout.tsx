import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";

// Load AppShell as a client-only component to avoid SSR/client hydration
// mismatches for UI that depends on browser APIs (online status, service
// worker registration, etc.).
const AppShell = dynamic(
  () => import("@/components/layout/AppShell").then((mod) => mod.AppShell),
  {
    ssr: false,
  }
);

export const metadata: Metadata = {
  title: "Local Bus & Shared Auto Finder",
  description:
    "Community-sourced local transport wiki for shared autos and private buses in Indian towns.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
