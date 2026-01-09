import { create } from "zustand";
import { persist } from "zustand/middleware";
import { subjectApi } from "../api/subjects";
import type { Subject } from "../types";

interface SubjectsState {
  // Cached subjects data
  subjects: Subject[];
  total: number;
  lastFetched: number | null; // Timestamp of last successful fetch
  isLoading: boolean;
  error: string | null;

  // Cache configuration
  cacheExpiryMs: number; // Default: 5 minutes

  // Actions
  fetchSubjects: (params?: {
    skip?: number;
    limit?: number;
    q?: string;
    code?: string;
    forceRefresh?: boolean;
  }) => Promise<void>;
  isCacheValid: () => boolean;
  clearCache: () => void;
  setCacheExpiry: (ms: number) => void;
}

const DEFAULT_CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export const useSubjectsStore = create<SubjectsState>()(
  persist(
    (set, get) => ({
      // Initial state
      subjects: [],
      total: 0,
      lastFetched: null,
      isLoading: false,
      error: null,
      cacheExpiryMs: DEFAULT_CACHE_EXPIRY_MS,

      // Check if cached data is still valid
      isCacheValid: () => {
        const { lastFetched, cacheExpiryMs } = get();
        if (!lastFetched) return false;
        const now = Date.now();
        return now - lastFetched < cacheExpiryMs;
      },

      // Fetch subjects from API
      fetchSubjects: async (params = {}) => {
        const { forceRefresh = false, ...apiParams } = params;

        // Return cached data if valid and not forcing refresh
        if (!forceRefresh && get().isCacheValid()) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await subjectApi.list(apiParams);
          set({
            subjects: response.items,
            total: response.total,
            lastFetched: Date.now(),
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch subjects";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Clear cached data
      clearCache: () =>
        set({
          subjects: [],
          total: 0,
          lastFetched: null,
          error: null,
        }),

      // Update cache expiry time
      setCacheExpiry: (ms: number) =>
        set({
          cacheExpiryMs: ms,
        }),
    }),
    {
      name: "subjects-storage", // Storage key
      partialize: (state) => ({
        // Persist subjects data and timestamp, but not loading/error state
        subjects: state.subjects,
        total: state.total,
        lastFetched: state.lastFetched,
        cacheExpiryMs: state.cacheExpiryMs,
      }),
    }
  )
);
