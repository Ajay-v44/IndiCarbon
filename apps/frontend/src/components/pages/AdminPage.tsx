"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
} from "recharts";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  UserCog,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  BarChart2,
  Crown,
} from "lucide-react";

const revenueData = [
  { month: "Oct", mrr: 42, arr: 504 },
  { month: "Nov", mrr: 48, arr: 576 },
  { month: "Dec", mrr: 51, arr: 612 },
  { month: "Jan", mrr: 58, arr: 696 },
  { month: "Feb", mrr: 63, arr: 756 },
  { month: "Mar", mrr: 71, arr: 852 },
];

const enterprises = [
  { name: "Tata Steel Ltd.", plan: "Enterprise", credits: "12,450", mrr: "₹4.8L", status: "Active", users: 24, risk: "Low" },
  { name: "Reliance Industries", plan: "Enterprise+", credits: "28,300", mrr: "₹9.2L", status: "Active", users: 67, risk: "Low" },
  { name: "Mahindra Group", plan: "Enterprise", credits: "8,120", mrr: "₹3.2L", status: "Active", users: 18, risk: "Low" },
  { name: "ONGC Petro", plan: "Pro", credits: "2,400", mrr: "₹96K", status: "Trial", users: 5, risk: "Medium" },
  { name: "Adani Ports", plan: "Enterprise", credits: "15,800", mrr: "₹6.1L", status: "Active", users: 31, risk: "Low" },
  { name: "SpiceJet Aviation", plan: "Pro", credits: "1,200", mrr: "₹48K", status: "At-Risk", users: 3, risk: "High" },
];

const salesPipeline = [
  { company: "Hindustan Zinc", value: "₹5.4L", stage: "Demo Scheduled", probability: 70 },
  { company: "JSW Steel", value: "₹11.2L", stage: "Proposal Sent", probability: 45 },
  { company: "Vedanta Resources", value: "₹8.8L", stage: "Negotiation", probability: 80 },
  { company: "BHEL India", value: "₹3.2L", stage: "Discovery", probability: 25 },
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
            <Crown className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Command Center</h1>
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Super Admin</Badge>
            </div>
            <p className="text-sm text-green-400/60">Enterprise sales & platform intelligence</p>
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Enterprises", value: "342", delta: "+12 this month", icon: Building2, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Monthly ARR", value: "₹71L", delta: "+12.8% MoM", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Active Users", value: "12,840", delta: "+480 MAU", icon: Users, color: "text-teal-400", bg: "bg-teal-500/10" },
          { label: "Platform Health", value: "99.97%", delta: "Uptime SLA", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="glass border-green-900/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <TrendingUp className="w-3.5 h-3.5 text-green-500/40" />
                </div>
                <p className="text-xs text-green-400/50 mb-1">{kpi.label}</p>
                <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-green-500/40 mt-0.5">{kpi.delta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-green-950/40 border border-green-900/40">
          <TabsTrigger value="overview" className="data-[state=active]:bg-green-500/15 data-[state=active]:text-green-400 text-green-500/50 text-xs">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="enterprises" className="data-[state=active]:bg-green-500/15 data-[state=active]:text-green-400 text-green-500/50 text-xs">
            Enterprises
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-green-500/15 data-[state=active]:text-green-400 text-green-500/50 text-xs">
            Sales Pipeline
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-100">MRR Growth</CardTitle>
                <CardDescription className="text-green-500/50 text-xs">Monthly Recurring Revenue (₹ Lakhs)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: "#4d7a5a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4d7a5a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--card-foreground)" }} />
                    <Bar dataKey="mrr" fill="#22c55e" radius={[4, 4, 0, 0]} name="MRR (₹L)" opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-100">ARR Trajectory</CardTitle>
                <CardDescription className="text-green-500/50 text-xs">Annualized Recurring Revenue (₹ Lakhs)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: "#4d7a5a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4d7a5a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--card-foreground)" }} />
                    <Line type="monotone" dataKey="arr" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }} name="ARR (₹L)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Plan breakdown */}
          <Card className="glass border-green-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-green-100">Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { plan: "Enterprise+", count: 28, rev: "₹28.4L/mo", color: "bg-green-400" },
                  { plan: "Enterprise", count: 148, rev: "₹32.9L/mo", color: "bg-emerald-400" },
                  { plan: "Pro", count: 166, rev: "₹9.7L/mo", color: "bg-teal-400" },
                ].map((p) => (
                  <div key={p.plan} className="p-4 rounded-xl bg-green-500/5 border border-green-900/30">
                    <div className={`w-2 h-2 rounded-full ${p.color} mb-3`} />
                    <p className="text-sm font-bold text-green-200">{p.plan}</p>
                    <p className="text-xl font-black text-white">{p.count}</p>
                    <p className="text-xs text-green-500/50">{p.rev}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enterprises Tab */}
        <TabsContent value="enterprises" className="mt-4">
          <Card className="glass border-green-900/30">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base text-green-100">Enterprise Accounts</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500/40" />
                  <Input
                    placeholder="Search enterprise..."
                    className="pl-8 h-8 text-xs w-52 bg-green-950/40 border-green-900/50 text-green-100 placeholder:text-green-600/40"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-900/30">
                      {["Enterprise", "Plan", "Credits (tCO₂e)", "MRR", "Users", "Risk", "Status"].map((h) => (
                        <th key={h} className="text-left text-xs text-green-500/50 pb-3 pr-4 last:pr-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-900/20">
                    {enterprises.map((e) => (
                      <tr key={e.name} className="hover:bg-green-500/3 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center text-[10px] font-bold text-green-400">
                              {e.name[0]}
                            </div>
                            <span className="text-sm text-green-200 font-medium">{e.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">{e.plan}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs text-green-300 font-medium">{e.credits}</td>
                        <td className="py-3 pr-4 text-xs text-green-300">{e.mrr}</td>
                        <td className="py-3 pr-4 text-xs text-green-400/60">{e.users}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={`text-[10px] ${e.risk === "Low"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : e.risk === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}
                          >
                            {e.risk}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge
                            className={`text-[10px] ${e.status === "Active"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : e.status === "Trial"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}
                          >
                            {e.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="mt-4 space-y-4">
          {salesPipeline.map((deal) => (
            <Card key={deal.company} className="glass border-green-900/30 hover:border-green-500/20 transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">
                      {deal.company[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-200">{deal.company}</p>
                      <p className="text-xs text-green-500/50">{deal.stage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-300">{deal.value}</p>
                      <p className="text-xs text-green-500/40">Est. ACV</p>
                    </div>
                    <div className="w-20">
                      <div className="flex justify-between text-[10px] text-green-500/50 mb-1">
                        <span>Win prob.</span>
                        <span>{deal.probability}%</span>
                      </div>
                      <div className="h-1.5 bg-green-950/60 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs h-8">
                      View Deal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
