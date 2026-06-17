"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Scale } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    items: [
      "By accessing or using IndiCarbon AI (\"the Platform\"), you agree to be bound by these Terms of Service. If you are using the Platform on behalf of an organisation, you represent that you have authority to bind that organisation to these terms.",
      "We may update these terms from time to time. Material changes will be communicated via email and in-app notification at least 15 days before they take effect.",
    ],
  },
  {
    title: "2. Account & Access",
    items: [
      "You must register with a valid email address and provide accurate organisation details. Each user account is personal and non-transferable.",
      "You are responsible for maintaining the confidentiality of your credentials. Notify us immediately at security@indicarbon.ai if you suspect unauthorised access.",
      "We may suspend or terminate accounts that violate these terms, engage in fraudulent marketplace activity, or remain inactive for more than 12 consecutive months.",
    ],
  },
  {
    title: "3. Platform Services",
    items: [
      "IndiCarbon AI provides carbon accounting, GHG compliance reporting (BRSR, CCTS), carbon credit marketplace, AI-powered document analysis, and MCP server integration services.",
      "The Platform is provided \"as is\". While we strive for accuracy, AI-generated analyses (emission calculations, audit reports, strategy recommendations) are advisory and should be reviewed by qualified professionals before regulatory submission.",
      "We do not guarantee uninterrupted availability. Scheduled maintenance windows will be communicated 48 hours in advance. Our target uptime SLA is 99.5% measured monthly.",
    ],
  },
  {
    title: "4. Carbon Marketplace",
    items: [
      "The IndiCarbon marketplace facilitates peer-to-peer carbon credit trading between verified organisations. IndiCarbon acts as a matching engine, not a counterparty or broker.",
      "All trades are final once matched and settled. Cancelled orders that have not been matched are refundable. Partially filled orders can only cancel the unfilled remainder.",
      "Credit retirement is permanent and irreversible. Retired credits are recorded on-chain and cannot be re-traded or un-retired.",
      "IndiCarbon does not provide investment advice. Carbon credit prices fluctuate and past performance does not indicate future returns. You trade at your own risk.",
      "We reserve the right to halt marketplace operations during system anomalies, suspected fraud, or regulatory intervention.",
    ],
  },
  {
    title: "5. Data Ownership & Licensing",
    items: [
      "You retain full ownership of all data you submit — emissions records, documents, organisation profiles, and compliance reports.",
      "By using the Platform, you grant IndiCarbon a limited, non-exclusive licence to process your data solely for the purpose of providing the services you have requested.",
      "Aggregated, anonymised benchmarks derived from platform-wide data (e.g., sector averages, market price indices) are owned by IndiCarbon and may be published publicly. No individual organisation's data is identifiable in these aggregates.",
    ],
  },
  {
    title: "6. AI & MCP Services",
    items: [
      "AI agents (Auditor, Strategist) and the MCP server process your data using privately hosted language models. Your data is not sent to third-party AI providers.",
      "AI-generated outputs — emission calculations, BRSR reports, compliance recommendations — are computational estimates. They do not constitute professional audit opinions or legal advice.",
      "Human-in-the-loop (HITL) reviews allow your organisation's designated reviewers to approve or reject AI-flagged items. HITL decisions are final and override AI recommendations.",
      "MCP tool invocations are logged for audit and debugging purposes. Logs are retained for 90 days and are accessible only to your organisation's admins.",
    ],
  },
  {
    title: "7. Acceptable Use",
    items: [
      "You agree not to: reverse-engineer the Platform or AI models; submit knowingly false emissions data; manipulate marketplace prices through wash trading or spoofing; use the API or MCP server to build a competing product; or exceed rate limits (100 requests/minute per API key).",
      "Violations may result in immediate account suspension, trade reversal, and reporting to relevant regulatory authorities.",
    ],
  },
  {
    title: "8. Fees & Payment",
    items: [
      "Platform access tiers and pricing are published on our website. Free tier users are subject to usage limits as described in the plan comparison.",
      "Marketplace transactions incur a settlement fee displayed at order placement. Fees are non-refundable once a trade is executed.",
      "We reserve the right to modify pricing with 30 days' written notice. Existing annual subscriptions are honoured at the original rate until renewal.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    items: [
      "To the maximum extent permitted by law, IndiCarbon's total liability for any claims arising from use of the Platform shall not exceed the fees paid by you in the 12 months preceding the claim.",
      "We are not liable for losses arising from: AI estimation errors in emission calculations; marketplace price movements; regulatory penalties incurred based on Platform-generated reports; or service outages caused by force majeure events.",
    ],
  },
  {
    title: "10. Governing Law & Disputes",
    items: [
      "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.",
      "Before initiating legal proceedings, you agree to attempt resolution through our grievance officer (grievance@indicarbon.ai) with a 30-day resolution window.",
    ],
  },
  {
    title: "11. Contact",
    items: [
      "For questions about these terms, contact legal@indicarbon.ai. For technical support, reach support@indicarbon.ai or use the in-app Agenti Chat.",
    ],
  },
];

export function TermsPage() {
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
            <Scale className="h-3 w-3 mr-1" /> Legal
          </Badge>
          <h1 className="text-4xl font-black tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
            These terms govern your use of the IndiCarbon AI platform, including the carbon
            marketplace, AI agent services, MCP server, and all associated APIs.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 17, 2026 &middot; Effective: June 17, 2026
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold tracking-tight mb-3">{section.title}</h2>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                {section.items.map((item, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-black tracking-tight">Questions about these terms?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Contact our legal team at{" "}
            <span className="font-semibold text-foreground">legal@indicarbon.ai</span>
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/privacy">
              <Button variant="outline">Read Privacy Policy</Button>
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
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors font-medium text-foreground">Terms</Link>
            <Link href="/integration" className="hover:text-foreground transition-colors">Integration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
