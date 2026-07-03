"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { getWalletTransactions } from "@/lib/api/wallet";
import { getPortfolioSummary, listCredits, getCreditLedger } from "@/lib/api/marketplace";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Vault,
  TreePine,
  Wind,
  Sun,
  Droplets,
  ArrowUpRight,
  Download,
  ShieldCheck,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function PortfolioPage() {
  const tokens = useAppSelector((state) => state.auth.tokens);
  const orgId = tokens?.organization_id ?? tokens?.user_id ?? "";

  const [summary, setSummary] = useState<any | null>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [creditLedger, setCreditLedger] = useState<any[]>([]);
  const [txList, setTxList] = useState<any[]>([]);
  
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  
  const [ledgerTab, setLedgerTab] = useState<"credits" | "cash">("credits");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!orgId) return;

    setLoadingSummary(true);
    getPortfolioSummary(orgId)
      .then((data) => setSummary(data))
      .catch((err) => console.error("Failed to fetch portfolio summary:", err))
      .finally(() => setLoadingSummary(false));

    setLoadingCredits(true);
    listCredits(orgId)
      .then((data) => setCredits(data || []))
      .catch((err) => console.error("Failed to fetch credits list:", err))
      .finally(() => setLoadingCredits(false));

    setLoadingLedger(true);
    getCreditLedger(orgId)
      .then((res) => setCreditLedger(res?.ledger || []))
      .catch((err) => console.error("Failed to fetch credit ledger:", err))
      .finally(() => setLoadingLedger(false));

    setLoadingTx(true);
    getWalletTransactions(orgId)
      .then((data) => setTxList(data || []))
      .catch((err) => console.error("Failed to fetch wallet transactions:", err))
      .finally(() => setLoadingTx(false));
  }, [orgId]);

  // Group ISSUED credits by project_type for portfolio display
  const creditTypes = Object.values(
    credits.reduce<Record<string, { type: string; count: number; value: number }>>((acc, c) => {
      const type = c.project_type || "Forestry & REDD+";
      if (!acc[type]) {
        acc[type] = { type, count: 0, value: 0 };
      }
      if (c.status === "ISSUED") {
        const qty = c.quantity || 1;
        acc[type].count += qty;
        acc[type].value += qty * 1500; // estimated ₹1,500 value per tCO₂e
      }
      return acc;
    }, {})
  ).map((ct) => {
    let Icon = TreePine;
    let bg = "bg-emerald-500/10";
    let color = "text-emerald-600 dark:text-emerald-400";
    
    if (ct.type.toLowerCase().includes("wind")) {
      Icon = Wind;
      bg = "bg-teal-500/10";
      color = "text-teal-600 dark:text-teal-400";
    } else if (ct.type.toLowerCase().includes("solar")) {
      Icon = Sun;
      bg = "bg-amber-500/10";
      color = "text-amber-600 dark:text-amber-400";
    } else if (
      ct.type.toLowerCase().includes("blue") ||
      ct.type.toLowerCase().includes("wetland") ||
      ct.type.toLowerCase().includes("droplets")
    ) {
      Icon = Droplets;
      bg = "bg-blue-500/10";
      color = "text-blue-600 dark:text-blue-400";
    }

    return {
      type: ct.type,
      icon: Icon,
      count: ct.count,
      value: ct.value >= 100000 ? `₹${(ct.value / 100000).toFixed(1)}L` : `₹${ct.value.toLocaleString()}`,
      verified: true,
      color,
      bg,
    };
  });

  const portfolioStats = [
    {
      label: "Total Credits",
      value: summary?.total_credits_owned?.toLocaleString() ?? "0",
      unit: "tCO₂e",
      delta: "Gross portfolio inventory",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Available Credits",
      value: summary?.credits_available?.toLocaleString() ?? "0",
      unit: "tCO₂e",
      delta: "Available for listing or retirement",
      color: "text-teal-600 dark:text-teal-400",
    },
    {
      label: "Offsets Applied",
      value: summary?.total_offset_tco2e?.toLocaleString() ?? "0",
      unit: "tCO₂e",
      delta: `Applied: ${summary?.credits_applied_tco2e ?? 0} · Retired: ${summary?.credits_retired_tco2e ?? 0}`,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Net Carbon Position",
      value: summary?.net_carbon_position_tco2e?.toLocaleString() ?? "0",
      unit: "tCO₂e",
      delta: `Gross Emissions: ${summary?.gross_emissions_tco2e ?? 0} tCO₂e`,
      color: summary?.net_carbon_position_tco2e > 0 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400",
    },
  ];

  // Filtering based on search query
  const filteredCreditLedger = creditLedger.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.project_type || "").toLowerCase().includes(term) ||
      (item.serial_number || "").toLowerCase().includes(term) ||
      (item.event_type || "").toLowerCase().includes(term)
    );
  });

  const filteredTxList = txList.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.description || "").toLowerCase().includes(term) ||
      (item.txn_type || "").toLowerCase().includes(term) ||
      (item.id || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Vault className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Carbon Vault</h1>
            <p className="text-sm text-muted-foreground">Your verified carbon portfolio & digital ledger</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Link href="/marketplace/buy">
            <Button size="sm" className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-black font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
              Trade Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingSummary ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="glass border-border animate-pulse">
                <CardContent className="p-4 h-28 flex flex-col justify-between">
                  <div className="h-3 w-1/2 bg-muted rounded"></div>
                  <div className="h-6 w-2/3 bg-muted rounded"></div>
                  <div className="h-3 w-3/4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))
        ) : (
          portfolioStats.map((stat) => (
            <Card key={stat.label} className="glass border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {stat.value}
                  {stat.unit && <span className="text-xs font-normal text-muted-foreground/60 ml-1">{stat.unit}</span>}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1.5">{stat.delta}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Credit types */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Asset Distribution</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingCredits ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="glass border-border animate-pulse">
                  <CardContent className="p-4 h-28 flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-muted"></div>
                    <div className="flex-1 ml-3 space-y-2">
                      <div className="h-3 w-2/3 bg-muted rounded"></div>
                      <div className="h-3 w-1/3 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : creditTypes.length === 0 ? (
            <Card className="col-span-full border-border bg-muted/20 p-6 text-center">
              <p className="text-xs text-muted-foreground">No active carbon credit assets in your vault.</p>
            </Card>
          ) : (
            creditTypes.map((ct) => {
              const Icon = ct.icon;
              return (
                <Card key={ct.type} className="glass border-border hover:border-emerald-500/30 transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${ct.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${ct.color}`} />
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                        <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 truncate">{ct.type}</p>
                    <p className={`text-xl font-black ${ct.color}`}>{ct.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground/60">tCO₂e · Est: {ct.value}</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="glass border-border">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base text-foreground">Vault Ledgers</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Audit-ready transaction records for carbon credits and wallet cash
              </CardDescription>
            </div>
            
            {/* Tabs & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex p-0.5 rounded-lg bg-muted border border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLedgerTab("credits")}
                  className={`h-7 px-3 text-xs rounded-md font-semibold transition-all ${
                    ledgerTab === "credits"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Carbon Credits
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLedgerTab("cash")}
                  className={`h-7 px-3 text-xs rounded-md font-semibold transition-all ${
                    ledgerTab === "cash"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cash Wallet (INR)
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${ledgerTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs w-48 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            {ledgerTab === "credits" ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4">Event ID</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4">Event</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4">Serial Number</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4">Project Type</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4">Vintage</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4 text-right">Quantity (tCO₂e)</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pl-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loadingLedger ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-xs text-muted-foreground">
                        Loading carbon credit ledger...
                      </td>
                    </tr>
                  ) : filteredCreditLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-xs text-muted-foreground">
                        No credit transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredCreditLedger.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4 text-xs font-mono text-muted-foreground">
                          {item.id.slice(0, 8)}...
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={`text-[10px] uppercase font-bold tracking-wider ${
                              item.event_type === "ISSUED"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : item.event_type === "APPLIED"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                : item.event_type === "RETIRED"
                                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                                : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            }`}
                          >
                            {item.event_type}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs font-mono text-foreground">
                          {item.serial_number || "—"}
                        </td>
                        <td className="py-3 pr-4 text-xs text-foreground font-medium">
                          {item.project_type || "Generic"}
                        </td>
                        <td className="py-3 pr-4 text-xs text-foreground">
                          {item.vintage_year || "—"}
                        </td>
                        <td className="py-3 pr-4 text-xs text-foreground text-right font-black">
                          {item.tco2e?.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground pl-4">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4">TX ID</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4">Type</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4">Description</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4 text-right">Amount</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pr-4 text-right">Balance After</th>
                    <th className="text-xs text-muted-foreground font-semibold pb-3 pl-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loadingTx ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-xs text-muted-foreground">
                        Loading cash ledger...
                      </td>
                    </tr>
                  ) : filteredTxList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-xs text-muted-foreground">
                        No wallet transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTxList.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4 text-xs font-mono text-muted-foreground">
                          {tx.id.slice(0, 8)}...
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={`text-[10px] font-bold ${
                              tx.txn_type === "CREDIT"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : tx.txn_type === "DEBIT"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                            }`}
                          >
                            {tx.txn_type}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs text-foreground max-w-xs truncate">
                          {tx.description || "—"}
                        </td>
                        <td className="py-3 pr-4 text-xs text-foreground text-right font-medium">
                          ₹{tx.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 pr-4 text-xs text-foreground text-right font-medium">
                          ₹{tx.balance_after?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground pl-4">
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

