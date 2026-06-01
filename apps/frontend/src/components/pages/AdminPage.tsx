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
  Search,
  Activity,
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
    <div className="space-y-6 max-w-[1400px] mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground">Command Center</h1>
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Super Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Enterprise sales & platform intelligence</p>
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Enterprises", value: "342", delta: "+12 this month", icon: Building2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Monthly ARR", value: "₹71L", delta: "+12.8% MoM", icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Active Users", value: "12,840", delta: "+480 MAU", icon: Users, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
          { label: "Platform Health", value: "99.97%", delta: "Uptime SLA", icon: Activity, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="glass border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/60" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{kpi.delta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="overview" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background text-xs">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="enterprises" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background text-xs">
            Enterprises
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background text-xs">
            Sales Pipeline
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground">MRR Growth</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Monthly Recurring Revenue (₹ Lakhs)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis dataKey="month" tick={{ fill: "currentColor", fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "currentColor", fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--card-foreground)", fontSize: "12px" }} />
                    <Bar dataKey="mrr" fill="#10b981" radius={[4, 4, 0, 0]} name="MRR (₹L)" opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-foreground">ARR Trajectory</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Annualized Recurring Revenue (₹ Lakhs)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis dataKey="month" tick={{ fill: "currentColor", fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "currentColor", fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--card-foreground)", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="arr" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }} name="ARR (₹L)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Plan breakdown */}
          <Card className="glass border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { plan: "Enterprise+", count: 28, rev: "₹28.4L/mo", color: "bg-emerald-500" },
                  { plan: "Enterprise", count: 148, rev: "₹32.9L/mo", color: "bg-emerald-400" },
                  { plan: "Pro", count: 166, rev: "₹9.7L/mo", color: "bg-teal-500" },
                ].map((p) => (
                  <div key={p.plan} className="p-4 rounded-xl bg-muted border border-border">
                    <div className={`w-2 h-2 rounded-full ${p.color} mb-3`} />
                    <p className="text-sm font-semibold text-foreground">{p.plan}</p>
                    <p className="text-xl font-black text-foreground">{p.count}</p>
                    <p className="text-xs text-muted-foreground">{p.rev}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enterprises Tab */}
        <TabsContent value="enterprises" className="mt-4">
          <Card className="glass border-border">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base text-foreground">Enterprise Accounts</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search enterprise..."
                    className="pl-8 h-8 text-xs w-52 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Enterprise", "Plan", "Credits (tCO₂e)", "MRR", "Users", "Risk", "Status"].map((h) => (
                        <th key={h} className="text-left text-xs text-muted-foreground font-semibold pb-3 pr-4 last:pr-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {enterprises.map((e) => (
                      <tr key={e.name} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {e.name[0]}
                            </div>
                            <span className="text-sm text-foreground font-medium">{e.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">{e.plan}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs text-foreground font-medium">{e.credits}</td>
                        <td className="py-3 pr-4 text-xs text-foreground">{e.mrr}</td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{e.users}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={`text-[10px] ${e.risk === "Low"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : e.risk === "Medium"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              }`}
                          >
                            {e.risk}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge
                            className={`text-[10px] ${e.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : e.status === "Trial"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
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
            <Card key={deal.company} className="glass border-border hover:border-emerald-500/30 transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {deal.company[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{deal.company}</p>
                      <p className="text-xs text-muted-foreground">{deal.stage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{deal.value}</p>
                      <p className="text-xs text-muted-foreground">Est. ACV</p>
                    </div>
                    <div className="w-20">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Win prob.</span>
                        <span>{deal.probability}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:bg-muted text-xs h-8">
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
