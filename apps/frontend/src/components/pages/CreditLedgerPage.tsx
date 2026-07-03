"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollText, RefreshCw, Download, Leaf, Flame, ArrowUpDown, ShoppingCart, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { getCreditLedger, getPortfolioSummary, applyCreditsToEmissions, retireByQuantity } from "@/lib/api/marketplace";
import { cn } from "@/lib/utils";

const EVENT_META: Record<string, { label: string; color: string; icon: any; badgeCls: string }> = {
  ISSUED: {
    label: "Issued",
    color: "text-emerald-500",
    icon: CheckCircle2,
    badgeCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  APPLIED: {
    label: "Applied to Emissions",
    color: "text-blue-500",
    icon: Leaf,
    badgeCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  RETIRED: {
    label: "Retired (Permanent)",
    color: "text-purple-500",
    icon: Flame,
    badgeCls: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  SOLD: {
    label: "Sold",
    color: "text-amber-500",
    icon: ShoppingCart,
    badgeCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  PENDING_TRANSFER: {
    label: "Pending Transfer",
    color: "text-muted-foreground",
    icon: ArrowUpDown,
    badgeCls: "bg-muted text-muted-foreground",
  },
};

export function CreditLedgerPage() {
  const tokens = useAppSelector((s) => s.auth.tokens);
  const orgId = tokens?.organization_ids?.[0] || tokens?.organization_id || "";

  const [ledger, setLedger] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [searchSerial, setSearchSerial] = useState("");

  // Pagination state
  const [ledgerCount, setLedgerCount] = useState(0);
  const [ledgerOffset, setLedgerOffset] = useState(0);
  const ledgerLimit = 10;

  // Apply dialog
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyQty, setApplyQty] = useState("10");
  const [applyLoading, setApplyLoading] = useState(false);

  // Retire dialog
  const [retireOpen, setRetireOpen] = useState(false);
  const [retireQty, setRetireQty] = useState("10");
  const [retireLoading, setRetireLoading] = useState(false);

  const fetchData = async (offsetVal: number = ledgerOffset) => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [ledgerRes, portfolioData] = await Promise.all([
        getCreditLedger(orgId, ledgerLimit, offsetVal).catch(() => ({ ledger: [], total: 0 })),
        getPortfolioSummary(orgId).catch(() => null),
      ]);
      setLedger(ledgerRes.ledger || []);
      setLedgerCount(ledgerRes.total || 0);
      setPortfolio(portfolioData);
    } catch {
      toast.error("Failed to load credit ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(ledgerOffset);
  }, [orgId, ledgerOffset]);

  const filteredLedger = ledger.filter((entry) => {
    const typeMatch = filterType === "ALL" || entry.event_type === filterType;
    const searchMatch = !searchSerial || entry.serial_number?.toLowerCase().includes(searchSerial.toLowerCase());
    return typeMatch && searchMatch;
  });

  const handleApply = async () => {
    const qty = parseInt(applyQty);
    if (!qty || qty <= 0) return;
    setApplyLoading(true);
    try {
      const res = await applyCreditsToEmissions(orgId, qty);
      toast.success(`${res.applied_count} credits applied! Net Carbon Position reduced by ${res.tco2e_offset} tCO₂e.`);
      setApplyOpen(false);
      setApplyQty("10");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to apply credits.");
    } finally {
      setApplyLoading(false);
    }
  };

  const handleRetire = async () => {
    const qty = parseInt(retireQty);
    if (!qty || qty <= 0) return;
    if (!confirm(`Permanently retire ${qty} credits? This cannot be undone.`)) return;
    setRetireLoading(true);
    try {
      const res = await retireByQuantity(orgId, qty);
      toast.success(`${res.retired_count} credits permanently retired.`);
      setRetireOpen(false);
      setRetireQty("10");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to retire credits.");
    } finally {
      setRetireLoading(false);
    }
  };

  const exportCSV = () => {
    const header = "Serial Number,Project Type,Vintage Year,Event Type,Status,tCO2e,Date\n";
    const rows = filteredLedger.map((e) =>
      `${e.serial_number},${e.project_type},${e.vintage_year},${e.event_type},${e.status},${e.tco2e},${e.created_at ? new Date(e.created_at).toLocaleDateString("en-IN") : "—"}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "credit_ledger.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-emerald-500" />
            Credit Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete audit trail of all carbon credit transactions
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs border-border text-muted-foreground"
            onClick={() => fetchData(ledgerOffset)}
            disabled={loading}
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs border-border"
            onClick={exportCSV}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button
            size="sm"
            className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={() => setApplyOpen(true)}
          >
            <Leaf className="w-3.5 h-3.5 mr-1.5" />
            Apply to Emissions
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 text-xs border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
            onClick={() => setRetireOpen(true)}
          >
            <Flame className="w-3.5 h-3.5 mr-1.5" />
            Retire Credits
          </Button>
        </div>
      </div>

      {/* Portfolio KPI strip */}
      {portfolio && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Available (ISSUED)", value: portfolio.issued ?? 0, color: "text-emerald-500", note: "Ready to trade or apply" },
            { label: "Applied to Emissions", value: portfolio.applied ?? 0, color: "text-blue-500", note: "Reducing net position" },
            { label: "Retired", value: portfolio.retired ?? 0, color: "text-purple-500", note: "Permanently burned" },
            { label: "Sold", value: portfolio.sold ?? 0, color: "text-amber-500", note: "Transferred out" },
            { label: "Total Offset tCO₂e", value: `${(portfolio.total_offset_tco2e ?? 0).toFixed(1)}`, color: "text-teal-500", note: "Applied + Retired" },
            { label: "Net Carbon Position", value: `${(portfolio.net_carbon_position_tco2e ?? 0).toFixed(1)} t`, color: portfolio.net_carbon_position_tco2e > 0 ? "text-red-500" : "text-emerald-500", note: portfolio.net_carbon_position_tco2e > 0 ? "Still emitting" : "Net zero ✓" },
          ].map((kpi) => (
            <Card key={kpi.label} className="glass border-border">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-xl font-black mt-0.5 ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{kpi.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ledger Table */}
      <Card className="glass border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search serial number..."
              value={searchSerial}
              onChange={(e) => setSearchSerial(e.target.value)}
              className="bg-card border-border text-xs h-9 max-w-64"
            />
            <Select value={filterType} onValueChange={(val) => setFilterType(val || "ALL")}>
              <SelectTrigger className="bg-card border-border text-xs h-9 w-48">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {["ALL", "ISSUED", "APPLIED", "RETIRED", "SOLD", "PENDING_TRANSFER"].map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">{t === "ALL" ? "All Events" : t.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground self-center ml-auto">
              Total: {ledgerCount} entries
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-xs text-muted-foreground">Loading ledger...</div>
          ) : filteredLedger.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No credit transactions found. Submit a project to earn credits.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground">Serial Number</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Event Type</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Project Type</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">tCO₂e</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Vintage</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedger.map((entry, idx) => {
                    const meta = EVENT_META[entry.event_type] || EVENT_META["ISSUED"];
                    const Icon = meta.icon;
                    return (
                      <TableRow key={entry.id || idx} className="border-border hover:bg-muted/30">
                        <TableCell className="text-xs font-mono text-muted-foreground max-w-[200px] truncate">
                          {entry.serial_number}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] flex items-center gap-1 w-fit ${meta.badgeCls}`}>
                            <Icon className="w-2.5 h-2.5" />
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground">{entry.project_type || "—"}</TableCell>
                        <TableCell className="text-xs text-right font-semibold text-foreground">
                          {Number(entry.tco2e || 1).toFixed(1)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{entry.vintage_year || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.created_at ? new Date(entry.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {ledgerCount > ledgerLimit && (
            <div className="flex items-center justify-between p-4 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground">
                Page {Math.floor(ledgerOffset / ledgerLimit) + 1} of {Math.ceil(ledgerCount / ledgerLimit)}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={ledgerOffset === 0}
                  onClick={() => {
                    const nextOffset = Math.max(0, ledgerOffset - ledgerLimit);
                    setLedgerOffset(nextOffset);
                    fetchData(nextOffset);
                  }}
                  className="h-7 text-xs border border-border text-foreground bg-card hover:bg-muted"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={ledgerOffset + ledgerLimit >= ledgerCount}
                  onClick={() => {
                    const nextOffset = ledgerOffset + ledgerLimit;
                    setLedgerOffset(nextOffset);
                    fetchData(nextOffset);
                  }}
                  className="h-7 text-xs border border-border text-foreground bg-card hover:bg-muted"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Credits Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-sm bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-black flex items-center gap-2">
              <Leaf className="w-4 h-4 text-blue-500" />
              Apply Credits to Emissions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
              Applying credits changes their status from <strong>ISSUED → APPLIED</strong> and immediately reduces your Net Carbon Position by 1 tCO₂e per credit. This does not permanently burn them — they become your internal offset certificates.
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-muted/30 rounded-lg p-3 border border-border">
                <p className="text-muted-foreground">Available Credits</p>
                <p className="font-black text-lg text-emerald-500">{portfolio?.issued ?? 0}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 border border-border">
                <p className="text-muted-foreground">Net Position</p>
                <p className="font-black text-lg text-foreground">{(portfolio?.net_carbon_position_tco2e ?? 0).toFixed(1)} t</p>
              </div>
            </div>
            {parseInt(applyQty) > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border">
                <span className="font-semibold text-foreground">{(portfolio?.net_carbon_position_tco2e ?? 0).toFixed(1)} t</span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-semibold text-emerald-500">
                  {Math.max(0, (portfolio?.net_carbon_position_tco2e ?? 0) - parseInt(applyQty)).toFixed(1)} t
                </span>
                <span>after applying {applyQty} credits</span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Quantity to Apply</Label>
              <Input
                type="number"
                min="1"
                max={portfolio?.issued ?? 9999}
                value={applyQty}
                onChange={(e) => setApplyQty(e.target.value)}
                className="bg-card border-border text-xs h-9"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8 border-border" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleApply}
              disabled={applyLoading}
            >
              {applyLoading ? "Applying..." : `Apply ${applyQty} Credits`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retire Credits Dialog */}
      <Dialog open={retireOpen} onOpenChange={setRetireOpen}>
        <DialogContent className="sm:max-w-sm bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-black flex items-center gap-2">
              <Flame className="w-4 h-4 text-purple-500" />
              Permanently Retire Credits
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
              Retiring credits is <strong>permanent and irreversible</strong>. Retired credits generate a public offset certificate and also reduce your Net Carbon Position.
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Quantity to Retire</Label>
              <Input
                type="number"
                min="1"
                max={portfolio?.issued ?? 9999}
                value={retireQty}
                onChange={(e) => setRetireQty(e.target.value)}
                className="bg-card border-border text-xs h-9"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8 border-border" onClick={() => setRetireOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleRetire}
              disabled={retireLoading}
            >
              {retireLoading ? "Retiring..." : `Retire ${retireQty} Credits`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
