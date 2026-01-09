export interface Subject {
  id: string;
  code: string;
  name: string;
  metadata_?: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
}

export interface SubjectCreate {
  code: string;
  name: string;
  metadata_?: Record<string, any> | null;
}

export interface SubjectListResponse {
  items: Subject[];
  total: number;
}
