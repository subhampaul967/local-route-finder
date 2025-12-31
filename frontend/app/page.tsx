'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchForm } from "@/components/search/SearchForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/CitySelector";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Load selected city from localStorage on mount
  useEffect(() => {
    const city = localStorage.getItem('selectedCity') || "";
    setSelectedCity(city);
  }, []);

  // Also check localStorage on every render (in case it's set after login)
  useEffect(() => {
    const city = localStorage.getItem('selectedCity') || "";
    if (city !== selectedCity) {
      setSelectedCity(city);
    }
  });

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  // Simple client-side validation before navigating to results page.
  const handleSubmit = () => {
    if (!from.trim() || !to.trim()) {
      alert("Please fill both From and To locations.");
      return;
    }

    const params = new URLSearchParams({ from, to });
    router.push(`/results?${params.toString()}`);
  };

  const handleViewAllRoutes = () => {
    if (!selectedCity) {
      alert("Please select a city first to view all routes.");
      return;
    }
    router.push(`/city-routes?city=${encodeURIComponent(selectedCity)}`);
  };

  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-brand-foreground">
        Local Bus / Shared Auto Finder
      </h1>
      
      {selectedCity && (
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
            📍 {selectedCity}
          </span>
        </div>
      )}
      
      <p className="text-center text-sm text-slate-300">
        Search routes like <span className="font-semibold">"Railway Station to College"</span>
        {" "}
        to see shared autos and local buses contributed by the community.
      </p>

      <Card className="mt-2 bg-slate-900/60 p-4 shadow-card">
        <SearchForm
          from={from}
          to={to}
          onChangeFrom={setFrom}
          onChangeTo={setTo}
          onSubmit={handleSubmit}
          showSubmitButton
        />
      </Card>

      {selectedCity && (
        <div className="text-center">
          <CitySelector 
            currentCity={selectedCity} 
            onCityChange={handleCityChange}
          />
        </div>
      )}

      {selectedCity && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleViewAllRoutes}
            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
          >
            🚌 View All Routes in {selectedCity}
          </Button>
        </div>
      )}

      {/* Admin routes button */}
      {user?.role === 'ADMIN' && (
        <div className="text-center">
          <Link href="/admin/routes">
            <Button 
              variant="outline" 
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              ⚙️ Manage All Routes (Admin)
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
