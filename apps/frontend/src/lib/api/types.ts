export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  roles?: string[];
  organization_id?: string;
  organization_ids?: string[];
  is_internal?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  designation?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Compliance / Emissions ───

export type GHGScope = "scope_1" | "scope_2" | "scope_3";

export type EmissionCategory =
  | "stationary_combustion"
  | "mobile_combustion"
  | "electricity"
  | "business_travel"
  | "supply_chain"
  | "waste";

export interface EmissionReportCreate {
  organization_id: string;
  reporting_period_start: string; // YYYY-MM-DD
  reporting_period_end: string;   // YYYY-MM-DD
  scope_type: "SCOPE_1" | "SCOPE_2" | "SCOPE_3";
  raw_quantity: number;
  activity_unit: string;
  document_evidence_id?: string;
  factor_key?: string;
}

export interface EmissionReportResponse {
  id: string;
  organization_id: string;
  reporting_period_start: string;
  reporting_period_end: string;
  scope_type: string;
  raw_quantity: number;
  activity_unit: string;
  calculated_tco2e?: number;
  factor_used_id?: string;
  audit_status: string;
  document_evidence_id?: string;
}

export interface EmissionSummaryResponse {
  organization_id: string;
  period_start: string;
  period_end: string;
  scope_totals_tco2e: Record<string, number>;
  grand_total_tco2e: number;
  report_count: number;
}

export interface EmissionFactorResponse {
  id: string;
  factor_key: string;
  factor_value: number;
  unit: string;
  vintage_year: number;
  source_agency?: string;
  is_active: boolean;
}

export interface BRSRReportResponse {
  organization_id: string;
  period_start: string;
  period_end: string;
  scope1_total_tco2e: number;
  scope2_total_tco2e: number;
  scope3_total_tco2e: number;
  grand_total_tco2e: number;
  intensity_per_revenue_crore?: number;
}

export interface CalculateScopeEmissionsRequest {
  year: number;
  factor_key: string;
  raw_quantity: number;
}

// ─── Compliance / Documents ───

export interface DocumentUploadRequest {
  organization_id: string;
  doc_type: string;
  file_path: string;
  file_hash?: string;
  mime_type?: string;
  metadata?: Record<string, any>;
}

export interface DocumentResponse {
  id: string;
  organization_id: string;
  doc_type: string;
  bucket_name: string;
  file_path: string;
  file_hash?: string;
  mime_type?: string;
  is_verified: boolean;
  metadata?: Record<string, any>;
}

export interface DocumentVerifyRequest {
  is_verified: boolean;
  metadata?: Record<string, any>;
}

// ─── Marketplace ───

export type CreditStatus = "ISSUED" | "PENDING_TRANSFER" | "RETIRED";
export type OrderType = "BUY" | "SELL";
export type OrderStatus = "OPEN" | "FILLED" | "CANCELLED" | "EXPIRED";

/** A single carbon credit as returned by GET /api/v1/credits */
export interface CarbonCredit {
  id: string;
  serial_number: string;
  vintage_year: number;
  project_type?: string;
  status: CreditStatus;
  current_owner_id?: string;
}

/** A market order as returned by GET /api/v1/orders/market or GET /api/v1/orders */
export interface MarketOrder {
  id: string;
  organization_id: string;
  order_type: OrderType;
  quantity: number;
  price_per_unit: number;
  status: OrderStatus;
  created_at?: string;
  vintage_year?: number;
  project_type?: string;
}

/** Request body for POST /api/v1/orders — matches backend PlaceOrderRequest schema */
export interface PlaceOrderRequest {
  organization_id: string;
  order_type: OrderType;
  quantity: number;
  price_per_unit: number;
  vintage_year?: number;
  project_type?: string;
}

/** Response from POST /api/v1/orders */
export interface PlaceOrderResponse {
  matched: boolean;
  order_id?: string;
  status?: string;
  trade?: TradeReceipt;
}

/** Settlement receipt returned inside PlaceOrderResponse.trade when matched=true */
export interface TradeReceipt {
  trade_id: string;
  buyer_org_id: string;
  seller_org_id: string;
  quantity: number;
  price_per_unit: number;
  total_value: number;
  serial_numbers: string[];
}

// ─── AI Agent ───

export interface ChatRequest {
  query: string;
}

export interface ChatSource {
  document_id?: string;
  filename?: string;
  chunk_index?: number;
  similarity: number;
  excerpt: string;
}

export interface ChatResponse {
  run_id: string;
  session_id: string;
  organization_id: string;
  user_id: string;
  answer: string;
  sources: ChatSource[];
  duration_ms: number;
  trace_url?: string;
  guardrail_audit: Record<string, any>;
  interaction_id?: string;
}

export interface ChatHistoryItem {
  interaction_id: string;
  session_id?: string;
  query: string;
  answer: string;
  created_at: string;
  sources: ChatSource[];
  guardrail_blocked: boolean;
}

export interface ChatHistoryResponse {
  items: ChatHistoryItem[];
}

export interface AgentRegistryCreate {
  agent_name: string;
  agent_type: string;
  model_version: string;
  is_active?: boolean;
}

export interface AgentRegistryUpdate {
  agent_name?: string;
  agent_type?: string;
  model_version?: string;
  is_active?: boolean;
}

export interface AgentRegistryResponse {
  id: string;
  agent_name?: string;
  agent_type?: string;
  model_version?: string;
  is_active: boolean;
  created_at?: string;
}

export interface EmissionLineItem {
  factor_key: string;
  raw_quantity: number;
  activity_unit: string;
  year: number;
  scope_hint?: string;
  source_text?: string;
}

export interface DocumentAnalysisResult {
  run_id: string;
  organization_id: string;
  document_id?: string;
  fiscal_year?: number;
  revenue_crore?: number;
  emission_line_items: EmissionLineItem[];
  summary: string;
  compliance_api_result?: Record<string, any>;
  trace_url?: string;
  duration_ms: number;
  completed_at: string;
  graph_steps: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  designation?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  roles: string[];
  organization_ids: string[];
  is_internal?: boolean;
}

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_internal?: boolean;
}

export interface AssignRolePayload {
  user_id: string;
  role_id: string;
  organization_id?: string;
}

export interface SectorBenchmarkCreate {
  sector_name: string;
  sub_sector?: string;
  target_intensity: number;
  intensity_unit: string;
  compliance_year: number;
  reduction_target_pct?: number;
  is_ccts_obligated: boolean;
  regulatory_framework?: string;
}

export interface SectorBenchmarkUpdate {
  sector_name?: string;
  sub_sector?: string;
  target_intensity?: number;
  intensity_unit?: string;
  compliance_year?: number;
  reduction_target_pct?: number;
  is_ccts_obligated?: boolean;
  regulatory_framework?: string;
}

export interface SectorBenchmarkResponse {
  id: string;
  sector_name: string;
  sub_sector?: string;
  target_intensity: number;
  intensity_unit?: string;
  compliance_year?: number;
  reduction_target_pct?: number;
  is_ccts_obligated: boolean;
  regulatory_framework?: string;
}

export interface OrganizationResponse {
  id: string;
  legal_name: string;
  trade_name?: string;
  industry_sector?: string;
  registration_number?: string;
  subscription_status: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: string[];
  is_internal?: boolean;
}

// ─── Proposals (RFQ / Negotiated Orders) ───

export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "EXPIRED";

export interface CreateProposalRequest {
  sell_order_id: string;
  buyer_org_id: string;
  quantity: number;
  proposed_price: number;
  buyer_note?: string;
}

export interface ProposalResponse {
  id: string;
  sell_order_id: string;
  buyer_org_id: string;
  seller_org_id: string;
  quantity: number;
  asking_price: number;
  proposed_price: number;
  total_value: number;
  status: ProposalStatus;
  buyer_note?: string;
  rejection_reason?: string;
  trade_id?: string;
  created_at?: string;
  responded_at?: string;
  expires_at?: string;
  project_type?: string;
  vintage_year?: number;
}

export interface ProposalAcceptResponse {
  proposal: ProposalResponse;
  trade: TradeReceipt;
}

// ─── Wallet ───

export interface WalletResponse {
  id: string;
  organization_id: string;
  balance: number;
  currency: string;
}

export interface WalletTransactionResponse {
  id: string;
  wallet_id: string;
  organization_id: string;
  txn_type: string;
  amount: number;
  balance_after: number;
  reference_id?: string;
  description?: string;
  created_by?: string;
  created_at?: string;
}

export interface AdminAddFundsRequest {
  organization_id: string;
  amount: number;
  description?: string;
}

export interface AdminAddFundsResponse {
  wallet_id: string;
  organization_id: string;
  amount_added: number;
  new_balance: number;
  transaction_id: string;
}

// ─── System Logs ───

export interface SystemLogEntry {
  id: string;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  service: string;
  message: string;
  organization_id: string | null;
  user_id: string | null;
  request_id: string | null;
  http_method: string | null;
  http_path: string | null;
  http_status: string | null;
  duration_ms: string | null;
  stack_trace: string | null;
  metadata: Record<string, any> | null;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string | null;
}

export interface SystemLogListResponse {
  logs: SystemLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface SystemLogStats {
  total: number;
  unresolved: number;
  errors: number;
  warnings: number;
  criticals: number;
  services: string[];
}

export interface SystemLogFilters {
  organization_id?: string;
  service?: string;
  level?: string;
  is_resolved?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

// ─── A2A (Agent-to-Agent) Protocol ───

// A2A Part — v0.3.0 uses the "kind" discriminator (text | file | data)
export interface A2APart {
  kind: "text" | "file" | "data";
  text?: string;
  data?: any;
  file?: { name?: string; mimeType?: string; bytes?: string; uri?: string };
  metadata?: Record<string, any>;
}

export interface A2ASkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples: string[];
  inputModes?: string[];
  outputModes?: string[];
}

export interface A2ASecurityScheme {
  type: string;
  scheme: string;
  bearerFormat?: string;
  description?: string;
}

export interface A2AAgentCard {
  protocolVersion: string;
  name: string;
  description: string;
  url: string;
  preferredTransport: string;
  version: string;
  provider: { organization: string; url: string };
  capabilities: { streaming: boolean; pushNotifications: boolean; stateTransitionHistory: boolean };
  securitySchemes?: Record<string, A2ASecurityScheme>;
  security?: Array<Record<string, string[]>>;
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: A2ASkill[];
  documentationUrl?: string;
}

export type A2ATaskState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "failed"
  | "canceled"
  | "rejected"
  | "auth-required"
  | "unknown";

export interface A2AMessage {
  role: string;
  parts: A2APart[];
  messageId?: string;
  kind?: "message";
  contextId?: string;
  taskId?: string;
}

export interface A2ATaskStatus {
  state: A2ATaskState;
  message?: A2AMessage;
  timestamp?: string;
}

export interface A2AArtifact {
  artifactId: string;
  name?: string;
  description?: string;
  parts: A2APart[];
}

export interface A2ATask {
  id: string;
  contextId?: string;
  status: A2ATaskStatus;
  artifacts: A2AArtifact[];
  history: A2AMessage[];
  kind?: "task";
  metadata: Record<string, any>;
}

export interface A2ATaskSummary {
  id: string;
  session_id?: string;
  state: A2ATaskState;
  query: string;
  answer?: string;
  skill_id?: string;
  duration_ms?: number;
  token_usage?: number;
  guardrail_blocked: boolean;
  guardrail_audit: Record<string, any>;
  organization_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface A2AActivityStats {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  blocked_tasks: number;
  avg_duration_ms: number;
  total_tokens: number;
  tasks_by_state: Record<string, number>;
  tasks_by_skill: Record<string, number>;
  tasks_by_org: Record<string, number>;
}

export interface A2ASendTaskRequest {
  query: string;
  session_id?: string;
  skill_id?: string;
  metadata?: Record<string, any>;
}
