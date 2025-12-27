"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectFareAnomaly = void 0;
// Placeholder for fare anomaly detection.
// A real implementation could compare against historical fares for the same
// route and nearby routes, flagging unusually low or high values.
const detectFareAnomaly = async (candidate) => {
    const reasons = [];
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
exports.detectFareAnomaly = detectFareAnomaly;
