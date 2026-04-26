"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Vault,
  TreePine,
  Wind,
  Sun,
  Droplets,
  ArrowUpRight,
  Download,
  ShieldCheck,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const portfolioStats = [
  { label: "Total Credits", value: "12,450", unit: "tCO₂e", delta: "+340 this month", color: "text-green-400" },
  { label: "Portfolio Value", value: "₹1.86Cr", unit: "", delta: "+12.3% MTD", color: "text-emerald-400" },
  { label: "Verified Projects", value: "23", unit: "active", delta: "3 pending", color: "text-teal-400" },
  { label: "Avg. Price", value: "₹1,495", unit: "/ tCO₂e", delta: "+₹45 today", color: "text-blue-400" },
];

const creditTypes = [
  { type: "Forestry & REDD+", icon: TreePine, count: 4820, value: "₹72.3L", verified: true, color: "text-green-400", bg: "bg-green-500/10" },
  { type: "Renewable Energy", icon: Wind, count: 3640, value: "₹54.6L", verified: true, color: "text-teal-400", bg: "bg-teal-500/10" },
  { type: "Solar Projects", icon: Sun, count: 2190, value: "₹32.9L", verified: true, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { type: "Blue Carbon (Wetlands)", icon: Droplets, count: 1800, value: "₹27L", verified: false, color: "text-blue-400", bg: "bg-blue-500/10" },
];

const transactions = [
  { id: "TXN-2401", type: "Purchase", project: "Sundarbans Mangrove REDD+", amount: "200 tCO₂e", value: "₹2.99L", date: "24 Apr 2026", status: "Verified" },
  { id: "TXN-2398", type: "Sale", project: "Rajasthan Wind Farm", amount: "150 tCO₂e", value: "₹2.24L", date: "22 Apr 2026", status: "Settled" },
  { id: "TXN-2390", type: "Purchase", project: "Punjab Agro-forestry", amount: "500 tCO₂e", value: "₹7.48L", date: "18 Apr 2026", status: "Verified" },
  { id: "TXN-2385", type: "Retire", project: "Gujarat Solar Parks", amount: "80 tCO₂e", value: "—", date: "15 Apr 2026", status: "Retired" },
  { id: "TXN-2380", type: "Purchase", project: "Western Ghats Biodiversity", amount: "300 tCO₂e", value: "₹4.49L", date: "11 Apr 2026", status: "Pending" },
];

export function PortfolioPage() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
            <Vault className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Carbon Vault</h1>
            <p className="text-sm text-green-400/60">Your verified carbon portfolio & digital ledger</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-green-900/50 text-green-400/70 hover:bg-green-500/10">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm" className="bg-green-500 hover:bg-green-400 text-black font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
            Trade Credits
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioStats.map((stat) => (
          <Card key={stat.label} className="glass border-green-900/30">
            <CardContent className="p-4">
              <p className="text-xs text-green-400/50 mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
                {stat.unit && <span className="text-xs font-normal text-green-400/40 ml-1">{stat.unit}</span>}
              </p>
              <p className="text-xs text-green-500/40 mt-1">{stat.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credit types */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {creditTypes.map((ct) => {
          const Icon = ct.icon;
          return (
            <Card key={ct.type} className="glass border-green-900/30 hover:border-green-500/20 transition-all cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${ct.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${ct.color}`} />
                  </div>
                  {ct.verified ? (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">
                      <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                      Pending
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-green-400/50 mb-1">{ct.type}</p>
                <p className={`text-xl font-black ${ct.color}`}>{ct.count.toLocaleString()}</p>
                <p className="text-xs text-green-500/40">tCO₂e · {ct.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transactions Table */}
      <Card className="glass border-green-900/30">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-green-100">Transaction Ledger</CardTitle>
              <CardDescription className="text-green-500/50 text-xs">Immutable blockchain-verified transaction history</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500/40" />
                <Input
                  placeholder="Search..."
                  className="pl-8 h-8 text-xs w-44 bg-green-950/40 border-green-900/50 text-green-100 placeholder:text-green-600/40"
                />
              </div>
              <Button variant="outline" size="sm" className="border-green-900/50 text-green-400/60 hover:bg-green-500/10 h-8">
                <Filter className="w-3 h-3 mr-1" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-900/30">
                  <th className="text-left text-xs text-green-500/50 pb-3 pr-4">TX ID</th>
                  <th className="text-left text-xs text-green-500/50 pb-3 pr-4">Type</th>
                  <th className="text-left text-xs text-green-500/50 pb-3 pr-4">Project</th>
                  <th className="text-right text-xs text-green-500/50 pb-3 pr-4">Credits</th>
                  <th className="text-right text-xs text-green-500/50 pb-3 pr-4">Value</th>
                  <th className="text-left text-xs text-green-500/50 pb-3 pr-4">Date</th>
                  <th className="text-left text-xs text-green-500/50 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-900/20">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-green-500/3 transition-colors">
                    <td className="py-3 pr-4 text-xs font-mono text-green-400/60">{tx.id}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={`text-[10px] ${
                          tx.type === "Purchase"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : tx.type === "Sale"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        }`}
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-green-200/70">{tx.project}</td>
                    <td className="py-3 pr-4 text-xs text-green-300 text-right font-medium">{tx.amount}</td>
                    <td className="py-3 pr-4 text-xs text-green-300 text-right">{tx.value}</td>
                    <td className="py-3 pr-4 text-xs text-green-500/50">{tx.date}</td>
                    <td className="py-3">
                      <Badge
                        className={`text-[10px] ${
                          tx.status === "Verified"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : tx.status === "Settled"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : tx.status === "Retired"
                            ? "bg-gray-500/10 text-gray-400 border-gray-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
