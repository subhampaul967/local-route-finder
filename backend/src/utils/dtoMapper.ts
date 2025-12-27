import type { Fare, Location } from "@prisma/client";
import type {
  FareDTO,
  LocationDTO,
  RouteDTO,
  RouteViaPointDTO,
  VehicleType,
  RouteStatus,
} from "@local/shared";

export interface RouteWithRelations {
  id: string;
  fromLocation: Location;
  toLocation: Location;
  fares: Fare[];
  vehicleType: VehicleType;
  autoColor?: string | null;
  via?: unknown;
  status: RouteStatus;
}

const mapLocationToDTO = (location: Location): LocationDTO => ({
  id: location.id,
  name: location.name,
  type: location.type,
  lat: location.lat ?? 0,
  lng: location.lng ?? 0,
});

const mapFareToDTO = (fare: Fare): FareDTO => ({
  id: fare.id,
  routeId: fare.routeId,
  minFare: fare.minFare,
  maxFare: fare.maxFare,
  notes: fare.notes,
});

const mapViaToDTO = (via: unknown): RouteViaPointDTO[] => {
  if (!via) return [];
  if (!Array.isArray(via)) return [];

  return via
    .map((v) => {
      if (typeof v !== "object" || v === null) return null;
      const anyV = v as any;
      const name = typeof anyV.name === "string" ? anyV.name : "";
      const lat = typeof anyV.lat === "number" ? anyV.lat : 0;
      const lng = typeof anyV.lng === "number" ? anyV.lng : 0;
      if (!name) return null;
      return { name, lat, lng };
    })
    .filter((v): v is RouteViaPointDTO => v !== null);
};

export const mapRouteToDTO = (route: RouteWithRelations): RouteDTO => ({
  id: route.id,
  fromLocation: mapLocationToDTO(route.fromLocation),
  toLocation: mapLocationToDTO(route.toLocation),
  vehicleType: route.vehicleType,
  autoColor: route.autoColor,
  via: mapViaToDTO(route.via as unknown),
  status: route.status,
  fares: route.fares.map(mapFareToDTO),
});
