"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you register, we collect your name, email address, organisation name, and role. If you sign up via SSO, we receive your identity token from the provider.",
      },
      {
        subtitle: "Emissions & Compliance Data",
        text: "Data you submit through the platform — GHG emission reports, document uploads, BRSR disclosures, and carbon credit transactions — is stored in your organisation's isolated tenant within our database.",
      },
      {
        subtitle: "Usage & Telemetry",
        text: "We collect anonymised usage metrics (pages visited, feature adoption, API call counts) to improve the product. We do not track individual keystrokes or screen recordings.",
      },
      {
        subtitle: "AI Interaction Data",
        text: "Conversations with our AI agents (Auditor, Strategist) and MCP tool invocations are logged for quality assurance and human-in-the-loop (HITL) review. These logs are scoped to your organisation and are not shared with other tenants.",
      },
    ],
  },
  {
    title: "2. How We Use Your Data",
    content: [
      {
        subtitle: "Platform Operations",
        text: "Your data is used to provide carbon accounting, compliance reporting (BRSR, CCTS), marketplace trading, and AI-powered analysis services as described in our product documentation.",
      },
      {
        subtitle: "AI Model Improvement",
        text: "We do not use your proprietary emissions data or documents to train foundation models. AI agents run on privately hosted LLMs (Ollama) within our infrastructure. Document analysis results are used only to serve your requests.",
      },
      {
        subtitle: "Regulatory Compliance",
        text: "We may process your data to generate reports required by SEBI, CPCB, BEE, or other Indian regulatory bodies — but only when you explicitly initiate such reports through the platform.",
      },
    ],
  },
  {
    title: "3. Data Storage & Security",
    content: [
      {
        subtitle: "Infrastructure",
        text: "All data is stored in Supabase (PostgreSQL) with row-level security (RLS) enforcing tenant isolation. Documents are stored in Supabase Storage with presigned URLs for access control.",
      },
      {
        subtitle: "Encryption",
        text: "Data is encrypted at rest (AES-256) and in transit (TLS 1.3). JWT tokens are signed with RS256 and expire after 1 hour. Refresh tokens expire after 7 days.",
      },
      {
        subtitle: "Access Control",
        text: "Role-based access control (RBAC) with six levels — SUPER_ADMIN, ORG_ADMIN, AUDITOR, ANALYST, TRADER, and VIEWER — ensures users only access data appropriate to their role.",
      },
    ],
  },
  {
    title: "4. Data Sharing & Third Parties",
    content: [
      {
        subtitle: "No Sale of Data",
        text: "We do not sell, rent, or trade your personal or organisational data to third parties.",
      },
      {
        subtitle: "Service Providers",
        text: "We use Supabase for database and auth, Redis for caching, and Langfuse for AI observability. These providers process data under strict data processing agreements.",
      },
      {
        subtitle: "Marketplace Counterparties",
        text: "When you execute a trade on the carbon marketplace, your organisation name and trade details are shared with the counterparty as part of the settlement process. No personal data is shared.",
      },
    ],
  },
  {
    title: "5. Your Rights (DPDP Act 2023)",
    content: [
      {
        subtitle: "Access & Correction",
        text: "You can view and update your profile, organisation details, and submitted data at any time through the Settings page or via the API.",
      },
      {
        subtitle: "Data Portability",
        text: "You can export your emissions data, BRSR reports, and trade history in CSV or JSON format from the dashboard.",
      },
      {
        subtitle: "Erasure",
        text: "You may request complete deletion of your account and associated data by contacting privacy@indicarbon.ai. We will process erasure requests within 30 days, subject to regulatory retention requirements.",
      },
      {
        subtitle: "Grievance Redressal",
        text: "Our Data Protection Officer can be reached at dpo@indicarbon.ai. We acknowledge grievances within 48 hours and resolve them within 30 days as required under the DPDP Act.",
      },
    ],
  },
  {
    title: "6. Cookies & Local Storage",
    content: [
      {
        subtitle: "Essential Only",
        text: "We use localStorage to persist your JWT session token and Redux state. We do not use third-party tracking cookies, advertising pixels, or cross-site trackers.",
      },
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      {
        subtitle: "Active Accounts",
        text: "Your data is retained for as long as your account is active. Emissions data and compliance reports are retained for the duration required by applicable Indian regulations (typically 8 years for financial records).",
      },
      {
        subtitle: "Deleted Accounts",
        text: "Upon account deletion, personal data is purged within 30 days. Anonymised aggregate data (sector benchmarks, platform statistics) may be retained indefinitely.",
      },
    ],
  },
  {
    title: "8. Changes to This Policy",
    content: [
      {
        subtitle: "",
        text: "We will notify you of material changes via email and an in-app banner at least 15 days before they take effect. Continued use of the platform after the effective date constitutes acceptance.",
      },
    ],
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border overflow-hidden">
                <Image src="/images/Indicrabon%20logo.png" alt="IndiCarbon AI" width={32} height={32} className="h-full w-full object-contain" />
              </span>
              <span className="font-black tracking-tight text-sm">IndiCarbon AI</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">Back to home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <Badge className="bg-muted text-foreground border-border mb-3">
            <ShieldCheck className="h-3 w-3 mr-1" /> DPDP Act 2023 Compliant
          </Badge>
          <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
            IndiCarbon AI ("we", "us", "our") is committed to protecting the privacy of our users.
            This policy explains how we collect, use, store, and protect your data.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 17, 2026 &middot; Effective: June 17, 2026
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold tracking-tight mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.content.map((item, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5">
                    {item.subtitle && (
                      <h3 className="text-sm font-semibold mb-1.5">{item.subtitle}</h3>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-black tracking-tight">Questions about your data?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Contact our Data Protection Officer at{" "}
            <span className="font-semibold text-foreground">dpo@indicarbon.ai</span>
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/terms">
              <Button variant="outline">Read Terms of Service</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="font-semibold">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">© 2026 IndiCarbon AI</span>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors font-medium text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/integration" className="hover:text-foreground transition-colors">Integration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
