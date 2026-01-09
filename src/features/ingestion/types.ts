export interface IngestionStartResponse {
  document_id: string;
  status: string;
  job_id: string;
  message: string;
}

export interface IngestionStatusResponse {
  document_id: string;
  status: string;
  job_id: string | null;
  ingestion_report: Record<string, any> | null;
}

export interface IngestionDeleteResponse {
  document_id: string;
  status: string;
  message: string;
}
