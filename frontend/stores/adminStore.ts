import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  phone: string;
  role: string;
}

interface AdminStore {
  admin: AdminUser | null;
  token: string | null;
  isAdmin: () => boolean;
  setAdmin: (admin: AdminUser | null, token: string | null) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      
      isAdmin: () => {
        const { admin } = get();
        return admin?.role === 'ADMIN';
      },
      
      setAdmin: (admin, token) => set({ admin, token }),
      
      logout: () => {
        set({ admin: null, token: null });
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({ admin: state.admin, token: state.token }),
    }
  )
);
