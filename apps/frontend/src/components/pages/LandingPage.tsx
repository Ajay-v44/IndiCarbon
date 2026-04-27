"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Leaf,
  BarChart2,
  ShieldCheck,
  Zap,
  Globe,
  TrendingDown,
  Factory,
  TreePine,
  ChevronRight,
  Star,
  Users,
  Award,
} from "lucide-react";

const stats = [
  { value: "2.4M", label: "tCO₂ Tracked", icon: BarChart2 },
  { value: "340+", label: "Enterprises", icon: Factory },
  { value: "99.2%", label: "Audit Accuracy", icon: ShieldCheck },
  { value: "₹480Cr", label: "Credits Traded", icon: TrendingDown },
];

const features = [
  {
    step: "01",
    title: "Localized Audit",
    description:
      "Ingest complex, region-specific emission data across manufacturing and logistics nodes with 99% accuracy.",
    icon: Factory,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    step: "02",
    title: "AI Prediction",
    description:
      "Simulate intervention strategies. Forecast reduction trajectories against state-level environmental compliance targets.",
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    step: "03",
    title: "Offset Trading",
    description:
      "Seamlessly access verified local offset projects (agro-forestry, renewables) within the Indian domestic market.",
    icon: Globe,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
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
    <div className="min-h-screen bg-[#0a0f0d]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-green-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center glow-green-sm">
                <Leaf className="w-4 h-4 text-green-400" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-gradient">IndiCarbon</span>
                <span className="text-green-600/50 font-light"> AI</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/mission" className="text-sm text-green-100/60 hover:text-green-300 transition-colors">
                Mission
              </Link>
              <Link href="/dashboard" className="text-sm text-green-100/60 hover:text-green-300 transition-colors">
                Platform
              </Link>
              <Link href="/portfolio" className="text-sm text-green-100/60 hover:text-green-300 transition-colors">
                Carbon Vault
              </Link>
              <Link href="/admin" className="text-sm text-green-100/60 hover:text-green-300 transition-colors">
                Enterprise
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-green-300 hover:text-green-200 hover:bg-green-500/10">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-green-500 hover:bg-green-400 text-black font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero grid-pattern min-h-[90vh] flex items-center">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/6 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-teal-500/5 rounded-full blur-xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl">
            <Badge className="mb-6 bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/15">
              <div className="status-dot-green mr-2" />
              India's First AI Carbon Intelligence Platform
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
              <span className="text-white">Accelerating</span>
              <br />
              <span className="text-gradient">India's Net-Zero</span>
              <br />
              <span className="text-white">Future.</span>
            </h1>

            <p className="text-xl text-green-100/60 max-w-2xl mb-10 leading-relaxed">
              Advanced predictive carbon accounting and localized offset trading to meet National
              Determined Contribution (NDC) goals with precision. Built for India's industrial
              scale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-400 text-black font-bold text-base px-8 glow-green"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-500/30 text-green-300 hover:bg-green-500/10 text-base px-8"
                >
                  View Live Demo
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center gap-4 text-xs text-green-400/50">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-500/60" />
                SOC 2 Type II Certified
              </span>
              <span className="w-px h-4 bg-green-900/50" />
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-green-500/60" />
                CPCB Compliant
              </span>
              <span className="w-px h-4 bg-green-900/50" />
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-green-500/60" />
                4.9/5 from 120+ reviews
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="border-y border-green-900/30 bg-green-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-green-500/60 mr-2" />
                    <span className="text-2xl sm:text-3xl font-black text-gradient">{stat.value}</span>
                  </div>
                  <p className="text-xs text-green-400/50">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intelligence at Scale */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Intelligence at Scale
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Three steps to <span className="text-gradient">carbon clarity</span>
            </h2>
            <p className="text-lg text-green-100/50 max-w-2xl mx-auto">
              From raw emissions data to verified carbon credits — IndiCarbon AI handles the entire
              journey with enterprise-grade precision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.step}
                  className={`relative p-6 rounded-2xl glass border ${feature.border} hover:border-opacity-40 transition-all duration-300 group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <span className="text-5xl font-black text-green-900/40">{feature.step}</span>
                  </div>
                  <h3 className={`text-xl font-bold ${feature.color} mb-2`}>{feature.title}</h3>
                  <p className="text-sm text-green-100/50 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-green-500/40 group-hover:text-green-400/60 transition-colors">
                    Learn more <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SDG Goals */}
      <section className="py-24 border-y border-green-900/30 bg-green-500/3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/20">
              Panchamrit Aligned
            </Badge>
            <h2 className="text-4xl font-black text-white mb-4">
              Contributing to <span className="text-gradient">SDG Goals</span>
            </h2>
            <p className="text-green-100/50 max-w-xl mx-auto">
              Simulated live monitoring of carbon equivalents offset through our ecosystem,
              contributing directly to India's Panchamrit goals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sdgGoals.map((goal) => (
              <div
                key={goal.number}
                className="p-5 rounded-2xl glass border border-green-900/30 hover:border-green-500/20 transition-all"
              >
                <Badge className="mb-3 bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                  {goal.number}
                </Badge>
                <p className="text-2xl font-black text-gradient mb-1">{goal.metric}</p>
                <p className="text-xs text-green-300/70 font-medium mb-0.5">{goal.title}</p>
                <p className="text-xs text-green-400/40">{goal.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
                Built for India
              </Badge>
              <h2 className="text-4xl font-black text-white mb-6">
                Architecting India's{" "}
                <span className="text-gradient">Carbon Infrastructure</span>
              </h2>
              <p className="text-green-100/50 leading-relaxed mb-6">
                By 2070, India aims for Net-Zero. The journey requires unprecedented clarity in
                industrial emissions and localized mitigation strategies.
              </p>
              <p className="text-green-100/50 leading-relaxed mb-8">
                IndiCarbon AI bridges the gap between high-level policy and factory-floor execution.
                We provide the digital instrumentation required to measure, predict, and trade
                environmental impact securely on an enterprise level.
              </p>
              <div className="flex gap-4">
                <Link href="/auth/register">
                  <Button className="bg-green-500 hover:bg-green-400 text-black font-semibold">
                    Start Building
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual card grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Emission Sources Tracked", value: "120+", icon: Factory },
                { label: "State-Level Compliance", value: "28 States", icon: Globe },
                { label: "Offset Projects", value: "450+", icon: TreePine },
                { label: "Active Users", value: "12,000+", icon: Users },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="p-5 rounded-2xl glass border border-green-900/30 hover:border-green-500/20 transition-all"
                  >
                    <Icon className="w-6 h-6 text-green-500/60 mb-3" />
                    <p className="text-2xl font-black text-gradient mb-1">{item.value}</p>
                    <p className="text-xs text-green-400/50">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-green-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              Trusted by India's <span className="text-gradient">sustainability leaders</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.author} className="p-6 rounded-2xl glass border border-green-900/30">
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-green-400 text-green-400" />
                  ))}
                </div>
                <p className="text-sm text-green-100/70 leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xs font-bold text-green-400">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-100">{t.author}</p>
                    <p className="text-xs text-green-500/60">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-12 sm:p-16 rounded-3xl overflow-hidden bg-gradient-to-br from-green-950/80 to-emerald-950/60 border border-green-500/20 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
            <Badge className="mb-6 bg-green-400/20 text-green-300 border-green-400/30">
              Net-Zero by 2070
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Ready to lead India's{" "}
              <span className="text-gradient">green transition?</span>
            </h2>
            <p className="text-lg text-green-100/50 mb-10 max-w-xl mx-auto">
              Join 340+ enterprises already using IndiCarbon AI to measure, reduce, and offset
              their carbon footprint.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-green-400 hover:bg-green-300 text-black font-bold px-10 glow-green"
                >
                  Start Free — No Credit Card
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/mission">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                >
                  Read Our Mission
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-900/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-500/60" />
              <span className="text-sm text-green-500/60">
                © 2026 IndiCarbon AI · Built for India's Net-Zero Future
              </span>
            </div>
            <div className="flex gap-6 text-xs text-green-500/40">
              <Link href="#" className="hover:text-green-400 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-green-400 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-green-400 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
