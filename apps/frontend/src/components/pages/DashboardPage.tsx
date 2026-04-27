"use client";

import { useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  Upload,
  Zap,
  BarChart2,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  CloudUpload,
  Factory,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

/* ─── Data ──────────────────────────────────────────────────── */
const emissionsData = [
  { month: "Oct", actual: 4200, target: 4000 },
  { month: "Nov", actual: 3800, target: 3900 },
  { month: "Dec", actual: 4100, target: 3800 },
  { month: "Jan", actual: 3600, target: 3700 },
  { month: "Feb", actual: 3200, target: 3600 },
  { month: "Mar", actual: 2950, target: 3500 },
];

const sectorData = [
  { name: "Energy",     value: 38 },
  { name: "Transport",  value: 24 },
  { name: "Industrial", value: 20 },
  { name: "Waste",      value: 12 },
  { name: "Other",      value: 6 },
];

const sdgItems = [
  { label: "Clean Energy",   metric: "+12%",    sub: "facility adoption",   color: "text-green-700",  bg: "bg-green-50",  border: "border-green-100" },
  { label: "Innovation",     metric: "3 patents", sub: "carbon capture",    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  { label: "Climate Action", metric: "−450t",   sub: "CO₂ this quarter",   color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-100" },
];

const recentActivity = [
  { msg: "Facility audit Q1 2026 uploaded",     time: "2 min ago",  status: "success" },
  { msg: "150 tCO₂ credits verified",            time: "1 hr ago",   status: "success" },
  { msg: "Scope 2 emissions exceeded target",    time: "3 hrs ago",  status: "warning" },
  { msg: "Carbon offset trade executed",         time: "5 hrs ago",  status: "success" },
];

type State = "success" | "processing" | "error" | "empty";

/* ─── Sub-components ────────────────────────────────────────── */
function KpiCard({
  title, value, unit, delta, trend, Icon, iconColor, iconBg,
}: {
  title: string; value: string; unit: string; delta: string;
  trend: "up" | "down"; Icon: React.ElementType;
  iconColor: string; iconBg: string;
}) {
  const positive = (trend === "down" && title === "Total Emissions") || (trend === "up" && title !== "Total Emissions");
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${positive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
          {trend === "down" ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          {delta}
        </span>
      </div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tight">
        {value}
        <span className="text-sm font-normal text-gray-400 ml-1.5">{unit}</span>
      </p>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export function DashboardPage() {
  const [state, setState] = useState<State>("success");

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-8 pb-12">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="status-dot-green" />
            <span className="text-xs font-semibold text-green-700 uppercase tracking-widest">Live Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Global Operations</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            Real-time carbon footprint monitoring & predictive sustainability intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* State switcher (demo) */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs bg-white shadow-sm">
            {(["success", "processing", "error", "empty"] as State[]).map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`px-3 py-2 capitalize font-medium transition-all ${
                  state === s ? "bg-green-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setState("success")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-white shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm transition-all">
            <CloudUpload className="w-3.5 h-3.5" />
            Upload Data
          </button>
        </div>
      </div>

      {/* ── SUCCESS STATE ─────────────────────────────────────── */}
      {state === "success" && (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Emissions" value="2,950" unit="tCO₂e"    delta="-8.2%" trend="down" Icon={Factory}  iconColor="text-green-600"  iconBg="bg-green-50" />
            <KpiCard title="Carbon Credits"  value="1,240" unit="tCO₂ offset" delta="+22.5%" trend="up" Icon={Leaf}   iconColor="text-emerald-600" iconBg="bg-emerald-50" />
            <KpiCard title="Budget Used"     value="68"    unit="% annual" delta="-3.4%"  trend="down" Icon={BarChart2} iconColor="text-blue-600"  iconBg="bg-blue-50" />
            <KpiCard title="AI Accuracy"     value="99.2"  unit="%"        delta="+0.4%"  trend="up"   Icon={Zap}     iconColor="text-violet-600" iconBg="bg-violet-50" />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Area chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Emissions Trend</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Actual vs. NDC target (tCO₂e)</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 className="w-3 h-3" />
                  On Track
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={emissionsData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad-actual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grad-target" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", color: "#111827", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#16a34a" fill="url(#grad-actual)" strokeWidth={2.5} name="Actual" dot={false} activeDot={{ r: 5, fill: "#16a34a" }} />
                  <Area type="monotone" dataKey="target" stroke="#2563eb" fill="url(#grad-target)" strokeWidth={2} strokeDasharray="5 3" name="Target" dot={false} activeDot={{ r: 4, fill: "#2563eb" }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-5 mt-3 justify-center">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-0.5 bg-green-600 rounded-full inline-block" />
                  Actual
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block" style={{ borderTop: "2px dashed #2563eb", background: "none", height: 0 }} />
                  NDC Target
                </div>
              </div>
            </div>

            {/* Sector breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">Emission Sources</h2>
              <p className="text-sm text-gray-400 mb-5">By sector (%)</p>
              <div className="space-y-4">
                {sectorData.map((s, i) => {
                  const colors = ["#16a34a", "#10b981", "#0d9488", "#2563eb", "#9ca3af"];
                  return (
                    <div key={s.name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700">{s.name}</span>
                        <span className="font-bold text-gray-900">{s.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${s.value}%`, background: colors[i] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SDG Impact */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">SDG Impact</h2>
              <p className="text-sm text-gray-400 mb-5">Panchamrit contribution</p>
              <div className="space-y-3">
                {sdgItems.map((item) => (
                  <div key={item.label} className={`flex items-center justify-between p-3.5 rounded-xl ${item.bg} border ${item.border}`}>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                    </div>
                    <span className={`text-xl font-black ${item.color}`}>{item.metric}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Lab */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">Compliance Lab</h2>
              <p className="text-sm text-gray-400 mb-5">Data upload & audit</p>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-green-400 hover:bg-green-50/50 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center mx-auto mb-3 transition-all">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-green-700">Upload Data Logs</p>
                <p className="text-xs text-gray-400 mt-0.5">CSV, JSON, PDF supported</p>
                <button className="mt-3 px-4 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                  Browse Files
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { name: "Q1_audit_2026.csv",  status: "Verified",   statusColor: "text-green-700 bg-green-50 border-green-200" },
                  { name: "facility_report.pdf", status: "Processing", statusColor: "text-amber-700 bg-amber-50 border-amber-200" },
                ].map((file) => (
                  <div key={file.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xs font-medium text-gray-700 truncate mr-2">{file.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${file.statusColor}`}>
                      {file.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">Recent Activity</h2>
              <p className="text-sm text-gray-400 mb-5">Latest platform events</p>
              <div className="space-y-1">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${activity.status === "success" ? "bg-green-100" : "bg-amber-100"}`}>
                      {activity.status === "success" ? (
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium leading-snug">{activity.msg}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Simulator CTA */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 p-6 shadow-lg">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)" }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">What-If AI Simulator</h3>
                  <p className="text-sm text-green-100 mt-0.5 max-w-md">
                    Project future emissions across energy transitions, policy scenarios, and offset strategies using our AI engine.
                  </p>
                </div>
              </div>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-green-700 text-sm font-bold hover:bg-green-50 transition-all shadow-sm shrink-0"
                onClick={() => window.location.href = "/simulator"}
              >
                Launch Simulator
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── EMPTY STATE ───────────────────────────────────────── */}
      {state === "empty" && (
        <div className="flex flex-col items-center justify-center min-h-[55vh] text-center bg-white rounded-2xl border border-gray-200 border-dashed p-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-6">
            <CloudUpload className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No emissions data yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-8">
            Upload your first dataset to start monitoring your carbon footprint and generating AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm transition-all">
              <Upload className="w-4 h-4" />
              Upload First Dataset
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
              View Sample Data
            </button>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4 w-full max-w-lg text-left">
            {[
              { title: "Upload CSV/Excel", desc: "Drag & drop facility logs", icon: Upload },
              { title: "Connect API",      desc: "Real-time data streaming",  icon: Zap },
              { title: "Manual Entry",     desc: "Add emissions manually",    icon: Factory },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <div key={opt.title} className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{opt.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PROCESSING STATE ─────────────────────────────────── */}
      {state === "processing" && (
        <div className="flex flex-col items-center justify-center min-h-[55vh] text-center bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
          <div className="relative w-16 h-16 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-green-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">AI Engine Processing</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-8">
            Analyzing your emissions telemetry and generating predictive compliance insights.
          </p>
          <div className="w-full max-w-sm space-y-2.5 text-left">
            {[
              { label: "Parsing facility data",           done: true },
              { label: "Running compliance checks",       done: true },
              { label: "Generating AI predictions",       done: false, active: true },
              { label: "Building offset recommendations", done: false },
            ].map((step) => (
              <div key={step.label} className={`flex items-center gap-3 p-3.5 rounded-xl border ${step.active ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"}`}>
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                ) : step.active ? (
                  <div className="w-4 h-4 rounded-full border-2 border-t-green-600 border-gray-200 animate-spin shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                )}
                <span className={`text-sm font-medium ${step.done ? "text-gray-400 line-through" : step.active ? "text-green-700" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6">Estimated time: ~2 minutes</p>
        </div>
      )}

      {/* ── ERROR STATE ───────────────────────────────────────── */}
      {state === "error" && (
        <div className="flex flex-col items-center justify-center min-h-[55vh] text-center bg-white rounded-2xl border border-red-100 p-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Validation Error</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-8">
            We encountered issues processing your latest emissions dataset. Please review and reupload corrected data.
          </p>
          <div className="w-full max-w-md p-4 rounded-xl bg-red-50 border border-red-100 mb-6 text-left">
            <p className="text-sm font-bold text-red-700 mb-3">3 Errors Found</p>
            {[
              "Row 47: Missing Scope 2 electricity data for Pune facility",
              "Row 112: Invalid unit — expected tCO₂, received 'kg'",
              "Column 'transport_fuel' contains non-numeric values",
            ].map((err) => (
              <div key={err} className="flex gap-2.5 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700">{err}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all">
              <Upload className="w-4 h-4" />
              Reupload Corrected File
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-700 hover:bg-red-50 transition-all">
              Download Error Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
