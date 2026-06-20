import { apiCall } from "./axios-client";
import type {
  SystemLogListResponse,
  SystemLogStats,
  SystemLogEntry,
  SystemLogFilters,
} from "./types";

export async function getSystemLogs(
  filters: SystemLogFilters = {}
): Promise<SystemLogListResponse> {
  const params = new URLSearchParams();
  if (filters.organization_id) params.set("organization_id", filters.organization_id);
  if (filters.service) params.set("service", filters.service);
  if (filters.level) params.set("level", filters.level);
  if (filters.is_resolved !== undefined) params.set("is_resolved", String(filters.is_resolved));
  if (filters.search) params.set("search", filters.search);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  const qs = params.toString();
  return apiCall<SystemLogListResponse>({
    method: "GET",
    url: `/api/v1/system-logs${qs ? `?${qs}` : ""}`,
  });
}

export async function getSystemLogStats(
  organizationId?: string
): Promise<SystemLogStats> {
  const qs = organizationId ? `?organization_id=${organizationId}` : "";
  return apiCall<SystemLogStats>({
    method: "GET",
    url: `/api/v1/system-logs/stats${qs}`,
  });
}

export async function resolveSystemLog(logId: string): Promise<SystemLogEntry> {
  return apiCall<SystemLogEntry>({
    method: "POST",
    url: `/api/v1/system-logs/${logId}/resolve`,
  });
}

export async function bulkResolveSystemLogs(
  logIds: string[]
): Promise<{ resolved_count: number }> {
  return apiCall<{ resolved_count: number }>({
    method: "POST",
    url: `/api/v1/system-logs/bulk-resolve`,
    data: { log_ids: logIds },
  });
}
