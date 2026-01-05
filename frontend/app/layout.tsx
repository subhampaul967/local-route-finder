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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
