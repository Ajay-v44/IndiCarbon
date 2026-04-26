"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
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
  TreePine,
  ArrowRight,
} from "lucide-react";

// Dummy chart data
const emissionsData = [
  { month: "Oct", actual: 4200, target: 4000 },
  { month: "Nov", actual: 3800, target: 3900 },
  { month: "Dec", actual: 4100, target: 3800 },
  { month: "Jan", actual: 3600, target: 3700 },
  { month: "Feb", actual: 3200, target: 3600 },
  { month: "Mar", actual: 2950, target: 3500 },
];

const sectorData = [
  { name: "Energy", value: 38, color: "#22c55e" },
  { name: "Transport", value: 24, color: "#10b981" },
  { name: "Process", value: 20, color: "#14b8a6" },
  { name: "Waste", value: 12, color: "#3b82f6" },
  { name: "Other", value: 6, color: "#6b7280" },
];

const offsetHistory = [
  { month: "Oct", credits: 120 },
  { month: "Nov", credits: 180 },
  { month: "Dec", credits: 95 },
  { month: "Jan", credits: 240 },
  { month: "Feb", credits: 310 },
  { month: "Mar", credits: 285 },
];

const sdgItems = [
  { label: "Clean Energy", metric: "+12%", sub: "adoption across facilities", color: "text-green-400" },
  { label: "Innovation", metric: "3 patents", sub: "filed for capture", color: "text-emerald-400" },
  { label: "Climate Action", metric: "-450t", sub: "CO₂ this quarter", color: "text-teal-400" },
];

const recentActivity = [
  { type: "upload", msg: "Facility audit Q1 2026 uploaded", time: "2 min ago", status: "success" },
  { type: "credit", msg: "150 tCO₂ credits verified", time: "1 hr ago", status: "success" },
  { type: "alert", msg: "Scope 2 emissions exceeded target", time: "3 hrs ago", status: "warning" },
  { type: "trade", msg: "Carbon offset trade executed", time: "5 hrs ago", status: "success" },
];

type DashboardState = "success" | "processing" | "error" | "empty";

export function DashboardPage() {
  const [state, setState] = useState<DashboardState>("success");

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Global Operations</h1>
          <p className="text-sm text-green-400/60 mt-0.5">
            Real-time carbon footprint monitoring and predictive sustainability modeling.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* State switcher (demo) */}
          <div className="flex rounded-lg border border-green-900/40 overflow-hidden text-xs">
            {(["success", "processing", "error", "empty"] as DashboardState[]).map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`px-3 py-1.5 capitalize font-medium transition-all ${
                  state === s
                    ? "bg-green-500/20 text-green-400"
                    : "text-green-600/50 hover:text-green-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-green-900/50 text-green-400/70 hover:bg-green-500/10 hover:text-green-300"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-400 text-black font-semibold"
          >
            <CloudUpload className="w-3.5 h-3.5 mr-1.5" />
            Upload Data
          </Button>
        </div>
      </div>

      {/* === SUCCESS STATE === */}
      {state === "success" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Emissions",
                value: "2,950",
                unit: "tCO₂e",
                delta: "-8.2%",
                trend: "down",
                icon: Factory,
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
              {
                title: "Carbon Credits",
                value: "1,240",
                unit: "tCO₂ offset",
                delta: "+22.5%",
                trend: "up",
                icon: Leaf,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                title: "Budget Used",
                value: "68",
                unit: "% of annual",
                delta: "-3.4%",
                trend: "down",
                icon: BarChart2,
                color: "text-teal-400",
                bg: "bg-teal-500/10",
              },
              {
                title: "AI Accuracy",
                value: "99.2",
                unit: "%",
                delta: "+0.4%",
                trend: "up",
                icon: Zap,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.title} className="glass border-green-900/30 hover:border-green-500/20 transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${kpi.color}`} />
                      </div>
                      <Badge
                        className={`text-xs ${
                          kpi.trend === "down" && kpi.title === "Total Emissions"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : kpi.trend === "down"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}
                      >
                        {kpi.trend === "down" ? (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        )}
                        {kpi.delta}
                      </Badge>
                    </div>
                    <p className="text-xs text-green-400/50 mb-1">{kpi.title}</p>
                    <p className="text-2xl font-black text-white">
                      {kpi.value}
                      <span className="text-sm font-normal text-green-400/50 ml-1">{kpi.unit}</span>
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Emissions trend */}
            <Card className="lg:col-span-2 glass border-green-900/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-green-100">Emissions Trend</CardTitle>
                    <CardDescription className="text-green-500/50 text-xs">Actual vs. NDC target (tCO₂e)</CardDescription>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    On Track ✓
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={emissionsData}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: "#4d7a5a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4d7a5a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0c1610", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", color: "#a7f3d0" }}
                    />
                    <Area type="monotone" dataKey="actual" stroke="#22c55e" fill="url(#actualGrad)" strokeWidth={2} name="Actual" />
                    <Area type="monotone" dataKey="target" stroke="#3b82f6" fill="url(#targetGrad)" strokeWidth={1.5} strokeDasharray="4 3" name="Target" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sector breakdown */}
            <Card className="glass border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-100">Emission Sources</CardTitle>
                <CardDescription className="text-green-500/50 text-xs">By sector (%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sectorData.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-green-300/70">{s.name}</span>
                      <span className="text-green-400 font-semibold">{s.value}%</span>
                    </div>
                    <Progress value={s.value} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Bottom row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SDG Impact */}
            <Card className="glass border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-100">SDG Impact</CardTitle>
                <CardDescription className="text-green-500/50 text-xs">Panchamrit contribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sdgItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-900/30">
                    <div>
                      <p className="text-xs font-semibold text-green-200">{item.label}</p>
                      <p className="text-xs text-green-500/50">{item.sub}</p>
                    </div>
                    <span className={`text-lg font-black ${item.color}`}>{item.metric}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Compliance Lab */}
            <Card className="glass border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-100">Compliance Lab</CardTitle>
                <CardDescription className="text-green-500/50 text-xs">Data upload & audit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-green-900/40 rounded-xl p-5 text-center hover:border-green-500/30 transition-all cursor-pointer group">
                  <Upload className="w-8 h-8 text-green-600/40 mx-auto mb-2 group-hover:text-green-500/60 transition-colors" />
                  <p className="text-sm font-medium text-green-300/60">Upload Data Logs</p>
                  <p className="text-xs text-green-600/40 mt-0.5">CSV, JSON, PDF</p>
                  <Button variant="outline" size="sm" className="mt-3 border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs">
                    Browse Files
                  </Button>
                </div>
                <div className="mt-3 space-y-1.5">
                  {[
                    { name: "Q1_audit_2026.csv", size: "2.4 MB", status: "Verified" },
                    { name: "facility_report.pdf", size: "1.1 MB", status: "Processing" },
                  ].map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-2 rounded-lg bg-green-500/5">
                      <span className="text-xs text-green-300/70 truncate mr-2">{file.name}</span>
                      <Badge
                        className={`text-[10px] shrink-0 ${
                          file.status === "Verified"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {file.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity feed */}
            <Card className="glass border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-100">Recent Activity</CardTitle>
                <CardDescription className="text-green-500/50 text-xs">Latest platform events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-2">
                    <div className={`mt-0.5 shrink-0 ${activity.status === "success" ? "text-green-400" : "text-amber-400"}`}>
                      {activity.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-green-200/70 leading-tight">{activity.msg}</p>
                      <p className="text-[10px] text-green-600/50 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* What-If Simulator Teaser */}
          <Card className="glass border-green-500/20 gradient-card">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-green-200">What-If AI Simulator</h3>
                  <p className="text-xs text-green-500/60 mt-0.5">
                    Project future emissions based on energy transitions and policy scenarios.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-400 text-black font-semibold shrink-0"
                onClick={() => window.location.href = "/simulator"}
              >
                Launch Simulator
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* === EMPTY STATE === */}
      {state === "empty" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
            <CloudUpload className="w-10 h-10 text-green-500/40" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">No data yet</h2>
          <p className="text-sm text-green-400/50 max-w-md mb-8">
            Upload your first emissions dataset to start monitoring your carbon footprint and
            generating AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-green-500 hover:bg-green-400 text-black font-semibold">
              <Upload className="w-4 h-4 mr-2" />
              Upload First Dataset
            </Button>
            <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
              View Sample Data
            </Button>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4 w-full max-w-lg">
            {[
              { title: "Upload CSV/Excel", desc: "Drag & drop facility logs", icon: Upload },
              { title: "Connect API", desc: "Real-time data streaming", icon: Zap },
              { title: "Manual Entry", desc: "Add emissions manually", icon: Factory },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <div key={opt.title} className="p-4 rounded-xl glass border border-green-900/30 hover:border-green-500/20 cursor-pointer transition-all">
                  <Icon className="w-5 h-5 text-green-500/50 mb-2" />
                  <p className="text-sm font-semibold text-green-200">{opt.title}</p>
                  <p className="text-xs text-green-500/40 mt-0.5">{opt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === PROCESSING STATE === */}
      {state === "processing" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-green-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">AI Processing</h2>
          <p className="text-sm text-green-400/50 max-w-md mb-8">
            Our AI engine is analyzing your emissions data and generating predictive insights...
          </p>
          <div className="w-full max-w-sm space-y-3">
            {[
              { label: "Parsing facility data", done: true },
              { label: "Running compliance checks", done: true },
              { label: "Generating AI predictions", done: false, active: true },
              { label: "Building offset recommendations", done: false },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3 p-3 rounded-xl glass border border-green-900/30">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                ) : step.active ? (
                  <div className="w-4 h-4 rounded-full border-2 border-t-green-400 border-green-500/20 animate-spin shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-green-600/40 shrink-0" />
                )}
                <span className={`text-sm ${step.done ? "text-green-300/70 line-through" : step.active ? "text-green-300" : "text-green-600/40"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-green-600/40 mt-6">Estimated time: ~2 minutes</p>
        </div>
      )}

      {/* === ERROR STATE === */}
      {state === "error" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Data Error Detected</h2>
          <p className="text-sm text-green-400/50 max-w-md mb-8">
            We encountered issues processing your latest emissions dataset. Please review and
            reupload with corrected data.
          </p>
          <div className="w-full max-w-md p-4 rounded-xl bg-red-500/8 border border-red-500/20 mb-6 text-left">
            <p className="text-sm font-semibold text-red-300 mb-2">Errors found (3)</p>
            {[
              "Row 47: Missing Scope 2 electricity data for Pune facility",
              "Row 112: Invalid unit — expected tCO₂, got 'kg'",
              "Column 'transport_fuel' contains non-numeric values",
            ].map((err) => (
              <div key={err} className="flex gap-2 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300/70">{err}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-red-500 hover:bg-red-400 text-white font-semibold">
              <Upload className="w-4 h-4 mr-2" />
              Reupload Corrected File
            </Button>
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Download Error Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
