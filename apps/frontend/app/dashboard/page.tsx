"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, Bot, Leaf, ShoppingCart, TrendingDown,
  Activity, ArrowUpRight, AlertCircle
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricCard {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: React.ElementType;
  unit: string;
}

// ─── Mock data (replace with real API calls) ──────────────────────────────────

const metrics: MetricCard[] = [
  { title: "Total GHG Emissions", value: "4,820", delta: "-12.4%", positive: true, icon: TrendingDown, unit: "tCO2e" },
  { title: "Scope 1 Emissions", value: "1,240", delta: "+2.1%", positive: false, icon: Activity, unit: "tCO2e" },
  { title: "Credits Available", value: "380", delta: "+60", positive: true, icon: Leaf, unit: "tonnes" },
  { title: "Open Orders", value: "12", delta: "3 matched", positive: true, icon: ShoppingCart, unit: "orders" },
];

const scopeData = [
  { label: "Scope 1", value: 1240, color: "var(--color-brand-400)" },
  { label: "Scope 2", value: 2180, color: "var(--color-accent-400)" },
  { label: "Scope 3", value: 1400, color: "#f59e0b" },
];

const total = scopeData.reduce((s, d) => s + d.value, 0);

const recentActivity = [
  { type: "trade", description: "Sold 50 tCO2e — Verra VCS Project #1042", time: "2m ago", icon: ShoppingCart },
  { type: "ai", description: "Auditor Agent completed BRSR review", time: "15m ago", icon: Bot },
  { type: "emission", description: "New Scope 2 entry: 12,400 kWh electricity", time: "1h ago", icon: BarChart3 },
  { type: "alert", description: "Scope 3 intensity above benchmark", time: "3h ago", icon: AlertCircle },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-[var(--color-text-muted)] mb-1">FY 2024–25</p>
        <h1 className="text-2xl font-bold">Sustainability Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Real-time GHG emissions, compliance status, and carbon market activity
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.title} className="glass-card p-5 metric-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-overlay)] flex items-center justify-center">
                <m.icon className="w-4 h-4 text-[var(--color-brand-300)]" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                m.positive
                  ? "bg-[rgba(61,166,104,0.12)] text-[var(--color-brand-300)]"
                  : "bg-[rgba(245,158,11,0.12)] text-[#fbbf24]"
              }`}>
                {m.delta}
              </span>
            </div>
            <p className="text-2xl font-bold mb-0.5">
              {m.value}
              <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1">{m.unit}</span>
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">{m.title}</p>
          </div>
        ))}
      </div>

      {/* Scope Breakdown + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Scope breakdown */}
        <div className="xl:col-span-2 glass-card p-6">
          <h2 className="font-semibold mb-5">GHG Scope Breakdown</h2>
          <div className="space-y-4">
            {scopeData.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[var(--color-text-secondary)]">{s.label}</span>
                  <span className="font-medium">{s.value.toLocaleString()} tCO2e
                    <span className="text-[var(--color-text-muted)] ml-1">
                      ({Math.round((s.value / total) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-surface-overlay)]">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: mounted ? `${(s.value / total) * 100}%` : "0%",
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--color-border-default)] flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Grand Total</p>
              <p className="text-xl font-bold gradient-text">{total.toLocaleString()} tCO2e</p>
            </div>
            <button className="inline-flex items-center gap-1.5 text-sm text-[var(--color-brand-300)] hover:text-[var(--color-brand-200)] transition-colors font-medium">
              View BRSR Report <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-5">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  a.type === "alert"
                    ? "bg-[rgba(245,158,11,0.12)]"
                    : "bg-[var(--color-surface-overlay)]"
                }`}>
                  <a.icon className={`w-4 h-4 ${
                    a.type === "alert" ? "text-[#fbbf24]" : "text-[var(--color-brand-300)]"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{a.description}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
