import { apiCall } from "./axios-client";
import { AuthTokens, LoginPayload, RegisterPayload } from "./types";

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

export function verifyToken(token: string): Promise<{ valid: boolean; user_id: string; email: string; roles: string[] }> {
  return apiCall<{ valid: boolean; user_id: string; email: string; roles: string[] }>({
    url: "/api/v1/auth/verify",
    method: "POST",
    data: { token },
  });
}
