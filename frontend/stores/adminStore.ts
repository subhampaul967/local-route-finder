import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Admin {
  id: string;
  username: string;
  email?: string;
}

interface AdminStore {
  admin: Admin | null;
  token: string | null;
  login: (admin: Admin, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  setAdmin: (admin: Admin, token: string) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      login: (admin, token) => set({ admin, token }),
      logout: () => set({ admin: null, token: null }),
      isAdmin: () => get().admin !== null,
      setAdmin: (admin, token) => set({ admin, token }),
    }),
    {
      name: 'admin-storage',
    }
  )
);
