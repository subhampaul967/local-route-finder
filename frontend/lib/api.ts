import axios from "axios";

const baseURL = "https://local-route-finder-3.onrender.com";

export const api = axios.create({
  baseURL,
});

// Attach/remove JWT token for authenticated calls.
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const loginRequest = (phone: string, otp?: string) => {
  return api.post("/auth/login", { phone, otp });
};

export const searchRoutes = (from: string, to: string) => {
  return api.get("/routes", { params: { from, to } });
};

export interface SubmitRoutePayload {
  fromLocationId?: string;
  toLocationId?: string;
  fromName?: string;
  toName?: string;
  vehicleType: string;
  autoColor?: string;
  via?: Array<{ name: string; lat?: number; lng?: number }>;
  minFare?: number;
  maxFare?: number;
  notes?: string;
}

export const submitRoute = (payload: SubmitRoutePayload) => {
  return api.post("/routes", payload);
};

export const fetchPendingRoutes = () => {
  return api.get("/routes/pending");
};

export const approveRoute = (id: string) => {
  return api.patch(`/routes/${id}/approve`);
};

export const rejectRoute = (id: string) => {
  return api.patch(`/routes/${id}/reject`);
};

export const upsertFare = (data: {
  id?: string;
  routeId: string;
  minFare: number;
  maxFare: number;
  notes?: string;
}) => {
  return api.post("/fares", data);
};
