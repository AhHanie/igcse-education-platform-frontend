export interface Document {
  id: string;
  organization_id: string | null;
  school_id: string | null;
  subject_id: string | null;
  created_by: string | null;
  uploaded_by: string | null;
  document_type: string | null;
  title: string;
  visibility: "public" | "organization" | "school" | "private" | null;
  status: string | null;
  storage_uri: string | null;
  original_filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  file_sha256: string | null;
  ingestion_report: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
}

export interface DocumentCreate {
  file: File;
  title: string;
  organization_id?: string | null;
  school_id?: string | null;
  subject_id?: string | null;
  document_type?: string | null;
  visibility?: "public" | "organization" | "school" | "private" | null;
  metadata?: string | null;
}

export interface DocumentListResponse {
  items: Document[];
  total: number;
  skip: number;
  limit: number;
}
