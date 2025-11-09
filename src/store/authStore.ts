import { create } from 'zustand';
import type { Admin } from '../types';

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: Admin, token: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: null,
  isAuthenticated: false,

  setAuth: (admin, token) => {
    localStorage.setItem('admin', JSON.stringify(admin));
    localStorage.setItem('auth_token', token);
    set({ admin, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('auth_token');
    set({ admin: null, token: null, isAuthenticated: false });
  },

  initAuth: () => {
    const storedAdmin = localStorage.getItem('admin');
    const storedToken = localStorage.getItem('auth_token');

    if (storedAdmin && storedToken) {
      try {
        const admin = JSON.parse(storedAdmin);
        set({ admin, token: storedToken, isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem('admin');
        localStorage.removeItem('auth_token');
      }
    }
  },
}));
