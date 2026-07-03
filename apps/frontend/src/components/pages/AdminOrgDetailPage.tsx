"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  ChevronLeft,
  RefreshCw,
  Wallet,
  Leaf,
  Activity,
  Flame,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  FolderOpen,
  ArrowUpDown,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { listOrganizations } from "@/lib/api/auth";
import { getWallet, getWalletTransactions } from "@/lib/api/wallet";
import { getPortfolioSummary, listCredits, listProjects, listProposals } from "@/lib/api/marketplace";
import { cn } from "@/lib/utils";

export function AdminOrgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params?.id as string;

  const [org, setOrg] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrgDetails = async () => {
    if (!orgId) return;
    try {
      const orgs = await listOrganizations();
      const currentOrg = orgs.find((o) => o.id === orgId);
      if (!currentOrg) {
        toast.error("Organization not found.");
        router.push("/admin");
        return;
      }
      setOrg(currentOrg);

      const [walletData, portfolioData, creditsData, projectsData, proposalsData, txData] = await Promise.all([
        getWallet(orgId).catch(() => null),
        getPortfolioSummary(orgId).catch(() => null),
        listCredits(orgId).catch(() => []),
        listProjects(orgId).catch(() => []),
        listProposals(orgId).catch(() => []),
        getWalletTransactions(orgId).catch(() => []),
      ]);

      setWallet(walletData);
      setPortfolio(portfolioData);
      setCredits(creditsData);
      setProjects(projectsData);
      setProposals(proposalsData);
      setTransactions(txData);
    } catch (err: any) {
      toast.error("Failed to load organization detail.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrgDetails();
  }, [orgId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrgDetails();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-muted-foreground">Loading organization audit trail...</p>
      </div>
    );
  }

  if (!org) return null;

  return (
    <div className="space-y-6 text-foreground">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin")}
          className="border-border text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="w-4 h-4 mr-1.5" />
          Back to Command Center
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-border"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", refreshing && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/40 p-5 rounded-2xl border border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg font-black text-emerald-600 dark:text-emerald-400">
            {org.legal_name[0]}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">{org.legal_name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sector: <span className="font-semibold text-foreground">{org.industry_sector || "Unassigned"}</span> · CIN: <span className="font-mono">{org.registration_number || "−"}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold uppercase py-1">
            Subscription: {org.subscription_status}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Wallet Balance",
            value: `₹${(wallet?.balance ?? 0).toLocaleString()}`,
            icon: Wallet,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Gross Emissions",
            value: portfolio ? `${(portfolio.gross_emissions_tco2e ?? 0).toFixed(1)} t` : "0.0 t",
            icon: Activity,
            color: "text-red-500",
            bg: "bg-red-500/10",
          },
          {
            label: "Credits Owned",
            value: portfolio ? `${portfolio.total_credits_owned ?? 0} t` : "0 t",
            icon: Leaf,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Net Carbon Position",
            value: portfolio ? `${(portfolio.net_carbon_position_tco2e ?? 0).toFixed(1)} t` : "0.0 t",
            icon: Flame,
            color: portfolio?.net_carbon_position_tco2e > 0 ? "text-amber-500" : "text-emerald-500",
            bg: portfolio?.net_carbon_position_tco2e > 0 ? "bg-amber-500/10" : "bg-emerald-500/10",
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="glass border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="bg-muted border border-border p-1">
          <TabsTrigger value="compliance" className="text-xs font-semibold py-1.5 px-3">
            Emissions & Compliance
          </TabsTrigger>
          <TabsTrigger value="credits" className="text-xs font-semibold py-1.5 px-3">
            Carbon Credits ({credits.reduce((sum, c) => sum + (c.quantity || 1), 0).toLocaleString()})
          </TabsTrigger>
          <TabsTrigger value="wallet" className="text-xs font-semibold py-1.5 px-3">
            Wallet & Ledger ({transactions.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-xs font-semibold py-1.5 px-3">
            Carbon Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="proposals" className="text-xs font-semibold py-1.5 px-3">
            OTC Proposals ({proposals.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab content: Compliance & Emissions */}
        <TabsContent value="compliance" className="mt-4 outline-none">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Emissions Inventory Profile</CardTitle>
                <CardDescription className="text-xs">Summary of emissions verified for carbon accounting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Gross Annual Emissions (tCO₂e)</span>
                    <span className="font-semibold">{portfolio?.gross_emissions_tco2e?.toFixed(1) ?? "0.0"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-500 font-semibold">Applied Offsets (tCO₂e)</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      -{portfolio?.credits_applied_tco2e?.toFixed(1) ?? "0.0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-500 font-semibold">Retired Offsets (tCO₂e)</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      -{portfolio?.credits_retired_tco2e?.toFixed(1) ?? "0.0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-border pt-2">
                    <span className="font-bold">Net Carbon Position (tCO₂e)</span>
                    <span className={cn(
                      "font-black text-sm",
                      portfolio?.net_carbon_position_tco2e > 0 ? "text-red-500 animate-pulse" : "text-emerald-500"
                    )}>
                      {portfolio?.net_carbon_position_tco2e?.toFixed(1) ?? "0.0"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-xl border border-border">
                  <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                    <span>Offset Coverage</span>
                    <span>{portfolio?.offset_coverage_pct ?? 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-card border border-border rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, portfolio?.offset_coverage_pct ?? 0)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Compliance Status</CardTitle>
                <CardDescription className="text-xs">SEBI BRSR and CPCB compliance indicator</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-between h-[160px] pb-4">
                <div className="flex items-center gap-2">
                  {portfolio?.net_carbon_position_tco2e === 0 ? (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Net Zero Aligned</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Carbon Offset Pending</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To achieve BRSR Net-Zero alignment, this organization requires an additional{" "}
                  <strong className="text-foreground">{portfolio?.credits_needed_for_net_zero ?? 0}</strong> verified carbon credits.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab content: Carbon Credits */}
        <TabsContent value="credits" className="mt-4 outline-none">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Credit Registry Inventory</CardTitle>
              <CardDescription className="text-xs">List of carbon credit tokens held by this organization</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {credits.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">No carbon credits in vault.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-4">Serial Number</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Project Type</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Vintage</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right">Quantity</TableHead>
                      <TableHead className="text-xs font-semibold py-3 pr-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30 text-xs">
                    {credits.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="py-2.5 pl-4 font-mono font-semibold text-muted-foreground">{c.serial_number}</TableCell>
                        <TableCell className="py-2.5 text-foreground">{c.project_type || "—"}</TableCell>
                        <TableCell className="py-2.5 text-muted-foreground">{c.vintage_year}</TableCell>
                        <TableCell className="py-2.5 text-right font-mono font-bold text-foreground">{(c.quantity || 1).toLocaleString()}</TableCell>
                        <TableCell className="py-2.5 pr-4">
                          <Badge className={cn(
                            "text-[8px] font-bold uppercase",
                            c.status === "ISSUED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            c.status === "APPLIED" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                            "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          )}>
                            {c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content: Wallet & Ledger */}
        <TabsContent value="wallet" className="mt-4 outline-none">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Wallet Audit Ledger</CardTitle>
              <CardDescription className="text-xs">Complete cash flow and balance history for organization</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">No cash transactions recorded.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-4">Date</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Type</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right">Amount</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right">Balance After</TableHead>
                      <TableHead className="text-xs font-semibold py-3 pr-4">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30 text-xs">
                    {transactions.map((txn) => {
                      const isCredit = txn.amount > 0;
                      return (
                        <TableRow key={txn.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="py-2.5 pl-4 text-muted-foreground font-mono">
                            {txn.created_at ? new Date(txn.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Badge className={cn(
                              "text-[8px] font-bold uppercase",
                              txn.txn_type === "ADMIN_CREDIT" ? "bg-emerald-500/10 text-emerald-500" :
                              txn.txn_type === "TRADE_CREDIT" ? "bg-blue-500/10 text-blue-500" :
                              "bg-destructive/10 text-destructive"
                            )}>
                              {txn.txn_type.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 text-right font-semibold font-mono">
                            <span className={isCredit ? "text-emerald-500" : "text-destructive"}>
                              {isCredit ? "+" : "-"}₹{Math.abs(txn.amount).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 text-right font-mono text-muted-foreground">₹{txn.balance_after.toLocaleString()}</TableCell>
                          <TableCell className="py-2.5 pr-4 text-muted-foreground max-w-[200px] truncate">{txn.description || "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content: Carbon Projects */}
        <TabsContent value="projects" className="mt-4 outline-none">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Submitted Carbon Projects</CardTitle>
              <CardDescription className="text-xs">Projects submitted by this organization for carbon credit issuance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {projects.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">No carbon projects submitted.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-4">Project Name</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Type</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Registry</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right">Est. Reduction</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30 text-xs">
                    {projects.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="py-2.5 pl-4 font-semibold text-foreground">{p.name}</TableCell>
                        <TableCell className="py-2.5 text-muted-foreground">{p.project_type}</TableCell>
                        <TableCell className="py-2.5 text-muted-foreground">{p.registry || "—"}</TableCell>
                        <TableCell className="py-2.5 text-right font-semibold">{p.estimated_annual_reduction_tco2e?.toLocaleString() ?? "—"} tCO₂e</TableCell>
                        <TableCell className="py-2.5">
                          <Badge className={cn(
                            "text-[8px] font-bold uppercase",
                            p.status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-500" :
                            p.status === "PENDING" ? "bg-amber-500/10 text-amber-500" :
                            "bg-destructive/10 text-destructive"
                          )}>
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content: Proposals */}
        <TabsContent value="proposals" className="mt-4 outline-none">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold">OTC Proposals</CardTitle>
              <CardDescription className="text-xs">Carbon credit trading proposals involving this organization</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {proposals.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">No active or past OTC proposals.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-4">ID</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Role</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right">Quantity</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right">Price per Credit</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30 text-xs">
                    {proposals.map((p) => {
                      const isSeller = p.seller_id === orgId;
                      return (
                        <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="py-2.5 pl-4 font-mono text-muted-foreground">{p.id.substring(0, 8)}…</TableCell>
                          <TableCell className="py-2.5 font-semibold text-foreground">
                            {isSeller ? (
                              <span className="text-amber-600 dark:text-amber-400">Seller</span>
                            ) : (
                              <span className="text-blue-500">Buyer</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 text-right font-semibold">{p.credits_quantity} credits</TableCell>
                          <TableCell className="py-2.5 text-right font-mono font-semibold">₹{p.price_per_credit}</TableCell>
                          <TableCell className="py-2.5">
                            <Badge className={cn(
                              "text-[8px] font-bold uppercase",
                              p.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" :
                              p.status === "PENDING" ? "bg-amber-500/10 text-amber-500" :
                              "bg-destructive/10 text-destructive"
                            )}>
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
