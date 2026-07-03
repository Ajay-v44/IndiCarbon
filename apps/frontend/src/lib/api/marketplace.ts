import { apiCall } from "./axios-client";
import {
  CarbonCredit,
  CreateProposalRequest,
  MarketOrder,
  PlaceOrderRequest,
  PlaceOrderResponse,
  ProposalAcceptResponse,
  ProposalResponse,
} from "./types";

export function placeOrder(payload: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  const idempotencyKey = crypto.randomUUID();
  return apiCall<PlaceOrderResponse>({
    url: "/api/v1/orders",
    method: "POST",
    data: payload,
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
}

export function getMarketOrders(): Promise<MarketOrder[]> {
  return apiCall<MarketOrder[]>({
    url: "/api/v1/orders/market",
    method: "GET",
  });
}

export function listCredits(organizationId: string, status?: string): Promise<CarbonCredit[]> {
  return apiCall<CarbonCredit[]>({
    url: "/api/v1/credits",
    method: "GET",
    params: { organization_id: organizationId, ...(status ? { status } : {}) },
  });
}

export function getCreditLedger(organizationId: string, limit?: number, offset?: number): Promise<any> {
  return apiCall<any>({
    url: "/api/v1/credits/ledger",
    method: "GET",
    params: {
      organization_id: organizationId,
      ...(limit !== undefined ? { limit } : {}),
      ...(offset !== undefined ? { offset } : {}),
    },
  });
}

// ─── Proposals ───

export function createProposal(payload: CreateProposalRequest): Promise<ProposalResponse> {
  return apiCall<ProposalResponse>({
    url: "/api/v1/proposals",
    method: "POST",
    data: payload,
  });
}

export function listProposals(organizationId: string, role?: "buyer" | "seller"): Promise<ProposalResponse[]> {
  return apiCall<ProposalResponse[]>({
    url: "/api/v1/proposals",
    method: "GET",
    params: { organization_id: organizationId, ...(role ? { role } : {}) },
  });
}

export function acceptProposal(proposalId: string): Promise<ProposalAcceptResponse> {
  return apiCall<ProposalAcceptResponse>({
    url: `/api/v1/proposals/${proposalId}/accept`,
    method: "POST",
  });
}

export function rejectProposal(proposalId: string, rejectionReason?: string): Promise<ProposalResponse> {
  return apiCall<ProposalResponse>({
    url: `/api/v1/proposals/${proposalId}/reject`,
    method: "POST",
    data: rejectionReason ? { rejection_reason: rejectionReason } : {},
  });
}

export function cancelProposal(proposalId: string): Promise<ProposalResponse> {
  return apiCall<ProposalResponse>({
    url: `/api/v1/proposals/${proposalId}/cancel`,
    method: "POST",
  });
}

export function adminMintCredits(payload: {
  organization_id: string;
  quantity: number;
  vintage_year: number;
  project_type: string;
}): Promise<any> {
  return apiCall<any>({
    url: "/api/v1/credits/admin/mint",
    method: "POST",
    data: payload,
  });
}

export function retireCredits(creditIds: string[]): Promise<any> {
  return apiCall<any>({
    url: "/api/v1/credits/retire",
    method: "POST",
    data: creditIds,
  });
}

export function retireByQuantity(organizationId: string, quantity: number): Promise<any> {
  return apiCall<any>({
    url: "/api/v1/credits/retire-by-quantity",
    method: "POST",
    data: { organization_id: organizationId, quantity },
  });
}

export function applyCreditsToEmissions(organizationId: string, quantity: number): Promise<any> {
  return apiCall<any>({
    url: "/api/v1/credits/apply-to-emissions",
    method: "POST",
    data: { organization_id: organizationId, quantity },
  });
}

export function getPortfolioSummary(organizationId: string): Promise<any> {
  return apiCall<any>({
    url: "/api/v1/credits/portfolio",
    method: "GET",
    params: { organization_id: organizationId },
  });
}

// ─── Carbon Projects ─────────────────────────────────────────────────────────

export interface SubmitProjectPayload {
  organization_id: string;
  name: string;
  project_type: string;
  description?: string;
  registry?: string;
  // Input metrics for AI credit calculation
  energy_produced_mwh?: number;
  fuel_switched_litre?: number;
  waste_diverted_tonnes?: number;
  trees_planted?: number;
  area_hectares?: number;
  // User estimates
  estimated_annual_reduction_tco2e?: number;
  estimated_credits?: number;
  project_lifetime_years?: number;
  submitted_documents?: string[];
}

export function submitProject(payload: SubmitProjectPayload): Promise<any> {
  return apiCall<any>({
    url: "/api/v1/projects",
    method: "POST",
    data: payload,
  });
}

export function evaluateProjectCredits(projectId: string): Promise<any> {
  return apiCall<any>({
    url: `/api/v1/projects/${projectId}/evaluate`,
    method: "POST",
  });
}

export function listProjects(organizationId: string, status?: string, limit?: number, offset?: number): Promise<any> {
  return apiCall<any>({
    url: "/api/v1/projects",
    method: "GET",
    params: {
      organization_id: organizationId,
      ...(status ? { status } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(offset !== undefined ? { offset } : {}),
    },
  });
}

export function listAllProjects(status?: string, limit?: number, offset?: number): Promise<any> {
  return apiCall<any>({
    url: "/api/v1/projects/admin/all",
    method: "GET",
    params: {
      ...(status ? { status } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(offset !== undefined ? { offset } : {}),
    },
  });
}

export function getProject(projectId: string): Promise<any> {
  return apiCall<any>({
    url: `/api/v1/projects/${projectId}`,
    method: "GET",
  });
}

export function updateProjectStatus(
  projectId: string,
  status: string,
  reviewerNotes?: string,
  adminApprovedCredits?: number,
): Promise<any> {
  return apiCall<any>({
    url: `/api/v1/projects/${projectId}/status`,
    method: "PATCH",
    data: {
      status,
      reviewer_notes: reviewerNotes,
      ...(adminApprovedCredits !== undefined ? { admin_approved_credits: adminApprovedCredits } : {}),
    },
  });
}

export function analyseProjectDocument(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  return apiCall<any>({
    url: "/api/v1/ai/analyse-project",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
