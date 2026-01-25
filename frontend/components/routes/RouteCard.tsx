'use client';

import type { RouteDTO } from "../../types";
import { Card } from "@/components/ui/card";

interface Props {
  route: RouteDTO;
}

export const RouteCard: React.FC<Props> = ({ route }) => {
  const fareText = route.fares.length
    ? `₹${route.fares[0].minFare} - ₹${route.fares[0].maxFare}`
    : "--";

  return (
    <Card className="flex flex-col gap-2 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {route.vehicleType.replace(/_/g, " ")}
          </p>
          <p className="font-semibold text-slate-50">
            {route.fromLocation.name} → {route.toLocation.name}
          </p>
        </div>
        <div className="text-right text-xs text-slate-300">
          <p className="font-semibold text-emerald-300">{fareText}</p>
          {route.autoColor && (
            <p className="text-[11px] text-slate-400">Auto color: {route.autoColor}</p>
          )}
        </div>
      </div>

      {route.via && route.via.length > 0 && (
        <p className="text-[11px] text-slate-400">
          Via {route.via.map((v) => v.name).join(" → ")}
        </p>
      )}
    </Card>
  );
};
