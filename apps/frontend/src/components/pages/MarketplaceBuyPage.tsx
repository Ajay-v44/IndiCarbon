"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMarketBook, submitMarketOrder, clearLastOrderResponse } from "@/store/marketplace-slice";
import { fetchWallet } from "@/store/wallet-slice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

export function MarketplaceBuyPage() {
  const dispatch = useAppDispatch();
  const { marketBook, status, lastOrderResponse } = useAppSelector((s) => s.marketplace);
  const { tokens } = useAppSelector((s) => s.auth);
  const { wallet } = useAppSelector((s) => s.wallet);

  // Prefer organization_id from the JWT; fall back to user_id for demo/testing
  const orgId = tokens?.organization_id ?? tokens?.user_id ?? "";

  useEffect(() => {
    dispatch(fetchMarketBook());
    if (orgId) dispatch(fetchWallet(orgId));
  }, [dispatch, orgId]);

  // Show trade result toast whenever a new order response arrives
  useEffect(() => {
    if (!lastOrderResponse) return;
    if (lastOrderResponse.matched && lastOrderResponse.trade) {
      const t = lastOrderResponse.trade;
      toast.success(
        `Trade settled! ${t.quantity} credits @ ₹${t.price_per_unit}/tCO₂e — Total ₹${t.total_value.toLocaleString()}`
      );
    } else if (!lastOrderResponse.matched) {
      toast.info(`Order placed on book (ID: ${lastOrderResponse.order_id?.substring(0, 8)}). Waiting for a seller.`);
    }
    dispatch(clearLastOrderResponse());
  }, [lastOrderResponse, dispatch]);

  const handleBuy = async (order: MarketOrder) => {
    if (!orgId) {
      toast.error("Organization ID not found. Please log in again.");
      return;
    }
    const cost = order.price_per_unit * 1;
    if (wallet && wallet.balance < cost) {
      toast.error(`Insufficient wallet balance. You need ₹${cost.toLocaleString()} but have ₹${wallet.balance.toLocaleString()}.`);
      return;
    }
    try {
      await dispatch(
        submitMarketOrder({
          organization_id: orgId,
          order_type: "BUY",
          quantity: 1,
          price_per_unit: order.price_per_unit,
          vintage_year: order.vintage_year,
          project_type: order.project_type,
        })
      ).unwrap();
      dispatch(fetchMarketBook());
      dispatch(fetchWallet(orgId));
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to buy credits");
    }
  };

  const totalVolume = marketBook.reduce((acc, o) => acc + o.quantity, 0);

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
            <p className="text-sm text-muted-foreground">Browse and purchase verified carbon credits</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/marketplace/sell">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              Sell Credits
            </Button>
          </Link>
          <Button size="sm" className="bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 text-white dark:text-black font-semibold">
            Buy Credits
          </Button>
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
            <p className="text-xs text-muted-foreground mb-1">Global Avg Price</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹1,420<span className="text-xs font-normal text-muted-foreground/60 ml-1">/ tCO₂e</span>
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Volume Available</p>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {totalVolume}<span className="text-xs font-normal text-muted-foreground/60 ml-1">tCO₂e</span>
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Open Listings</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {marketBook.length}<span className="text-xs font-normal text-muted-foreground/60 ml-1">orders</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      <Card className="glass border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-foreground">Available Projects</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">Live open market SELL orders</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-8 h-8 text-xs w-64 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {status === "loading" && (
              <p className="text-sm text-muted-foreground">Loading market book...</p>
            )}
            {marketBook.length === 0 && status !== "loading" && (
              <p className="text-sm text-muted-foreground">No open sell orders on the market.</p>
            )}

            {marketBook.map((order) => (
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
                          <span>Org: {order.organization_id.substring(0, 8)}…</span>
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
                      <p className="text-[10px] text-muted-foreground uppercase">Price</p>
                      <p className="text-sm font-bold text-teal-600">₹{order.price_per_unit}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-1">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {order.id.substring(0, 8)}
                    </span>
                    <Button
                      onClick={() => handleBuy(order)}
                      disabled={status === "loading"}
                      size="sm"
                      className="bg-foreground text-background hover:bg-foreground/90 h-8 px-4 text-xs"
                    >
                      Buy 1 Credit
                      <ArrowRight className="w-3 h-3 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
