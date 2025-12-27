"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRouteCandidate = void 0;
// Placeholder for route validation.
// In a real implementation this could call an ML service or heuristic engine
// to flag obviously incorrect or spammy submissions.
const validateRouteCandidate = async (candidate) => {
    const reasons = [];
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
exports.validateRouteCandidate = validateRouteCandidate;
