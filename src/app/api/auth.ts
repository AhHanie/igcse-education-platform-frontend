import { apiClient } from "./client";

export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
  permissions: unknown[]; // adjust type later
}

export interface LoginResponse {
  id: string;
  organization_id: string;
  school_id: string;
  username: string;
  email: string | null;
  display_name: string;
  gender: number | null;
  is_active: boolean;
  must_reset: boolean;
  profile: unknown | null; // adjust type later
  last_active_at: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

// Login endpoint that authenticates the user.
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login", credentials, {

  });
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

//Check if the user is authenticated by verifying the session.
// export async function verifySession(): Promise<{
//   authenticated: boolean;
//   user?: LoginResponse;
// }> {
//   return apiClient.get<{
//     authenticated: boolean;
//     user?: LoginResponse;
//   }>("/auth/verify");
// }
