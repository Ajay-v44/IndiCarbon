"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Copy,
  Check,
  Terminal,
  Key,
  Webhook,
  Bot,
  ShieldCheck,
  Globe,
  ChevronRight,
} from "lucide-react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl border border-border bg-muted overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{lang}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto text-foreground leading-relaxed whitespace-pre">{code}</pre>
    </div>
  );
}

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "mcp", label: "MCP Server" },
  { id: "api-reference", label: "API Reference" },
  { id: "workflows", label: "Workflows" },
  { id: "sdks", label: "SDKs & Tools" },
  { id: "errors", label: "Error Handling" },
];

export function IntegrationPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-card border border-border overflow-hidden">
              <Image src="/images/Indicrabon%20logo.png" alt="IndiCarbon AI" width={28} height={28} className="h-full w-full object-contain" />
            </span>
            <span className="font-black text-base tracking-tight">IndiCarbon AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/about"><Button variant="ghost" size="sm">About</Button></Link>
            <Link href="/auth/login"><Button size="sm">Sign in <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Contents</p>
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeSection === item.id
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ChevronRight className="h-3 w-3 shrink-0" />
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 space-y-16">
          {/* Page title */}
          <div>
            <Badge className="bg-muted text-foreground border-border mb-3">For Developers</Badge>
            <h1 className="text-4xl font-black tracking-tight">Integration Guide</h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Everything you need to connect IndiCarbon AI to your existing tools — 
              REST API, MCP server, and AI agent workflows.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Badge variant="outline">API v1</Badge>
              <Badge variant="outline">MCP 1.0</Badge>
              <Badge variant="outline">JWT Auth</Badge>
              <Badge variant="outline">OpenAPI 3.1</Badge>
            </div>
          </div>

          {/* Overview */}
          <section id="overview" className="scroll-mt-24">
            <h2 className="text-2xl font-black tracking-tight mb-4">Overview</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              IndiCarbon AI exposes its full platform through a single API Gateway at{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">http://localhost:8000</code>{" "}
              (or your cloud endpoint). All routes are prefixed with{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/api/v1/</code>.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: Key, title: "Auth Service", desc: "JWT login, RBAC roles, org management", route: "/api/v1/auth/*" },
                { icon: ShieldCheck, title: "Compliance Service", desc: "GHG reporting, BRSR, emission factors", route: "/api/v1/emissions/*" },
                { icon: Globe, title: "Marketplace Service", desc: "Carbon credits, buy/sell orders, trades", route: "/api/v1/orders/*" },
                { icon: Bot, title: "AI Agent Service", desc: "Auditor & Strategist agents, document analysis", route: "/api/v1/ai/*" },
              ].map((s) => (
                <div key={s.title} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{s.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{s.desc}</p>
                  <code className="text-xs font-mono text-muted-foreground">{s.route}</code>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The full OpenAPI spec is available at{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">http://localhost:8000/api/docs</code>{" "}
              (Swagger UI) and{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/api/redoc</code>{" "}
              (ReDoc).
            </p>
          </section>

          {/* Authentication */}
          <section id="authentication" className="scroll-mt-24">
            <h2 className="text-2xl font-black tracking-tight mb-4">Authentication</h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              IndiCarbon uses JWT bearer tokens issued by Supabase Auth. Every protected
              endpoint requires an <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">Authorization: Bearer &lt;token&gt;</code> header.
            </p>

            <h3 className="font-semibold mb-2">1. Login and get token</h3>
            <CodeBlock lang="bash" code={`curl -X POST http://localhost:8000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "you@company.com", "password": "yourpassword"}'`} />

            <div className="mt-3 mb-5">
              <CodeBlock lang="json" code={`{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user_id": "uuid-here",
    "email": "you@company.com",
    "roles": ["ORG_ADMIN"],
    "is_internal": false
  },
  "message": "Login successful."
}`} />
            </div>

            <h3 className="font-semibold mb-2">2. Use the token</h3>
            <CodeBlock lang="bash" code={`# Store the token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use it in every subsequent request
curl http://localhost:8000/api/v1/users/me \\
  -H "Authorization: Bearer $TOKEN"`} />

            <div className="mt-5 rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-2">Token lifecycle</p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Access tokens expire after <strong>1 hour</strong>.</li>
                <li>• Use <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">POST /api/v1/auth/refresh</code> with the refresh token to get a new pair.</li>
                <li>• Refresh tokens expire after <strong>7 days</strong>.</li>
                <li>• The MCP server handles refresh automatically — no manual intervention needed.</li>
              </ul>
            </div>

            <h3 className="font-semibold mt-6 mb-2">RBAC Roles</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Role-based access control governs what each user can do. Roles are assigned per-organisation.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Role</th>
                    <th className="text-left py-2 font-semibold text-muted-foreground">Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["SUPER_ADMIN", "Full platform access, sector benchmarks, internal tooling"],
                    ["ORG_ADMIN", "Manage users, org settings, all compliance & marketplace ops"],
                    ["AUDITOR", "Verify documents, review HITL flags, read all org data"],
                    ["ANALYST", "Submit emission reports, upload documents, read marketplace"],
                    ["TRADER", "Place and cancel marketplace orders, view credits"],
                    ["VIEWER", "Read-only access to org data"],
                  ].map(([role, perms]) => (
                    <tr key={role}>
                      <td className="py-2 pr-4 font-mono text-xs">{role}</td>
                      <td className="py-2 text-xs text-muted-foreground">{perms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* MCP Server */}
          <section id="mcp" className="scroll-mt-24">
            <h2 className="text-2xl font-black tracking-tight mb-2">MCP Server</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The IndiCarbon MCP (Model Context Protocol) server exposes every platform
              capability as AI-callable tools. Connect it to Claude, and the AI can perform
              end-to-end carbon accounting workflows through natural language.
            </p>

            <h3 className="font-semibold mb-2">Installation</h3>
            <CodeBlock lang="bash" code={`cd D:\\IndiCarbon\\mcp-server
pip install -e .
# or with uv (recommended):
uv pip install -e .`} />

            <h3 className="font-semibold mt-6 mb-2">Configure environment</h3>
            <CodeBlock lang="bash" code={`cp .env.example .env
# Edit .env:`} />
            <div className="mt-2">
              <CodeBlock lang="env" code={`INDICARBON_GATEWAY_URL=http://localhost:8000
INDICARBON_EMAIL=your@email.com
INDICARBON_PASSWORD=yourpassword`} />
            </div>

            <h3 className="font-semibold mt-6 mb-2">Add to Claude Desktop</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Edit <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">%APPDATA%\Claude\claude_desktop_config.json</code>:
            </p>
            <CodeBlock lang="json" code={`{
  "mcpServers": {
    "indicarbon": {
      "command": "python",
      "args": ["-m", "indicarbon_mcp"],
      "cwd": "D:\\\\IndiCarbon\\\\mcp-server",
      "env": {
        "INDICARBON_GATEWAY_URL": "http://localhost:8000",
        "INDICARBON_EMAIL": "your@email.com",
        "INDICARBON_PASSWORD": "yourpassword"
      }
    }
  }
}`} />

            <p className="text-xs text-muted-foreground mt-2">Restart Claude Desktop after saving. The IndiCarbon tools will appear automatically.</p>

            <h3 className="font-semibold mt-6 mb-3">Available MCP Tools</h3>
            <div className="space-y-3">
              {[
                { group: "Auth", tools: "indicarbon_login · indicarbon_register · indicarbon_get_profile · indicarbon_list_users · indicarbon_list_roles · indicarbon_create_role · indicarbon_assign_role" },
                { group: "Organisations", tools: "indicarbon_create_organization · indicarbon_list_organizations · indicarbon_get_organization" },
                { group: "Documents", tools: "indicarbon_register_document · indicarbon_list_documents · indicarbon_get_document · indicarbon_verify_document · indicarbon_get_document_signed_url" },
                { group: "Emissions", tools: "indicarbon_submit_emission_report · indicarbon_get_emission_summary · indicarbon_generate_brsr_report · indicarbon_list_emission_factors · indicarbon_calculate_scope_emissions · indicarbon_list_sector_benchmarks" },
                { group: "Marketplace", tools: "indicarbon_list_carbon_credits · indicarbon_get_market_book · indicarbon_list_orders · indicarbon_place_order · indicarbon_cancel_order · indicarbon_retire_credits · indicarbon_list_trades" },
                { group: "AI Agents", tools: "indicarbon_run_agent · indicarbon_analyse_document · indicarbon_chat_with_agent · indicarbon_get_chat_history · indicarbon_list_agent_registry · indicarbon_create_hitl_review · indicarbon_resolve_hitl_review" },
              ].map((g) => (
                <div key={g.group} className="rounded-xl border border-border bg-card p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.group}</span>
                  <p className="text-xs font-mono text-foreground mt-1 leading-relaxed">{g.tools}</p>
                </div>
              ))}
            </div>
          </section>

          {/* API Reference */}
          <section id="api-reference" className="scroll-mt-24">
            <h2 className="text-2xl font-black tracking-tight mb-4">API Reference</h2>

            {[
              {
                title: "Submit Emission Report",
                method: "POST",
                path: "/api/v1/emissions",
                desc: "Submit a GHG emission data entry. System auto-calculates tCO₂e using India-specific emission factors.",
                body: `{
  "organization_id": "uuid",
  "scope_type": "SCOPE_2",
  "raw_quantity": 150000,
  "activity_unit": "kWh",
  "reporting_period_start": "2024-04-01",
  "reporting_period_end": "2025-03-31",
  "factor_key": "GRID_ELECTRICITY_IN"
}`,
              },
              {
                title: "Place Carbon Credit Order",
                method: "POST",
                path: "/api/v1/orders",
                desc: "Place a BUY or SELL order. Auto-matches against counterparties. Returns trade receipt if matched.",
                body: `{
  "organization_id": "uuid",
  "order_type": "BUY",
  "quantity": 500,
  "price_per_unit": "1500.00",
  "vintage_year": 2024,
  "project_type": "solar"
}`,
              },
              {
                title: "Analyse Document with AI",
                method: "POST",
                path: "/api/v1/analyse-document",
                desc: "AI-powered extraction of emission data from sustainability reports, annual reports, and energy audits.",
                body: `{
  "organization_id": "uuid",
  "document_id": "uuid"
}`,
              },
              {
                title: "Generate BRSR Report",
                method: "GET",
                path: "/api/v1/emissions/brsr",
                desc: "Generate SEBI BRSR-compliant GHG disclosure for a reporting period.",
                body: `?period_start=2024-04-01&period_end=2025-03-31&revenue_crore=4200`,
              },
            ].map((ep) => (
              <div key={ep.title} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded font-mono ${ep.method === "GET" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono">{ep.path}</code>
                  <span className="text-sm font-semibold">{ep.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{ep.desc}</p>
                <CodeBlock lang={ep.method === "GET" ? "bash" : "json"} code={ep.body} />
              </div>
            ))}

            <p className="text-sm text-muted-foreground">
              Full OpenAPI spec:{" "}
              <a href="http://localhost:8000/api/docs" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
                http://localhost:8000/api/docs
              </a>
            </p>
          </section>

          {/* Workflows */}
          <section id="workflows" className="scroll-mt-24">
            <h2 className="text-2xl font-black tracking-tight mb-4">Common Workflows</h2>

            <h3 className="font-semibold mb-3">1. Annual Report → BRSR Compliance (via Claude + MCP)</h3>
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <ol className="space-y-3 text-sm text-muted-foreground">
                {[
                  ["indicarbon_login", "Authenticate with org credentials"],
                  ["indicarbon_list_organizations", "Get your organisation UUID"],
                  ["indicarbon_register_document", "Register your uploaded annual report (file_path from Supabase Storage)"],
                  ["indicarbon_analyse_document", "AI extracts emission line items, calculates scope totals, saves to DB"],
                  ["indicarbon_get_emission_summary", "Review Scope 1 + 2 + 3 totals"],
                  ["indicarbon_generate_brsr_report", "Generate the SEBI BRSR disclosure"],
                ].map(([tool, desc], i) => (
                  <li key={tool} className="flex gap-3">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground">{i + 1}</span>
                    <span><code className="font-mono text-xs text-foreground">{tool}</code> — {desc}</span>
                  </li>
                ))}
              </ol>
            </div>

            <h3 className="font-semibold mb-3">2. Carbon Credit Trading</h3>
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <ol className="space-y-3 text-sm text-muted-foreground">
                {[
                  ["indicarbon_get_market_book", "View all open SELL orders — price, vintage, project type"],
                  ["indicarbon_place_order (BUY)", "Place a buy order; auto-matches if a SELL exists at your price"],
                  ["indicarbon_list_orders", "Confirm order status (OPEN → FILLED)"],
                  ["indicarbon_list_carbon_credits", "Verify credits transferred to your org"],
                  ["indicarbon_retire_credits", "Retire credits to offset your calculated emissions"],
                ].map(([tool, desc], i) => (
                  <li key={tool} className="flex gap-3">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground">{i + 1}</span>
                    <span><code className="font-mono text-xs text-foreground">{tool}</code> — {desc}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* SDKs */}
          <section id="sdks" className="scroll-mt-24">
            <h2 className="text-2xl font-black tracking-tight mb-4">SDKs & Tools</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Terminal, title: "Python MCP Server", desc: "Full MCP server for AI agent integration. Works with Claude Desktop, Claude Code, and any MCP-compatible host.", path: "D:\\IndiCarbon\\mcp-server" },
                { icon: Webhook, title: "REST API", desc: "Full OpenAPI 3.1 spec. Use any HTTP client — curl, httpx, axios. Rate limit: 100 req/min per IP.", path: "http://localhost:8000/api/docs" },
                { icon: Bot, title: "AI Agents", desc: "Auditor and Strategist LangChain ReAct agents with Langfuse observability and HITL safety guardrails.", path: "/api/v1/ai/run" },
                { icon: ShieldCheck, title: "Webhook Events", desc: "Coming soon — subscribe to trade settled, document verified, and emission threshold breach events.", path: "—" },
              ].map((s) => (
                <div key={s.title} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{s.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
                  <code className="text-xs font-mono text-muted-foreground">{s.path}</code>
                </div>
              ))}
            </div>
          </section>

          {/* Error Handling */}
          <section id="errors" className="scroll-mt-24">
            <h2 className="text-2xl font-black tracking-tight mb-4">Error Handling</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              All API responses follow the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">ApiResponse</code> envelope:
            </p>
            <CodeBlock lang="json" code={`// Success
{ "data": { ... }, "message": "Operation successful." }

// Error
{ "data": null, "error": "Detailed error message", "error_code": 422 }`} />

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-6 font-semibold">Status</th>
                    <th className="text-left py-2 font-semibold text-muted-foreground">Meaning & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["401", "Token missing or expired → call /auth/refresh"],
                    ["403", "Insufficient role → check your RBAC permissions"],
                    ["404", "Resource not found → verify UUIDs"],
                    ["422", "Validation error → check request body schema"],
                    ["429", "Rate limited → back off for 60 seconds"],
                    ["503", "Downstream service unavailable → retry with exponential backoff"],
                  ].map(([code, msg]) => (
                    <tr key={code}>
                      <td className="py-2 pr-6 font-mono text-xs">{code}</td>
                      <td className="py-2 text-xs text-muted-foreground">{msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h3 className="text-xl font-black tracking-tight">Ready to integrate?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clone the repo, start the Docker stack, and you'll have a full IndiCarbon environment running in under 10 minutes.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="font-bold">
                  Create account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="http://localhost:8000/api/docs" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline">View API docs</Button>
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">© 2026 IndiCarbon AI</span>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/integration" className="hover:text-foreground transition-colors font-medium text-foreground">Integration</Link>
            <Link href="/mission" className="hover:text-foreground transition-colors">Mission</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
