import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local Bus & Shared Auto Finder",
  description:
    "Community-sourced local transport wiki for shared autos and private buses in Indian towns.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a', color: '#f1f5f9' }}>
        {children}
      </body>
    </html>
  );
}
