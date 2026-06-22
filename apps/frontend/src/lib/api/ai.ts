import { apiCall } from "./axios-client";
import {
  AgentRegistryCreate,
  AgentRegistryResponse,
  AgentRegistryUpdate,
  ChatHistoryResponse,
  ChatResponse,
  DocumentAnalysisResult,
  A2AAgentCard,
  A2ATask,
  A2ATaskSummary,
  A2AActivityStats,
  A2ASendTaskRequest,
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

// ─── A2A (Agent-to-Agent) Protocol ───

export function getA2AAgentCard(): Promise<A2AAgentCard> {
  return apiCall<A2AAgentCard>({
    url: "/.well-known/agent-card.json",
    method: "GET",
  });
}

export function sendA2ATask(payload: A2ASendTaskRequest): Promise<A2ATask> {
  return apiCall<A2ATask>({
    url: "/api/v1/ai/a2a/tasks",
    method: "POST",
    data: payload,
  });
}

export function listA2ATasks(params?: {
  organization_id?: string;
  state?: string;
  skill_id?: string;
  limit?: number;
  offset?: number;
}): Promise<A2ATaskSummary[]> {
  return apiCall<A2ATaskSummary[]>({
    url: "/api/v1/ai/a2a/tasks",
    method: "GET",
    params,
  });
}

export function getA2ATask(taskId: string): Promise<A2ATask> {
  return apiCall<A2ATask>({
    url: `/api/v1/ai/a2a/tasks/${taskId}`,
    method: "GET",
  });
}

export function cancelA2ATask(taskId: string): Promise<A2ATask> {
  return apiCall<A2ATask>({
    url: `/api/v1/ai/a2a/tasks/${taskId}/cancel`,
    method: "POST",
  });
}

export function getA2AStats(organizationId?: string): Promise<A2AActivityStats> {
  return apiCall<A2AActivityStats>({
    url: "/api/v1/ai/a2a/stats",
    method: "GET",
    params: organizationId ? { organization_id: organizationId } : undefined,
  });
}
