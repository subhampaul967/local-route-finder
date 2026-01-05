'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRoute } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const VEHICLE_OPTIONS = [
  { value: "SHARED_AUTO", label: "Shared Auto" },
  { value: "BUS", label: "Bus" },
  { value: "MINI_BUS", label: "Mini Bus" },
  { value: "E_RICKSHAW", label: "E-Rickshaw" },
  { value: "OTHER", label: "Other" },
];

export default function AddRoutePage() {
  const router = useRouter();

  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [vehicleType, setVehicleType] = useState("SHARED_AUTO");
  const [autoColor, setAutoColor] = useState("");
  const [viaText, setViaText] = useState("");
  const [minFare, setMinFare] = useState("");
  const [maxFare, setMaxFare] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Authentication removed - anyone can submit routes now

    if (!fromName.trim() || !toName.trim()) {
      alert("From and To locations are required.");
      return;
    }

    const min = minFare ? parseInt(minFare, 10) : undefined;
    const max = maxFare ? parseInt(maxFare, 10) : undefined;

    if ((min && !max) || (!min && max)) {
      alert("Please provide both minimum and maximum fare, or leave both empty.");
      return;
    }

    if (min !== undefined && max !== undefined && min > max) {
      alert("Minimum fare cannot be greater than maximum fare.");
      return;
    }

    const via = viaText
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    setSubmitting(true);
    try {
      await submitRoute({
        fromName,
        toName,
        vehicleType,
        autoColor: autoColor || undefined,
        via: via.length ? via : undefined,
        minFare: min,
        maxFare: max,
        notes: notes || undefined,
      });
      alert("Route submitted for review. Thank you!");
      router.push("/");
    } catch (err: any) {
      console.error(err);
      alert("Could not submit route. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="text-xl font-semibold text-brand-foreground">Add Route</h1>
      <p className="text-xs text-slate-300">
        Add a route you regularly use so newcomers know which shared autos or buses to take.
      </p>

      <Card className="mt-1 space-y-4 bg-slate-900/60 p-4">
        <div className="space-y-1">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            placeholder="e.g. Railway Station"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            placeholder="e.g. Government College"
            value={toName}
            onChange={(e) => setToName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="vehicleType">Vehicle type</Label>
            <Select
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              {VEHICLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="autoColor">Auto color (optional)</Label>
            <Input
              id="autoColor"
              placeholder="e.g. Green, Yellow"
              value={autoColor}
              onChange={(e) => setAutoColor(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="via">Via points (comma separated)</Label>
          <Input
            id="via"
            placeholder="Main Bus Stand, Old Market"
            value={viaText}
            onChange={(e) => setViaText(e.target.value)}
          />
          <p className="text-[10px] text-slate-400">
            These are key points the route passes through. They help with map visualization.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="minFare">Min fare (₹)</Label>
            <Input
              id="minFare"
              type="number"
              min={0}
              value={minFare}
              onChange={(e) => setMinFare(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="maxFare">Max fare (₹)</Label>
            <Input
              id="maxFare"
              type="number"
              min={0}
              value={maxFare}
              onChange={(e) => setMaxFare(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Crowded in evenings, last trip around 9:30 PM, avoid after heavy rains, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit route"}
        </Button>
      </Card>
    </main>
  );
}
