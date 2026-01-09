import { apiClient } from "@/app/api/client";
import type { Subject, SubjectCreate, SubjectListResponse } from "../types";

export const subjectApi = {
  /**
   * List subjects with pagination and optional filtering
   */
  list: async (params: {
    skip?: number;
    limit?: number;
    q?: string;
    code?: string;
  }): Promise<SubjectListResponse> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.set("skip", String(params.skip));
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params.q) searchParams.set("q", params.q);
    if (params.code) searchParams.set("code", params.code);

    const query = searchParams.toString();
    const url = `/subjects${query ? `?${query}` : ""}`;

    return apiClient.get<SubjectListResponse>(url);
  },

  /**
   * Create a new subject
   */
  create: async (data: SubjectCreate): Promise<Subject> => {
    return apiClient.post<Subject>("/subjects", data);
  },

  /**
   * Check if a subject code is unique
   */
  checkCodeUniqueness: async (code: string): Promise<boolean> => {
    const response = await apiClient.get<SubjectListResponse>(
      `/subjects?code=${encodeURIComponent(code)}`
    );
    return response.total === 0;
  },
};
