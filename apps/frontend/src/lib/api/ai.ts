import { apiCall } from "./axios-client";
import {
  AgentRegistryCreate,
  AgentRegistryResponse,
  AgentRegistryUpdate,
  ChatHistoryResponse,
  ChatResponse,
  DocumentAnalysisResult,
} from "./types";

export function analyseDocument(
  file: File,
  revenueCrore?: number
): Promise<DocumentAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (revenueCrore !== undefined) {
    formData.append("revenue_crore", revenueCrore.toString());
  }

  return apiCall<DocumentAnalysisResult>({
    url: "/api/v1/analyse-document",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function sendChatMessage(query: string): Promise<ChatResponse> {
  return apiCall<ChatResponse>({
    url: "/api/v1/ai/chat",
    method: "POST",
    data: { query },
  });
}

export function getChatHistory(params?: {
  limit?: number;
  offset?: number;
}): Promise<ChatHistoryResponse> {
  return apiCall<ChatHistoryResponse>({
    url: "/api/v1/ai/chat/history",
    method: "GET",
    params,
  });
}

// ─── Agent Registry CRUD ───

export function createAgentRegistry(payload: AgentRegistryCreate): Promise<AgentRegistryResponse> {
  return apiCall<AgentRegistryResponse>({
    url: "/api/v1/ai/agents/registry",
    method: "POST",
    data: payload,
  });
}

export function listAgentRegistry(params?: {
  limit?: number;
  offset?: number;
}): Promise<AgentRegistryResponse[]> {
  return apiCall<AgentRegistryResponse[]>({
    url: "/api/v1/ai/agents/registry",
    method: "GET",
    params,
  });
}

export function getAgentRegistry(agentId: string): Promise<AgentRegistryResponse> {
  return apiCall<AgentRegistryResponse>({
    url: `/api/v1/ai/agents/registry/${agentId}`,
    method: "GET",
  });
}

export function updateAgentRegistry(
  agentId: string,
  payload: AgentRegistryUpdate
): Promise<AgentRegistryResponse> {
  return apiCall<AgentRegistryResponse>({
    url: `/api/v1/ai/agents/registry/${agentId}`,
    method: "PATCH",
    data: payload,
  });
}

export function deleteAgentRegistry(agentId: string): Promise<{ success: boolean }> {
  return apiCall<{ success: boolean }>({
    url: `/api/v1/ai/agents/registry/${agentId}`,
    method: "DELETE",
  });
}
