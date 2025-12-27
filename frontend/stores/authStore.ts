"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDTO } from "@local/shared";
import { setAuthToken } from "@/lib/api";

interface AuthState {
  user: UserDTO | null;
  token: string | null;
  setAuth: (user: UserDTO, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        setAuthToken(token);
        set({ user, token });
      },
      logout: () => {
        setAuthToken(null);
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-store-v1",
      // Only persist serializable fields
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthToken(state.token);
        }
      },
    }
  )
);
