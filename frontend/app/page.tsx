'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchForm } from "@/components/search/SearchForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/CitySelector";
import { useAdminStore } from "@/stores/adminStore";
import Link from "next/link";
import { SimpleAppShell } from "@/components/layout/SimpleAppShell";

export default function HomePage() {
  const router = useRouter();
  const { admin, isAdmin, logout } = useAdminStore();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showAdminMenu, setShowAdminMenu] = useState(false);

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
    <SimpleAppShell>
      <main className="mx-auto flex max-w-sm flex-1 flex-col gap-4 px-4 py-6">
        {/* City Selection - Always Visible */}
        <Card className="p-6 bg-slate-900/60 mb-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-brand-foreground mb-2">
              🏙️ Select Your City
            </h2>
            <p className="text-sm text-slate-400">
              Choose your city to find available routes
            </p>
          </div>
          <CitySelector 
            currentCity={selectedCity} 
            onCityChange={handleCityChange}
          />
        </Card>

        <Card className="p-6 bg-slate-900/60">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-semibold text-brand-foreground">
              Local Bus / Shared Auto Finder
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Community-sourced local transport wiki for shared autos and private buses in Indian towns.
            </p>
          </div>

          {/* Show search form only when city is selected */}
          {selectedCity ? (
            <SearchForm
              from={from}
              to={to}
              onChangeFrom={setFrom}
              onChangeTo={setTo}
              onSubmit={handleSubmit}
              showSubmitButton
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-lg">
                📍 Please select a city above to search for routes
              </p>
            </div>
          )}
        </Card>

        {/* Admin Menu */}
        <div className="relative">
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              ⚙️ More Options
            </Button>
          </div>
          
          {showAdminMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
              <div className="p-2 space-y-1">
                <Link href="/add-route">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-green-400 hover:bg-green-500/10"
                  >
                    ➕ Add Route
                  </Button>
                </Link>
                {isAdmin() ? (
                  <>
                    <Link href="/admin/routes">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-purple-400 hover:bg-purple-500/10"
                      >
                        🛠️ Admin Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={logout}
                      className="w-full justify-start text-red-400 hover:bg-red-500/10"
                    >
                      🚪 Logout Admin
                    </Button>
                  </>
                ) : (
                  <Link href="/admin/login">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-purple-400 hover:bg-purple-500/10"
                    >
                      🔐 Admin Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* View All Routes Button - Only when city is selected */}
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
      </main>
    </SimpleAppShell>
  );
}
