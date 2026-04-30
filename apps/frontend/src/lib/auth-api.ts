type AuthEnvelope<T> = {
  data?: T;
  message?: string;
  error?: string;
  detail?: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function registerUser(payload: {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  designation?: string;
}) {
  return authRequest("/api/v1/auth/register", payload);
}

export async function loginUser(payload: { email: string; password: string }) {
  return authRequest("/api/v1/auth/login", payload);
}

async function authRequest(path: string, payload: object): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => ({}))) as AuthEnvelope<AuthTokens>;

  if (!response.ok || !body.data) {
    throw new Error(getErrorMessage(body) || "Authentication request failed.");
  }

  return body.data;
}

function getErrorMessage(body: AuthEnvelope<unknown>) {
  if (typeof body.detail === "string") return body.detail;
  if (typeof body.error === "string") return body.error;
  if (typeof body.message === "string") return body.message;
  return "";
}
