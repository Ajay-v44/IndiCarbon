import { apiCall } from "./axios-client";
import {
  BRSRReportResponse,
  CalculateScopeEmissionsRequest,
  DocumentResponse,
  DocumentUploadRequest,
  DocumentVerifyRequest,
  EmissionFactorResponse,
  EmissionReportCreate,
  EmissionReportResponse,
  EmissionSummaryResponse,
  SectorBenchmarkCreate,
  SectorBenchmarkUpdate,
  SectorBenchmarkResponse,
} from "./types";


// ─── Emissions APIs ───

export function createEmissionReport(payload: EmissionReportCreate): Promise<EmissionReportResponse> {
  return apiCall<EmissionReportResponse>({
    url: "/api/v1/emissions",
    method: "POST",
    data: payload,
  });
}

export function getEmissionSummary(params: {
  organization_id: string;
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
}): Promise<EmissionSummaryResponse> {
  return apiCall<EmissionSummaryResponse>({
    url: "/api/v1/emissions/summary",
    method: "GET",
    params,
  });
}

export function generateBrsr(params: {
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
  revenue_crore?: number;
}): Promise<BRSRReportResponse> {
  return apiCall<BRSRReportResponse>({
    url: "/api/v1/emissions/brsr",
    method: "GET",
    params,
  });
}

export function listFactors(vintageYear?: number): Promise<EmissionFactorResponse[]> {
  return apiCall<EmissionFactorResponse[]>({
    url: "/api/v1/emissions/factors",
    method: "GET",
    params: vintageYear ? { vintage_year: vintageYear } : {},
  });
}

export function calculateScopeEmissions(
  revenueCrore: number,
  documentId: string,
  items: CalculateScopeEmissionsRequest[]
): Promise<{ message: string }> {
  return apiCall<{ message: string }>({
    url: "/api/v1/emissions/calculate_scope_emissions",
    method: "POST",
    params: {
      revenue_crore: revenueCrore,
      document_id: documentId,
    },
    data: items,
  });
}

// ─── Documents (Vault) APIs ───

export function registerDocument(payload: DocumentUploadRequest): Promise<DocumentResponse> {
  return apiCall<DocumentResponse>({
    url: "/api/v1/documents",
    method: "POST",
    data: payload,
  });
}

export function listDocuments(params: {
  organization_id: string;
  doc_type?: string;
}): Promise<DocumentResponse[]> {
  return apiCall<DocumentResponse[]>({
    url: "/api/v1/documents",
    method: "GET",
    params,
  });
}

export function getDocument(docId: string): Promise<DocumentResponse> {
  return apiCall<DocumentResponse>({
    url: `/api/v1/documents/${docId}`,
    method: "GET",
  });
}

export function verifyDocument(
  docId: string,
  payload: DocumentVerifyRequest
): Promise<DocumentResponse> {
  return apiCall<DocumentResponse>({
    url: `/api/v1/documents/${docId}/verify`,
    method: "PATCH",
    data: payload,
  });
}

export function getSignedUrl(docId: string): Promise<{ signed_url: string }> {
  return apiCall<{ signed_url: string }>({
    url: `/api/v1/documents/${docId}/signed-url`,
    method: "GET",
  });
}

// ─── Sector Benchmarks APIs ───

export function listBenchmarks(): Promise<SectorBenchmarkResponse[]> {
  return apiCall<SectorBenchmarkResponse[]>({
    url: "/api/v1/emissions/benchmarks",
    method: "GET",
  });
}

export function createBenchmark(payload: SectorBenchmarkCreate): Promise<SectorBenchmarkResponse> {
  return apiCall<SectorBenchmarkResponse>({
    url: "/api/v1/emissions/benchmarks",
    method: "POST",
    data: payload,
  });
}

export function updateBenchmark(
  benchmarkId: string,
  payload: SectorBenchmarkUpdate
): Promise<SectorBenchmarkResponse> {
  return apiCall<SectorBenchmarkResponse>({
    url: `/api/v1/emissions/benchmarks/${benchmarkId}`,
    method: "PUT",
    data: payload,
  });
}

export function deleteBenchmark(benchmarkId: string): Promise<{ deleted_id: string }> {
  return apiCall<{ deleted_id: string }>({
    url: `/api/v1/emissions/benchmarks/${benchmarkId}`,
    method: "DELETE",
  });
}

