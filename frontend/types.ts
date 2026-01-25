export interface LocationDTO {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
}

export interface FareDTO {
  id: string;
  routeId: string;
  minFare: number;
  maxFare: number;
  notes?: string | null;
}

export interface RouteViaPointDTO {
  name: string;
  lat: number;
  lng: number;
}

export interface RouteDTO {
  id: string;
  fromLocation: LocationDTO;
  toLocation: LocationDTO;
  vehicleType: VehicleType;
  autoColor?: string | null;
  via: RouteViaPointDTO[];
  status: RouteStatus;
  fares: FareDTO[];
}

export type VehicleType = "AUTO" | "BUS" | "SHARED_AUTO";
export type RouteStatus = "PENDING" | "APPROVED" | "REJECTED";
