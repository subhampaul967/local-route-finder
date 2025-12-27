export interface FareCandidate {
  routeId: string;
  minFare: number;
  maxFare: number;
}

export interface FareAnomalyResult {
  isAnomalous: boolean;
  reasons: string[];
}

// Placeholder for fare anomaly detection.
// A real implementation could compare against historical fares for the same
// route and nearby routes, flagging unusually low or high values.
export const detectFareAnomaly = async (
  candidate: FareCandidate
): Promise<FareAnomalyResult> => {
  const reasons: string[] = [];

  if (candidate.minFare > candidate.maxFare) {
    reasons.push("minFare is greater than maxFare.");
  }

  if (candidate.maxFare > 200) {
    reasons.push("Max fare is unusually high for a short-town route.");
  }

  return {
    isAnomalous: reasons.length > 0,
    reasons,
  };
};
