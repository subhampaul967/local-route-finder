'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchForm } from "@/components/search/SearchForm";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Simple client-side validation before navigating to results page.
  const handleSubmit = () => {
    if (!from.trim() || !to.trim()) {
      alert("Please fill both From and To locations.");
      return;
    }

    const params = new URLSearchParams({ from, to });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-brand-foreground">
        Local Bus / Shared Auto Finder
      </h1>
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
    </main>
  );
}
