"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Users,
  Zap,
  Globe,
  BarChart2,
  Award,
  Target,
  Brain,
} from "lucide-react";

const team = [
  {
    name: "Dr. Ananya Singh",
    role: "CEO & Co-founder",
    bio: "Former climate scientist at TERI. 15 years in GHG policy and India's NDC framework.",
    avatar: "AS",
  },
  {
    name: "Vikram Iyer",
    role: "CTO & Co-founder",
    bio: "Ex-Google AI. Architected privacy-first LLM pipelines for regulated industries.",
    avatar: "VI",
  },
  {
    name: "Meera Patel",
    role: "Chief Compliance Officer",
    bio: "SEBI-registered ESG auditor. Specialist in BRSR, BEE, and India's carbon credit system (CCTS).",
    avatar: "MP",
  },
  {
    name: "Arjun Nair",
    role: "Head of Marketplace",
    bio: "Built India's first domestic carbon offset registry. Verra VCS and Gold Standard certified.",
    avatar: "AN",
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Privacy-First AI",
    description:
      "Your emissions data never leaves your control. Our AI models run locally on your infrastructure — no data shared with third-party LLM providers.",
  },
  {
    icon: Target,
    title: "India-Specific",
    description:
      "Built ground-up for India's regulatory landscape: SEBI BRSR, MoEFCC GHG norms, BEE energy factors, and the Carbon Credit Trading Scheme (CCTS).",
  },
  {
    icon: Brain,
    title: "AI-Native",
    description:
      "Not a spreadsheet with AI bolted on. Every workflow is orchestrated by LangChain ReAct agents with verifiable audit trails and HITL safeguards.",
  },
  {
    icon: Globe,
    title: "Open Ecosystem",
    description:
      "Full REST API, MCP server, and SDK. Integrate IndiCarbon into any tool — from Claude to custom internal dashboards.",
  },
];

const milestones = [
  { year: "2022", event: "Founded in Bengaluru with seed funding from Bharat Climate Fund" },
  { year: "2023", event: "Launched India's first AI-native BRSR reporting engine. 50 enterprise pilots." },
  { year: "2024", event: "Carbon Marketplace went live. ₹480Cr in verified credits traded in Year 1." },
  { year: "2025", event: "CCTS integration. 340+ enterprises. MCP server launched for AI agent access." },
  { year: "2026", event: "Expanding to SEA markets. Series B in progress." },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-card border border-border overflow-hidden">
              <Image src="/images/Indicrabon%20logo.png" alt="IndiCarbon AI" width={28} height={28} className="h-full w-full object-contain" />
            </span>
            <span className="font-black text-base tracking-tight">IndiCarbon AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/integration">
              <Button variant="ghost" size="sm">Integration</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="sm">Sign in <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-muted text-foreground border-border mb-4">Our Story</Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Built in India,<br />for India's Net-Zero future
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            IndiCarbon AI was founded by climate scientists and AI engineers who saw a gap: 
            India's enterprises were drowning in compliance paperwork while global SaaS tools 
            ignored local regulations. We built the platform we wished existed.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BarChart2, value: "2.4M tCO₂", label: "Emissions tracked" },
              { icon: Users, value: "340+", label: "Enterprises" },
              { icon: Award, value: "99.2%", label: "Audit accuracy" },
              { icon: Leaf, value: "₹480 Cr", label: "Credits traded" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6 text-center">
                <s.icon className="h-6 w-6 mx-auto mb-3 text-muted-foreground" />
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-muted text-foreground border-border mb-3">Our Mission</Badge>
              <h2 className="text-3xl font-black tracking-tight">
                Accelerate India's transition to a low-carbon economy
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                India has committed to net-zero by 2070 and 50% renewable energy by 2030. 
                Meeting these goals requires every enterprise — from steel plants to IT parks — 
                to measure, reduce, and offset their emissions with scientific rigour.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                IndiCarbon AI makes this possible through privacy-first local AI, India-specific 
                emission factors, and a live carbon credit marketplace that keeps value within 
                the Indian ecosystem.
              </p>
            </div>
            <div className="space-y-4">
              {values.map((v) => (
                <div key={v.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                  <v.icon className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold text-sm">{v.title}</div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-muted text-foreground border-border mb-3">The Team</Badge>
            <h2 className="text-3xl font-black tracking-tight">
              Scientists, engineers, and policy veterans
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.name} className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="h-14 w-14 mx-auto rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold mb-4">
                  {m.avatar}
                </div>
                <div className="font-semibold text-sm">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 mb-3">{m.role}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-muted text-foreground border-border mb-3">Our Journey</Badge>
            <h2 className="text-3xl font-black tracking-tight">Milestones</h2>
          </div>
          <div className="space-y-4">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-5 items-start">
                <div className="shrink-0 w-12 text-right">
                  <span className="text-xs font-bold text-muted-foreground">{m.year}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full border-2 border-foreground bg-background mt-0.5" />
                  {i < milestones.length - 1 && <div className="w-px flex-1 bg-border mt-1" style={{ minHeight: 32 }} />}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pb-4">{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black tracking-tight">
            Join India's climate mission
          </h2>
          <p className="mt-3 text-muted-foreground">
            Whether you're a compliance officer, sustainability analyst, or AI developer,
            there's a place for you in the IndiCarbon ecosystem.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="font-bold">
                Get started free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/integration">
              <Button size="lg" variant="outline">
                Integration docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">© 2026 IndiCarbon AI · Bengaluru, India</span>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors font-medium text-foreground">About</Link>
            <Link href="/integration" className="hover:text-foreground transition-colors">Integration</Link>
            <Link href="/mission" className="hover:text-foreground transition-colors">Mission</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
