import { apiClient } from "./client";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Permission {
  id: string;
  key: string;
  description: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  permissions: Permission[];
}

export interface School {
  id: string;
  organization_id: string;
  name: string;
  short_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  school_id: string | null;
  school: School | null;
  username: string | null;
  email: string | null;
  display_name: string | null;
  gender: number | null;
  is_active: boolean;
  must_reset: boolean;
  profile: Record<string, unknown> | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string | null;
  roles: Role[];
}

// Alias for backward compatibility
export type LoginResponse = UserProfile;

// Login endpoint
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login-username", credentials);
}

export interface VerifyRegistrationRequest {
  username: string;
  code: string;
}

export interface VerifyRegistrationResponse {
  message?: string;
}

export async function verifyRegistration(
  data: VerifyRegistrationRequest
): Promise<VerifyRegistrationResponse> {
  return apiClient.post<VerifyRegistrationResponse>(
    "/auth/verify-registration",
    data
  );
}

export interface CompleteRegistrationRequest {
  username: string;
  code: string;
  password: string;
  confirm_password: string;
}

export async function completeRegistration(
  data: CompleteRegistrationRequest
): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/complete-registration", data);
}

// Get current authenticated user's profile
export async function getCurrentUser(): Promise<UserProfile> {
  return apiClient.get<UserProfile>("/auth/me");
}

// Logout current user
export async function logout(): Promise<void> {
  return apiClient.post<void>("/auth/logout", {});
}
