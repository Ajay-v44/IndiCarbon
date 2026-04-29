"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, Target, Zap, TreePine, ArrowRight } from "lucide-react";

const timeline = [
  {
    year: "2015",
    event: "Paris Agreement",
    desc: "India commits to 33-35% reduction in emission intensity by 2030",
    color: "border-blue-500/40 text-blue-400",
  },
  {
    year: "2021",
    event: "Panchamrit",
    desc: "India pledges 500 GW renewable energy capacity by 2030, net-zero by 2070",
    color: "border-green-500/40 text-green-400",
  },
  {
    year: "2022",
    event: "Carbon Market Launch",
    desc: "India launches domestic carbon credit trading mechanisms",
    color: "border-emerald-500/40 text-emerald-400",
  },
  {
    year: "2024",
    event: "IndiCarbon AI Founded",
    desc: "First AI-native carbon intelligence platform built specifically for Indian industry",
    color: "border-teal-500/40 text-teal-400",
  },
  {
    year: "2026",
    event: "340+ Enterprises",
    desc: "Platform reaches critical mass with 340+ enterprise clients across 18 states",
    color: "border-green-400/40 text-green-300",
  },
  {
    year: "2030",
    event: "NDC Target",
    desc: "Platform aims to track 500M tCO₂ reductions across all partner enterprises",
    color: "border-amber-500/40 text-amber-400",
  },
];

const values = [
  {
    icon: Target,
    title: "Precision over Approximation",
    desc: "India's industrial complexity demands granular, factory-floor-level data. We reject approximations and build for 99%+ accuracy.",
  },
  {
    icon: Globe,
    title: "Rooted in India",
    desc: "From NDC compliance to state-level regulations, every feature is designed for Indian regulatory reality, not adapted from Western frameworks.",
  },
  {
    icon: Zap,
    title: "AI as Infrastructure",
    desc: "Our AI doesn't just report — it predicts, prescribes, and automates. Carbon intelligence should be proactive, not reactive.",
  },
  {
    icon: TreePine,
    title: "Ecosystem over Transaction",
    desc: "We connect manufacturers directly to local forestry and renewable offset projects, building long-term ecological partnerships.",
  },
];

export function MissionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
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
              <span className="font-black tracking-tight">IndiCarbon AI</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-14 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="bg-muted text-foreground border-border">The mission</Badge>
              <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight leading-[1.02]">
                Net-zero needs clarity — not guesswork.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                India’s 2070 target demands factory-floor measurement, state-aware compliance, and
                local mitigation ecosystems. We’re building the infrastructure to make that practical.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto font-bold">
                    Start your journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    See the platform
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/mission-netzero.svg"
                alt="Net-zero roadmap illustration"
                width={1200}
                height={800}
                priority
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <Badge className="bg-muted text-foreground border-border">The challenge</Badge>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Bridging policy and the factory floor
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                India’s industrial sector is complex and distributed. Without granular measurement and
                consistent reporting, reductions are hard to plan — and even harder to verify.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Our goal is to make carbon accounting readable and actionable: clear inputs, clear outputs,
                clear decisions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: "28%", label: "of India’s GHG from industry" },
                { stat: "₹2.5L Cr", label: "potential carbon market by 2030" },
                { stat: "92%", label: "SMEs lack measurement capability" },
                { stat: "2070", label: "national net-zero target year" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-2xl font-black">{s.stat}</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <Badge className="bg-muted text-foreground border-border">Timeline</Badge>
              <h2 className="mt-3 text-3xl font-black tracking-tight">India’s carbon journey</h2>
              <p className="mt-3 text-muted-foreground">
                Key milestones that define the road to 2070 — and the software layer needed to deliver it.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {timeline.map((item) => (
              <div
                key={item.year}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground">{item.year}</p>
                    <p className="mt-1 text-sm font-bold">{item.event}</p>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="shrink-0 h-9 w-9 rounded-xl bg-muted border border-border" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <Badge className="bg-muted text-foreground border-border">Principles</Badge>
            <h2 className="mt-3 text-3xl font-black tracking-tight">What we believe</h2>
            <p className="mt-3 text-muted-foreground">
              Carbon intelligence should be precise, local, and proactive — and it should feel usable.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="h-11 w-11 rounded-xl bg-muted border border-border flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 border-t border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Join the net-zero movement</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Every enterprise that measures, reduces, and offsets brings India closer to 2070 — with confidence in the numbers.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto font-bold">
                  Start your journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See the platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
