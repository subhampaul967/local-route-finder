import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
