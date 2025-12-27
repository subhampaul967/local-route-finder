"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRouteToDTO = void 0;
const mapLocationToDTO = (location) => ({
    id: location.id,
    name: location.name,
    type: location.type,
    lat: location.lat ?? 0,
    lng: location.lng ?? 0,
});
const mapFareToDTO = (fare) => ({
    id: fare.id,
    routeId: fare.routeId,
    minFare: fare.minFare,
    maxFare: fare.maxFare,
    notes: fare.notes,
});
const mapViaToDTO = (via) => {
    if (!via)
        return [];
    if (!Array.isArray(via))
        return [];
    return via
        .map((v) => {
        if (typeof v !== "object" || v === null)
            return null;
        const anyV = v;
        const name = typeof anyV.name === "string" ? anyV.name : "";
        const lat = typeof anyV.lat === "number" ? anyV.lat : 0;
        const lng = typeof anyV.lng === "number" ? anyV.lng : 0;
        if (!name)
            return null;
        return { name, lat, lng };
    })
        .filter((v) => v !== null);
};
const mapRouteToDTO = (route) => ({
    id: route.id,
    fromLocation: mapLocationToDTO(route.fromLocation),
    toLocation: mapLocationToDTO(route.toLocation),
    vehicleType: route.vehicleType,
    autoColor: route.autoColor,
    via: mapViaToDTO(route.via),
    status: route.status,
    fares: route.fares.map(mapFareToDTO),
});
exports.mapRouteToDTO = mapRouteToDTO;
