"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { getWalletTransactions } from "@/lib/api/wallet";

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

const portfolioStats = [
  { label: "Total Credits", value: "12,450", unit: "tCO₂e", delta: "+340 this month", color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Portfolio Value", value: "₹1.86Cr", unit: "", delta: "+12.3% MTD", color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Verified Projects", value: "23", unit: "active", delta: "3 pending", color: "text-teal-600 dark:text-teal-400" },
  { label: "Avg. Price", value: "₹1,495", unit: "/ tCO₂e", delta: "+₹45 today", color: "text-blue-600 dark:text-blue-400" },
];

const creditTypes = [
  { type: "Forestry & REDD+", icon: TreePine, count: 4820, value: "₹72.3L", verified: true, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { type: "Renewable Energy", icon: Wind, count: 3640, value: "₹54.6L", verified: true, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
  { type: "Solar Projects", icon: Sun, count: 2190, value: "₹32.9L", verified: true, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  { type: "Blue Carbon (Wetlands)", icon: Droplets, count: 1800, value: "₹27L", verified: false, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
];

export function PortfolioPage() {
  const tokens = useAppSelector((state) => state.auth.tokens);
  const orgId = tokens?.organization_id;

  const [txList, setTxList] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoadingTx(true);
    getWalletTransactions(orgId)
      .then((data) => {
        setTxList(data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch transactions:", err);
      })
      .finally(() => {
        setLoadingTx(false);
      });
  }, [orgId]);

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
        {portfolioStats.map((stat) => (
          <Card key={stat.label} className="glass border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
                {stat.unit && <span className="text-xs font-normal text-muted-foreground/60 ml-1">{stat.unit}</span>}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">{stat.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credit types */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {creditTypes.map((ct) => {
          const Icon = ct.icon;
          return (
            <Card key={ct.type} className="glass border-border hover:border-emerald-500/30 transition-all cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${ct.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${ct.color}`} />
                  </div>
                  {ct.verified ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                      <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                      Pending
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{ct.type}</p>
                <p className={`text-xl font-black ${ct.color}`}>{ct.count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground/60">tCO₂e · {ct.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transactions Table */}
      <Card className="glass border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-foreground">Transaction Ledger</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">Audit-ready transaction history</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8 h-8 text-xs w-44 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted h-8">
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
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-semibold pb-3 pr-4">TX ID</th>
                  <th className="text-left text-xs text-muted-foreground font-semibold pb-3 pr-4">Type</th>
                  <th className="text-left text-xs text-muted-foreground font-semibold pb-3 pr-4">Description</th>
                  <th className="text-right text-xs text-muted-foreground font-semibold pb-3 pr-4">Amount</th>
                  <th className="text-right text-xs text-muted-foreground font-semibold pb-3 pr-4">Balance After</th>
                  <th className="text-left text-xs text-muted-foreground font-semibold pb-3 pl-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loadingTx ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-xs text-muted-foreground">
                      Loading transaction history...
                    </td>
                  </tr>
                ) : txList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-xs text-muted-foreground">
                      No transactions found for this account.
                    </td>
                  </tr>
                ) : (
                  txList.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 text-xs font-mono text-muted-foreground">
                        {tx.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={`text-[10px] ${
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
                        ₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 pr-4 text-xs text-foreground text-right font-medium">
                        ₹{tx.balance_after.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
