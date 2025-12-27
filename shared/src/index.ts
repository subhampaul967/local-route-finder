// Shared TypeScript contracts used by both frontend and backend.
// Import these using `import type` only so they are erased at runtime.

export type UserRole = "USER" | "ADMIN";

export type LocationType = "LANDMARK" | "BUS_STOP" | "AREA" | "OTHER";

export type VehicleType = "SHARED_AUTO" | "BUS" | "MINI_BUS" | "E_RICKSHAW" | "OTHER";

export type RouteStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LocationDTO {
  id: string;
  name: string;
  type: LocationType;
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
  via?: RouteViaPointDTO[] | null;
  status: RouteStatus;
  fares: FareDTO[];
}

export interface UserDTO {
  id: string;
  name?: string | null;
  phone: string;
  role: UserRole;
}
