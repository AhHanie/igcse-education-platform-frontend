import { apiClient } from "@/app/api/client";
import type { Document, DocumentCreate, DocumentListResponse } from "../types";

export const documentApi = {
  /**
   * List documents with pagination and optional filtering
   */
  list: async (params: {
    skip?: number;
    limit?: number;
    organization_id?: string | null;
    school_id?: string | null;
    subject_id?: string | null;
    document_type?: string | null;
    status?: string | null;
    visibility?: string | null;
  }): Promise<DocumentListResponse> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.set("skip", String(params.skip));
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));
    if (params.organization_id)
      searchParams.set("organization_id", params.organization_id);
    if (params.school_id) searchParams.set("school_id", params.school_id);
    if (params.subject_id) searchParams.set("subject_id", params.subject_id);
    if (params.document_type)
      searchParams.set("document_type", params.document_type);
    if (params.status) searchParams.set("status", params.status);
    if (params.visibility) searchParams.set("visibility", params.visibility);

    const query = searchParams.toString();
    const url = `/documents${query ? `?${query}` : ""}`;

    return apiClient.get<DocumentListResponse>(url);
  },

  /**
   * Create a new document with file upload (multipart/form-data)
   */
  create: async (data: DocumentCreate): Promise<Document> => {
    const formData = new FormData();

    // Required fields
    formData.append("file", data.file);
    formData.append("title", data.title);

    // Optional fields
    if (data.organization_id !== undefined) {
      if (data.organization_id === null) {
        formData.append("organization_id", "");
      } else {
        formData.append("organization_id", data.organization_id);
      }
    }

    if (data.school_id !== undefined) {
      if (data.school_id === null) {
        formData.append("school_id", "");
      } else {
        formData.append("school_id", data.school_id);
      }
    }

    if (data.subject_id !== undefined) {
      if (data.subject_id === null) {
        formData.append("subject_id", "");
      } else {
        formData.append("subject_id", data.subject_id);
      }
    }

    if (data.document_type !== undefined) {
      if (data.document_type === null) {
        formData.append("document_type", "");
      } else {
        formData.append("document_type", data.document_type);
      }
    }

    if (data.visibility) {
      formData.append("visibility", data.visibility);
    }

    if (data.metadata) {
      formData.append("metadata", data.metadata);
    }

    // Use fetch directly for multipart/form-data
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const response = await fetch(`${baseUrl}/documents`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to create document";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorMessage;
      } catch {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Delete a document by ID
   */
  delete: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },
};
