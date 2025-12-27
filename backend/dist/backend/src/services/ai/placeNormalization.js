"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePlaceName = void 0;
// Placeholder for place name normalization.
// In the future this could call an ML model or external service to map
// user-entered text (with typos, abbreviations) to canonical location names.
const normalizePlaceName = async (raw) => {
    const notes = [];
    const trimmed = raw.trim();
    if (trimmed !== raw) {
        notes.push("Trimmed whitespace");
    }
    // Basic normalization: collapse inner whitespace and convert to title case.
    const collapsed = trimmed.replace(/\s+/g, " ");
    if (collapsed !== trimmed) {
        notes.push("Collapsed multiple spaces");
    }
    const normalized = collapsed
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    return {
        normalized,
        notes,
    };
};
exports.normalizePlaceName = normalizePlaceName;
