import { apiCall } from "./axios-client";
import { AuthTokens, LoginPayload, RegisterPayload, UserProfile, RoleResponse, AssignRolePayload, OrganizationResponse, CreateRolePayload } from "./types";

export function listOrganizations(): Promise<OrganizationResponse[]> {
  return apiCall<OrganizationResponse[]>({
    url: "/api/v1/organizations",
    method: "GET",
  });
}

export function registerUser(payload: RegisterPayload): Promise<AuthTokens> {

  return apiCall<AuthTokens>({
    url: "/api/v1/auth/register",
    method: "POST",
    data: payload,
  });
}

export function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  return apiCall<AuthTokens>({
    url: "/api/v1/auth/login",
    method: "POST",
    data: payload,
  });
}

export function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return apiCall<AuthTokens>({
    url: "/api/v1/auth/refresh",
    method: "POST",
    data: { refresh_token: refreshToken },
  });
}

export function verifyToken(token: string): Promise<{ valid: boolean; user_id: string; email: string; roles: string[]; is_internal?: boolean }> {
  return apiCall<{ valid: boolean; user_id: string; email: string; roles: string[]; is_internal?: boolean }>({
    url: "/api/v1/auth/verify",
    method: "POST",
    data: { token },
  });
}

export function listUsers(): Promise<UserProfile[]> {
  return apiCall<UserProfile[]>({
    url: "/api/v1/users",
    method: "GET",
  });
}

export function listRoles(): Promise<RoleResponse[]> {
  return apiCall<RoleResponse[]>({
    url: "/api/v1/auth/roles",
    method: "GET",
  });
}

export function assignRole(payload: AssignRolePayload): Promise<{ success: boolean; message: string }> {
  return apiCall<{ success: boolean; message: string }>({
    url: "/api/v1/auth/roles/assign",
    method: "POST",
    data: payload,
  });
}

export function createRole(payload: CreateRolePayload): Promise<RoleResponse> {
  return apiCall<RoleResponse>({
    url: "/api/v1/auth/roles",
    method: "POST",
    data: payload,
  });
}

export function verifyInternalRole(): Promise<{ has_internal_role: boolean }> {
  return apiCall<{ has_internal_role: boolean }>({
    url: "/api/v1/auth/roles/verify-internal",
    method: "GET",
  });
}
