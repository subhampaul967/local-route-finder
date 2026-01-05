'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchForm } from "@/components/search/SearchForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/CitySelector";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { SimpleAppShell } from "@/components/layout/SimpleAppShell";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col gap-4 px-4 py-6">
      <div className="p-6 bg-slate-900/60 rounded-lg">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-semibold text-brand-foreground">
            Local Bus / Shared Auto Finder
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Community-sourced local transport wiki for shared autos and private buses in Indian towns.
          </p>
        </div>
      </div>
    </main>
  );
}
