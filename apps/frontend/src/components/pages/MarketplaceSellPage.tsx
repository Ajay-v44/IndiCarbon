"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrgCredits, submitMarketOrder, clearLastOrderResponse } from "@/store/marketplace-slice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Tag,
  TreePine,
  ArrowRight,
} from "lucide-react";

export function MarketplaceSellPage() {
  const dispatch = useAppDispatch();
  const { credits, status, lastOrderResponse } = useAppSelector((s) => s.marketplace);
  const { tokens } = useAppSelector((s) => s.auth);

  // Prefer organization_id from JWT; fall back to user_id for demo/testing
  const orgId = tokens?.organization_id ?? tokens?.user_id ?? "";

  const [sellVolume, setSellVolume] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [selectedCreditType, setSelectedCreditType] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (orgId) dispatch(fetchOrgCredits(orgId));
  }, [dispatch, orgId]);

  // Show order result toast when a new response arrives
  useEffect(() => {
    if (!lastOrderResponse) return;
    if (lastOrderResponse.matched && lastOrderResponse.trade) {
      const t = lastOrderResponse.trade;
      toast.success(
        `Trade settled immediately! ${t.quantity} credits sold @ ₹${t.price_per_unit}/tCO₂e`
      );
    } else if (!lastOrderResponse.matched) {
      toast.success(
        `Listing created (ID: ${lastOrderResponse.order_id?.substring(0, 8)}). Visible to buyers now.`
      );
    }
    dispatch(clearLastOrderResponse());
  }, [lastOrderResponse, dispatch]);

  const handleListForSale = async () => {
    const qty = parseInt(sellVolume, 10);
    const price = parseFloat(sellPrice);

    if (!sellVolume || !sellPrice || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
      toast.error("Please enter a valid volume and price.");
      return;
    }
    if (!selectedCreditType) {
      toast.error("Please select a credit type from your portfolio.");
      return;
    }
    if (!orgId) {
      toast.error("Organization ID not found. Please log in again.");
      return;
    }

    try {
      await dispatch(
        submitMarketOrder({
          organization_id: orgId,
          order_type: "SELL",
          quantity: qty,
          price_per_unit: price,
          project_type: selectedCreditType,
        })
      ).unwrap();
      setSellVolume("");
      setSellPrice("");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to list credits");
    }
  };

  // Group ISSUED credits by project_type for portfolio display
  // CarbonCredit shape from backend: { id, serial_number, vintage_year, project_type, status, current_owner_id }
  const groupedCredits = credits
    .filter((c) => c.status === "ISSUED")
    .reduce<Record<string, number>>((acc, credit) => {
      const type = credit.project_type ?? "Generic";
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    }, {});

  const estimatedTotal = (parseFloat(sellPrice) || 0) * (parseInt(sellVolume, 10) || 0);

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Tag className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Sell Carbon Credits</h1>
            <p className="text-sm text-muted-foreground">List your verified portfolio credits on the marketplace</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 text-white dark:text-black font-semibold"
          >
            Sell Credits
          </Button>
          <Link href="/marketplace/buy">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              Buy Credits
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portfolio selector */}
        <div className="md:col-span-2 space-y-4">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-base">Select Credits from Portfolio</CardTitle>
              <CardDescription className="text-xs">
                Only verified ISSUED credits can be listed on the public exchange.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === "loading" && (
                <p className="text-sm text-muted-foreground">Loading your portfolio...</p>
              )}
              {Object.keys(groupedCredits).length === 0 && status !== "loading" && (
                <p className="text-sm text-muted-foreground">No available credits in your portfolio to sell.</p>
              )}

              {Object.entries(groupedCredits).map(([type, count]) => {
                const isSelected = selectedCreditType === type;
                return (
                  <div
                    key={type}
                    onClick={() => setSelectedCreditType(type)}
                    className={`p-4 rounded-xl border ${
                      isSelected ? "border-teal-500 ring-1 ring-teal-500" : "border-border"
                    } bg-background/50 flex items-center gap-4 hover:border-teal-500/50 transition-all cursor-pointer`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                      <TreePine className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-foreground">{type}</h4>
                        <Badge
                          variant="outline"
                          className="text-[9px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 uppercase"
                        >
                          Verified
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Available to List</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">
                        {count} <span className="text-xs font-normal text-muted-foreground">tCO₂e</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Available Balance</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Listing details form */}
        <div className="space-y-4">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-base">Listing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Volume to Sell (tCO₂e)</label>
                <Input
                  type="number"
                  min={1}
                  value={sellVolume}
                  onChange={(e) => setSellVolume(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Asking Price (per tCO₂e)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Platform Fee (1.5%)</span>
                  <span className="text-xs text-foreground font-mono">
                    {estimatedTotal > 0 ? `₹${(estimatedTotal * 0.015).toFixed(2)}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-foreground">Estimated Total</span>
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400 font-mono">
                    ₹{estimatedTotal.toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handleListForSale}
                  disabled={!selectedCreditType || !sellVolume || !sellPrice || status === "loading"}
                  className="w-full bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 text-white dark:text-black font-semibold"
                >
                  List on Marketplace
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
