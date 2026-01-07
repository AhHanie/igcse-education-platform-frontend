import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentUser, logout as apiLogout } from "@app/api/auth";
import type { UserProfile } from "@app/api/auth";

interface AppState {
  // User authentication state
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
  fetchCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,

      // Set user and update authentication state
      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
          isLoading: false,
        }),

      // Clear user state (logout)
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Fetch current user from backend
      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const user = await getCurrentUser();
          get().setUser(user);
        } catch (error) {
          // If fetching fails (e.g., not authenticated), clear user state
          get().clearUser();
          throw error;
        }
      },

      // Logout user
      logout: async () => {
        set({ isLoading: true });
        try {
          await apiLogout();
          get().clearUser();
        } catch (error) {
          // Even if API call fails, clear local state
          get().clearUser();
          throw error;
        }
      },
    }),
    {
      name: "app-storage", // Storage key
      partialize: (state) => ({
        // Only persist user data, not loading state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
