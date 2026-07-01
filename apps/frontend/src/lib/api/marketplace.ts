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

export function listCredits(organizationId: string): Promise<CarbonCredit[]> {
  return apiCall<CarbonCredit[]>({
    url: "/api/v1/credits",
    method: "GET",
    params: { organization_id: organizationId },
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
