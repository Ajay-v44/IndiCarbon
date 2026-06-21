"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMarketBook } from "@/store/marketplace-slice";
import { submitProposal, resetActionStatus } from "@/store/proposals-slice";
import { fetchWallet } from "@/store/wallet-slice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MarketOrder } from "@/lib/api/types";
import {
  Globe,
  Search,
  ShieldCheck,
  Building2,
  TreePine,
  ArrowRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Minus,
  Send,
  FileText,
  History,
} from "lucide-react";

export function MarketplaceBuyPage() {
  const dispatch = useAppDispatch();
  const { marketBook, status } = useAppSelector((s) => s.marketplace);
  const { tokens } = useAppSelector((s) => s.auth);
  const { wallet } = useAppSelector((s) => s.wallet);
  const { actionStatus } = useAppSelector((s) => s.proposals);

  const orgId = tokens?.organization_id ?? tokens?.user_id ?? "";

  const [selectedOrder, setSelectedOrder] = useState<MarketOrder | null>(null);
  const [proposalQty, setProposalQty] = useState("1");
  const [proposalPrice, setProposalPrice] = useState("");
  const [buyerNote, setBuyerNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchMarketBook());
    if (orgId) dispatch(fetchWallet(orgId));
  }, [dispatch, orgId]);

  useEffect(() => {
    if (actionStatus === "succeeded") {
      toast.success("Proposal submitted! The seller will review your offer.");
      setSelectedOrder(null);
      setProposalQty("1");
      setProposalPrice("");
      setBuyerNote("");
      dispatch(resetActionStatus());
    }
  }, [actionStatus, dispatch]);

  const openProposalDialog = (order: MarketOrder) => {
    setSelectedOrder(order);
    setProposalPrice(String(order.price_per_unit));
    setProposalQty("1");
    setBuyerNote("");
  };

  const handleSubmitProposal = async () => {
    if (!selectedOrder || !orgId) return;
    const qty = parseInt(proposalQty, 10);
    const price = parseFloat(proposalPrice);

    if (isNaN(qty) || qty <= 0 || qty > selectedOrder.quantity) {
      toast.error(`Quantity must be between 1 and ${selectedOrder.quantity}.`);
      return;
    }
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    const totalCost = qty * price;
    if (wallet && wallet.balance < totalCost) {
      toast.error(
        `Insufficient balance. You need ₹${totalCost.toLocaleString()} but have ₹${wallet.balance.toLocaleString()}.`
      );
      return;
    }

    try {
      await dispatch(
        submitProposal({
          sell_order_id: selectedOrder.id,
          buyer_org_id: orgId,
          quantity: qty,
          proposed_price: price,
          buyer_note: buyerNote || undefined,
        })
      ).unwrap();
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to submit proposal.");
    }
  };

  const proposedPrice = parseFloat(proposalPrice) || 0;
  const askingPrice = selectedOrder?.price_per_unit ?? 0;
  const priceDiff = askingPrice > 0 ? ((proposedPrice - askingPrice) / askingPrice) * 100 : 0;
  const proposalTotal = (parseInt(proposalQty, 10) || 0) * proposedPrice;

  const totalVolume = marketBook.reduce((acc, o) => acc + o.quantity, 0);
  const avgPrice =
    marketBook.length > 0
      ? marketBook.reduce((acc, o) => acc + o.price_per_unit, 0) / marketBook.length
      : 0;

  const filtered = searchTerm
    ? marketBook.filter(
        (o) =>
          (o.project_type ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.id.includes(searchTerm)
      )
    : marketBook;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Carbon Marketplace</h1>
            <p className="text-sm text-muted-foreground">Browse listings and submit purchase proposals</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/marketplace/orders">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              My Orders
            </Button>
          </Link>
          <Link href="/marketplace/wallet">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              Wallet
            </Button>
          </Link>
          <Link href="/marketplace/sell">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              Sell Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-border border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{wallet ? wallet.balance.toLocaleString() : "0"}
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg Asking Price</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{avgPrice.toFixed(0)}
              <span className="text-xs font-normal text-muted-foreground/60 ml-1">/ tCO₂e</span>
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Volume Available</p>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {totalVolume}
              <span className="text-xs font-normal text-muted-foreground/60 ml-1">tCO₂e</span>
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Open Listings</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {marketBook.length}
              <span className="text-xs font-normal text-muted-foreground/60 ml-1">orders</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      <Card className="glass border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-foreground">Available Listings</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Submit a proposal with your price — sellers review and accept or reject
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs w-64 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {status === "loading" && (
              <p className="text-sm text-muted-foreground">Loading market book...</p>
            )}
            {filtered.length === 0 && status !== "loading" && (
              <p className="text-sm text-muted-foreground">No open sell orders on the market.</p>
            )}

            {filtered.map((order) => (
              <Card
                key={order.id}
                className="bg-background/50 border-border hover:border-teal-500/30 transition-all"
              >
                <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-teal-500/10 flex items-center justify-center">
                        <TreePine className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                          {order.project_type ?? "Generic Carbon Credit"}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span>Seller: {order.organization_id.substring(0, 8)}…</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] whitespace-nowrap">
                      <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                      Verified
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Volume</p>
                      <p className="text-sm font-medium text-foreground">
                        {order.quantity} <span className="text-[10px] text-muted-foreground">tCO₂e</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Vintage</p>
                      <p className="text-sm font-medium text-foreground">{order.vintage_year ?? "Any"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Asking Price</p>
                      <p className="text-sm font-bold text-teal-600">₹{order.price_per_unit}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-1">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {order.id.substring(0, 8)}
                    </span>
                    <Button
                      onClick={() => openProposalDialog(order)}
                      disabled={status === "loading"}
                      size="sm"
                      className="bg-foreground text-background hover:bg-foreground/90 h-8 px-4 text-xs"
                    >
                      <Send className="w-3 h-3 mr-1.5" />
                      Make Proposal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proposal Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-600" />
              Submit Purchase Proposal
            </DialogTitle>
            <DialogDescription>
              Propose a price for{" "}
              <span className="font-semibold text-foreground">
                {selectedOrder?.project_type ?? "Carbon Credits"}
              </span>
              . The seller will review and accept or reject your offer.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5 py-2">
              {/* Listing summary */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Seller Asking Price</span>
                  <span className="font-bold text-foreground">₹{selectedOrder.price_per_unit}/tCO₂e</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Available Volume</span>
                  <span className="font-medium text-foreground">{selectedOrder.quantity} tCO₂e</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Vintage</span>
                  <span className="font-medium text-foreground">{selectedOrder.vintage_year ?? "Any"}</span>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Quantity (tCO₂e)</label>
                <Input
                  type="number"
                  min={1}
                  max={selectedOrder.quantity}
                  value={proposalQty}
                  onChange={(e) => setProposalQty(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>

              {/* Your Proposed Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Your Proposed Price (per tCO₂e)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={proposalPrice}
                    onChange={(e) => setProposalPrice(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 bg-background border-border text-foreground"
                  />
                </div>
                {proposedPrice > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {priceDiff > 0 ? (
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    ) : priceDiff < 0 ? (
                      <TrendingDown className="w-3 h-3 text-orange-500" />
                    ) : (
                      <Minus className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span
                      className={`text-[11px] font-medium ${
                        priceDiff > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : priceDiff < 0
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {priceDiff > 0 ? "+" : ""}
                      {priceDiff.toFixed(1)}% vs asking price
                    </span>
                  </div>
                )}
              </div>

              {/* Optional note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Note to Seller (optional)</label>
                <Input
                  value={buyerNote}
                  onChange={(e) => setBuyerNote(e.target.value)}
                  placeholder="e.g. Interested in bulk purchase, repeat buyer..."
                  className="bg-background border-border text-foreground text-xs"
                />
              </div>

              {/* Totals */}
              <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">₹{proposalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-foreground">Total Commitment</span>
                  <span className="text-teal-600 dark:text-teal-400">₹{proposalTotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Amount will be debited from your wallet only when the seller accepts.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <DialogClose>
              <Button variant="outline" size="sm" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmitProposal}
              disabled={actionStatus === "loading"}
              size="sm"
              className="bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 text-white dark:text-black font-semibold"
            >
              {actionStatus === "loading" ? "Submitting..." : "Submit Proposal"}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
