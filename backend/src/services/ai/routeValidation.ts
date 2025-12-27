import type { VehicleType } from "@prisma/client";

export interface RouteCandidate {
  fromLocationId: string;
  toLocationId: string;
  vehicleType: VehicleType;
  autoColor?: string | null;
}

export interface RouteValidationResult {
  isSuspicious: boolean;
  reasons: string[];
}

// Placeholder for route validation.
// In a real implementation this could call an ML service or heuristic engine
// to flag obviously incorrect or spammy submissions.
export const validateRouteCandidate = async (
  candidate: RouteCandidate
): Promise<RouteValidationResult> => {
  const reasons: string[] = [];

  if (candidate.fromLocationId === candidate.toLocationId) {
    reasons.push("From and To locations are the same.");
  }

  if (!candidate.autoColor && candidate.vehicleType === "SHARED_AUTO") {
    reasons.push("Shared autos usually have a color code; autoColor is missing.");
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
};
