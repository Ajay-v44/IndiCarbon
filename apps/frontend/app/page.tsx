import Link from "next/link";
import {
  Leaf, BarChart3, ShoppingCart, Bot, ArrowRight,
  Shield, Zap, Globe, TrendingDown
} from "lucide-react";

const stats = [
  { label: "tCO2e Tracked", value: "2.4M+" },
  { label: "BRSR Reports", value: "1,800+" },
  { label: "Credits Traded", value: "₹340 Cr" },
  { label: "Enterprises", value: "620+" },
];

const features = [
  {
    icon: BarChart3,
    title: "GHG Compliance Engine",
    description: "Automated Scope 1, 2 & 3 calculations using GHG Protocol methodology. Generate SEBI BRSR reports in minutes.",
    href: "/dashboard/compliance",
    accent: "brand",
  },
  {
    icon: ShoppingCart,
    title: "Carbon Marketplace",
    description: "Trade verified carbon credits (Verra VCS, Gold Standard) with ACID-safe settlement and full registry tracking.",
    href: "/dashboard/marketplace",
    accent: "amber",
  },
  {
    icon: Bot,
    title: "AI Sovereign Agent",
    description: "LangChain-powered Auditor and Strategist agents running on local Ollama LLMs — your data never leaves your infra.",
    href: "/dashboard/ai",
    accent: "cyan",
  },
];

export default function HomePage() {
  return (
    <div className="hero-bg min-h-screen">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border-default)] backdrop-blur-xl bg-[rgba(8,17,13,0.85)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-accent-500)] flex items-center justify-center glow-brand">
              <Leaf className="w-4 h-4 text-[var(--color-surface-base)]" />
            </div>
            <span className="font-bold text-lg tracking-tight">IndiCarbon<span className="gradient-text"> AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link href="/auth/signup" className="text-sm px-4 py-2 rounded-lg bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white font-medium transition-all glow-brand">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-emphasis)] bg-[var(--color-surface-raised)] text-xs text-[var(--color-brand-300)] mb-8 font-medium">
          <Zap className="w-3 h-3" />
          Powered by local Ollama LLMs — data sovereign by design
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          India&apos;s AI-Native<br />
          <span className="gradient-text">Carbon Compliance</span><br />
          Platform
        </h1>

        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Automate SEBI BRSR reporting, calculate GHG emissions across all scopes,
          and trade verified carbon credits — all powered by privacy-first AI agents.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)] text-white font-semibold transition-all glow-brand hover:scale-[1.02]">
            Start free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border-emphasis)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-all font-medium">
            View live demo
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-8 metric-pulse">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold gradient-text mb-1">{s.value}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything your sustainability team needs</h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            Three integrated modules — compliance, trading, and AI — built on a microservice architecture.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link key={f.title} href={f.href} className="glass-card p-6 group hover:border-[var(--color-border-emphasis)] transition-all hover:-translate-y-1 hover:glow-brand block">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-overlay)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-brand-900)] transition-colors">
                <f.icon className="w-5 h-5 text-[var(--color-brand-300)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.description}</p>
              <div className="flex items-center gap-1 mt-4 text-xs text-[var(--color-brand-400)] font-medium">
                Learn more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-t border-[var(--color-border-default)] py-12">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-10 flex-wrap text-sm text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-[var(--color-brand-400)]" /> SOC 2 Type II</div>
          <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-[var(--color-brand-400)]" /> SEBI BRSR Compliant</div>
          <div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-[var(--color-brand-400)]" /> GHG Protocol Certified</div>
          <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-[var(--color-brand-400)]" /> Verra VCS Registry</div>
        </div>
      </section>
    </div>
  );
}
