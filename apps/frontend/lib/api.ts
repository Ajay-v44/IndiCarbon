/**
 * Typed API client for IndiCarbon backend
 * All calls go through the API Gateway at /api/v1
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(err?.error?.message ?? "API error");
  }
  return res.json();
}

// ─── Compliance ────────────────────────────────────────────────────────────────

export const complianceApi = {
  calculateEmission: (payload: unknown, token: string) =>
    request("/compliance/ghg/calculate", { method: "POST", body: JSON.stringify(payload), token }),

  getGhgSummary: (orgId: string, year: number, token: string) =>
    request(`/compliance/ghg/summary/${orgId}/${year}`, { token }),

  getBrsrReport: (orgId: string, year: number, token: string) =>
    request(`/compliance/brsr/report/${orgId}/${year}`, { token }),
};

// ─── Marketplace ──────────────────────────────────────────────────────────────

export const marketplaceApi = {
  placeOrder: (payload: unknown, token: string) =>
    request("/marketplace/orders", { method: "POST", body: JSON.stringify(payload), token }),

  getCredits: (orgId: string, token: string) =>
    request(`/marketplace/credits/${orgId}`, { token }),
};

// ─── AI Agent ─────────────────────────────────────────────────────────────────

export const aiApi = {
  runAgent: (payload: unknown, token: string) =>
    request("/ai/run", { method: "POST", body: JSON.stringify(payload), token }),
};
