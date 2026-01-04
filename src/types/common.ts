export interface User {
  id: string;
  organization_id: string;
  school_id: string;
  username: string;
  email: string | null;
  display_name: string;
  gender: 0 | 1;
  is_active: boolean;
  must_reset: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string | null;
  student_code: string;
}
