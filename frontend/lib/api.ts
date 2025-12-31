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
  return api.post("/api/auth/login", { phone, otp });
};

export const searchRoutes = (from: string, to: string) => {
  return api.get("/api/routes/search", { params: { from, to } });
};

export const getCityRoutes = (city: string) => {
  return api.get("/api/routes/city", { params: { city } });
};

export const getAllAdminRoutes = () => {
  return api.get("/api/routes/admin/all");
};

export const deleteRoute = (id: string) => {
  return api.delete(`/api/routes/${id}`);
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
  return api.post("/api/routes", payload);
};

export const fetchPendingRoutes = () => {
  return api.get("/api/routes/pending");
};

export const approveRoute = (id: string) => {
  return api.patch(`/api/routes/${id}/approve`);
};

export const rejectRoute = (id: string) => {
  return api.patch(`/api/routes/${id}/reject`);
};

export const upsertFare = (data: {
  id?: string;
  routeId: string;
  minFare: number;
  maxFare: number;
  notes?: string;
}) => {
  return api.post("/api/fares", data);
};
