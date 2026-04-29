"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart2,
  ShieldCheck,
  Zap,
  Globe,
  Factory,
  ChevronRight,
  Star,
  Users,
  Award,
} from "lucide-react";

const stats = [
  { value: "2.4M", label: "tCO₂ Tracked", icon: BarChart2 },
  { value: "340+", label: "Enterprises", icon: Factory },
  { value: "99.2%", label: "Audit Accuracy", icon: ShieldCheck },
  { value: "₹480Cr", label: "Credits Traded", icon: Globe },
];

const features = [
  {
    step: "01",
    title: "Localized Audit",
    description:
      "Ingest complex, region-specific emission data across manufacturing and logistics nodes with 99% accuracy.",
    icon: Factory,
  },
  {
    step: "02",
    title: "AI Prediction",
    description:
      "Simulate intervention strategies. Forecast reduction trajectories against state-level environmental compliance targets.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Offset Trading",
    description:
      "Seamlessly access verified local offset projects (agro-forestry, renewables) within the Indian domestic market.",
    icon: Globe,
  },
];

const testimonials = [
  {
    quote:
      "IndiCarbon AI reduced our compliance reporting time by 80%. The AI predictions are remarkably accurate.",
    author: "Rajesh Kumar",
    role: "Head of Sustainability, Tata Steel",
    avatar: "RK",
  },
  {
    quote:
      "The localized offset marketplace is a game-changer. We found verified projects within 50km of our plants.",
    author: "Priya Sharma",
    role: "ESG Director, Reliance Industries",
    avatar: "PS",
  },
  {
    quote:
      "Finally, a platform built for Indian regulatory requirements. NDC compliance tracking is seamless.",
    author: "Amit Verma",
    role: "VP Operations, Mahindra Group",
    avatar: "AV",
  },
];

const sdgGoals = [
  { number: "SDG 7", title: "Clean Energy", metric: "+12%", desc: "adoption across facilities" },
  { number: "SDG 9", title: "Innovation", metric: "3 patents", desc: "filed for capture tech" },
  { number: "SDG 13", title: "Climate Action", metric: "-450t", desc: "CO₂ this quarter" },
  { number: "SDG 17", title: "Partnerships", metric: "340+", desc: "enterprises aligned" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-card border border-border overflow-hidden">
                <Image
                  src="/images/Indicrabon%20logo.png"
                  alt="IndiCarbon AI logo"
                  width={44}
                  height={44}
                  priority
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="font-black tracking-tight">
                IndiCarbon <span className="opacity-70">AI</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/mission" className="text-muted-foreground hover:text-foreground transition-colors">
                Mission
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/portfolio" className="text-muted-foreground hover:text-foreground transition-colors">
                Carbon Vault
              </Link>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                Enterprise
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="font-semibold">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-muted text-foreground border-border">
                Built for India’s net-zero execution
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02]">
                Carbon intelligence that’s easy to read, easy to act on.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Measure emissions with precision, simulate interventions, and connect to verified
                offsets — with a UI designed for clarity across every device.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto font-bold">
                    Start free trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View live demo
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> SOC 2 Type II
                </span>
                <span className="hidden sm:block w-px h-4 bg-border" />
                <span className="inline-flex items-center gap-2">
                  <Award className="h-4 w-4" /> CPCB-aligned
                </span>
                <span className="hidden sm:block w-px h-4 bg-border" />
                <span className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4" /> 4.9/5 from 120+ reviews
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <Image
                  src="/images/homePageIndia.png"
                  alt="IndiCarbon AI home visual"
                  width={1200}
                  height={1200}
                  priority
                  className="w-full h-auto object-cover"
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                A visual inspired by India-first carbon intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <div className="max-w-2xl">
                <Badge className="bg-muted text-foreground border-border">How it works</Badge>
                <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                  Three steps to carbon clarity
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  From raw emissions data to verified offsets — the full workflow, designed for Indian
                  industrial complexity.
                </p>
              </div>

              <div className="mt-8 grid md:grid-cols-3 gap-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.step}
                      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="h-11 w-11 rounded-xl bg-muted border border-border flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-3xl font-black text-muted-foreground/50">{feature.step}</span>
                      </div>
                      <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        Learn more <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/HomePageSecond.png"
                alt="IndiCarbon AI visual"
                width={1200}
                height={1200}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <Badge className="bg-muted text-foreground border-border">Trust</Badge>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                Trusted by sustainability leaders
              </h2>
              <p className="mt-3 text-muted-foreground">
                Clear reporting, reliable prediction, and workflows that teams actually use.
              </p>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.author} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-1 mb-4 text-foreground">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-foreground" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">
                  “{t.quote}”
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{t.author}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 lg:p-12">
            <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="max-w-2xl">
                <Badge className="bg-muted text-foreground border-border">Net-zero by 2070</Badge>
                <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                  Ready to lead India’s green transition?
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Join 340+ enterprises measuring, reducing, and offsetting their footprint with clarity.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto font-bold">
                    Start free — no card
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/mission">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Read our mission
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-card border border-border overflow-hidden">
                <Image
                  src="/images/Indicrabon%20logo.png"
                  alt="IndiCarbon AI"
                  width={20}
                  height={20}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-sm">© 2026 IndiCarbon AI · Built for India’s Net-Zero Future</span>
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
