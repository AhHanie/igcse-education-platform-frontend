import { apiClient } from "@/app/api/client";
import type {
  IngestionStartResponse,
  IngestionStatusResponse,
  IngestionDeleteResponse,
} from "../types";

export const ingestionApi = {
  /**
   * Start document ingestion (async via RQ)
   */
  start: async (documentId: string): Promise<IngestionStartResponse> => {
    return apiClient.post<IngestionStartResponse>(`/ingestions/${documentId}`);
  },

  /**
   * Get ingestion status for a document
   */
  getStatus: async (documentId: string): Promise<IngestionStatusResponse> => {
    return apiClient.get<IngestionStatusResponse>(`/ingestions/${documentId}`);
  },

  /**
   * Delete ingestion data (vectors) and reset document status
   */
  delete: async (documentId: string): Promise<IngestionDeleteResponse> => {
    return apiClient.delete<IngestionDeleteResponse>(
      `/ingestions/${documentId}`
    );
  },
};
