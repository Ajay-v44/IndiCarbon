"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, ArrowLeft, Globe, Target, Zap, TreePine, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#0a0f0d]">
      {/* Simple nav */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-green-900/30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            <span className="font-bold text-sm text-gradient">IndiCarbon AI</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-green-400/60 hover:text-green-300 text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative gradient-hero grid-pattern py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-green-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-teal-500/6 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Badge className="mb-6 bg-green-500/10 text-green-400 border-green-500/20">
            The Mission
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-black leading-none mb-6">
            <span className="text-white">By 2070, India will</span>
            <br />
            <span className="text-gradient">reach Net-Zero.</span>
          </h1>
          <p className="text-xl text-green-100/60 max-w-2xl mx-auto leading-relaxed">
            The journey requires unprecedented clarity in industrial emissions and localized
            mitigation strategies. We're building the digital infrastructure to get there.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 border-t border-green-900/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-red-500/10 text-red-400 border-red-500/20">The Challenge</Badge>
              <h2 className="text-3xl font-black text-white mb-4">
                The gap between policy and{" "}
                <span className="text-gradient">factory floor</span>
              </h2>
              <p className="text-green-100/50 leading-relaxed mb-4">
                India's industrial sector accounts for 28% of total GHG emissions. Yet most
                enterprises lack the digital tools to accurately measure, report, and reduce their
                carbon footprint at a granular level.
              </p>
              <p className="text-green-100/50 leading-relaxed">
                Existing Western platforms don't account for India's unique supply chain complexity,
                regional energy mix variability, or domestic offset market structures.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: "28%", label: "of India's GHG from industry", color: "text-red-400" },
                { stat: "₹2.5L Cr", label: "potential carbon market size by 2030", color: "text-amber-400" },
                { stat: "92%", label: "of SMEs lack carbon measurement", color: "text-orange-400" },
                { stat: "2070", label: "India's Net-Zero target year", color: "text-green-400" },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl glass border border-green-900/30">
                  <p className={`text-2xl font-black ${s.color} mb-1`}>{s.stat}</p>
                  <p className="text-xs text-green-400/50 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 border-t border-green-900/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/20">Timeline</Badge>
            <h2 className="text-3xl font-black text-white">India's carbon journey</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-green-900/40 hidden sm:block" />
            <div className="space-y-6">
              {timeline.map((item, i) => (
                <div key={item.year} className="flex gap-6 items-start">
                  <div className={`shrink-0 w-12 h-12 rounded-xl border ${item.color} bg-green-950/60 flex items-center justify-center hidden sm:flex`}>
                    <span className="text-xs font-black">{item.year.slice(2)}</span>
                  </div>
                  <div className="flex-1 p-4 rounded-xl glass border border-green-900/30 hover:border-green-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-500/8 text-green-400/80 border-green-900/40 text-xs">{item.year}</Badge>
                      <span className="text-sm font-bold text-green-200">{item.event}</span>
                    </div>
                    <p className="text-xs text-green-400/50">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 border-t border-green-900/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">Our Principles</Badge>
            <h2 className="text-3xl font-black text-white">What we believe</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="p-6 rounded-2xl glass border border-green-900/30 hover:border-green-500/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-base font-bold text-green-200 mb-2">{v.title}</h3>
                  <p className="text-sm text-green-400/50 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-green-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Join the <span className="text-gradient">net-zero movement</span>
          </h2>
          <p className="text-green-100/50 mb-8 max-w-lg mx-auto">
            Every enterprise that measures, reduces, and offsets their carbon footprint brings India
            one step closer to its 2070 goal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button className="bg-green-500 hover:bg-green-400 text-black font-bold px-8">
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-green-500/30 text-green-300 hover:bg-green-500/10">
                See the Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
