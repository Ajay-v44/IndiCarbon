"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSentProposals,
  fetchReceivedProposals,
  doAcceptProposal,
  doRejectProposal,
  doCancelProposal,
  clearLastAcceptResult,
  resetActionStatus,
} from "@/store/proposals-slice";
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
import { ProposalResponse } from "@/lib/api/types";
import {
  FileText,
  Send,
  Inbox,
  Check,
  X,
  Clock,
  ArrowLeft,
  Ban,
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  Globe,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <Badge className={`text-[10px] ${config.className}`}>
      {status === "PENDING" && <Clock className="w-2.5 h-2.5 mr-1" />}
      {status === "ACCEPTED" && <Check className="w-2.5 h-2.5 mr-1" />}
      {status === "REJECTED" && <X className="w-2.5 h-2.5 mr-1" />}
      {status === "CANCELLED" && <Ban className="w-2.5 h-2.5 mr-1" />}
      {config.label}
    </Badge>
  );
}

function PriceDiffIndicator({ asking, proposed }: { asking: number; proposed: number }) {
  const diff = asking > 0 ? ((proposed - asking) / asking) * 100 : 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${
        diff > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : diff < 0
          ? "text-orange-600 dark:text-orange-400"
          : "text-muted-foreground"
      }`}
    >
      {diff > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : diff < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
      {diff > 0 ? "+" : ""}
      {diff.toFixed(1)}%
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MarketplaceOrdersPage() {
  const dispatch = useAppDispatch();
  const { sent, received, status, actionStatus, lastAcceptResult } = useAppSelector(
    (s) => s.proposals
  );
  const { tokens } = useAppSelector((s) => s.auth);
  const orgId = tokens?.organization_id ?? tokens?.user_id ?? "";

  const [tab, setTab] = useState<"sent" | "received">("sent");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (orgId) {
      dispatch(fetchSentProposals(orgId));
      dispatch(fetchReceivedProposals(orgId));
    }
  }, [dispatch, orgId]);

  useEffect(() => {
    if (lastAcceptResult) {
      const t = lastAcceptResult.trade;
      toast.success(
        `Trade settled! ${t.quantity} credits @ ₹${t.price_per_unit}/tCO₂e — Total ₹${t.total_value.toLocaleString()}`
      );
      dispatch(clearLastAcceptResult());
      if (orgId) {
        dispatch(fetchReceivedProposals(orgId));
        dispatch(fetchWallet(orgId));
      }
    }
  }, [lastAcceptResult, dispatch, orgId]);

  const handleAccept = async (proposalId: string) => {
    try {
      await dispatch(doAcceptProposal(proposalId)).unwrap();
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to accept proposal.");
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      await dispatch(
        doRejectProposal({ proposalId: rejectingId, reason: rejectionReason || undefined })
      ).unwrap();
      toast.success("Proposal rejected.");
      setRejectingId(null);
      setRejectionReason("");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to reject proposal.");
    }
  };

  const handleCancel = async (proposalId: string) => {
    try {
      await dispatch(doCancelProposal(proposalId)).unwrap();
      toast.success("Proposal cancelled.");
    } catch (err: unknown) {
      toast.error(typeof err === "string" ? err : "Failed to cancel proposal.");
    }
  };

  const pendingSentCount = sent.filter((p) => p.status === "PENDING").length;
  const pendingReceivedCount = received.filter((p) => p.status === "PENDING").length;
  const proposals = tab === "sent" ? sent : received;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">My Orders</h1>
            <p className="text-sm text-muted-foreground">Track proposals, negotiations, and trade settlements</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/marketplace/buy">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              Marketplace
            </Button>
          </Link>
          <Link href="/marketplace/wallet">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              Wallet
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab("sent")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            tab === "sent"
              ? "text-teal-600 dark:text-teal-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Send className="w-3.5 h-3.5" />
            Proposals Sent
            {pendingSentCount > 0 && (
              <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingSentCount}
              </span>
            )}
          </div>
          {tab === "sent" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-t" />
          )}
        </button>
        <button
          onClick={() => setTab("received")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            tab === "received"
              ? "text-teal-600 dark:text-teal-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Inbox className="w-3.5 h-3.5" />
            Proposals Received
            {pendingReceivedCount > 0 && (
              <span className="bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingReceivedCount}
              </span>
            )}
          </div>
          {tab === "received" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-t" />
          )}
        </button>
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {status === "loading" && (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading proposals...</p>
        )}
        {proposals.length === 0 && status !== "loading" && (
          <Card className="glass border-border">
            <CardContent className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                {tab === "sent" ? (
                  <Send className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Inbox className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {tab === "sent" ? "No proposals sent yet" : "No proposals received yet"}
              </p>
              <p className="text-xs text-muted-foreground">
                {tab === "sent"
                  ? "Browse the marketplace and submit proposals to buy credits."
                  : "When buyers propose on your listings, they'll appear here."}
              </p>
              {tab === "sent" && (
                <Link href="/marketplace/buy">
                  <Button size="sm" className="mt-4 bg-teal-600 text-white hover:bg-teal-700">
                    Browse Marketplace
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {proposals.map((proposal) => (
          <Card key={proposal.id} className="glass border-border hover:border-border/80 transition-all">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Proposal details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={proposal.status} />
                    <span className="text-xs text-muted-foreground font-mono">
                      #{proposal.id.substring(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(proposal.created_at)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Project</p>
                      <p className="text-sm font-medium text-foreground">
                        {proposal.project_type ?? "Generic"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Quantity</p>
                      <p className="text-sm font-medium text-foreground">
                        {proposal.quantity} <span className="text-[10px] text-muted-foreground">tCO₂e</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Asking → Proposed
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{proposal.asking_price}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          ₹{proposal.proposed_price}
                        </span>
                        <PriceDiffIndicator asking={proposal.asking_price} proposed={proposal.proposed_price} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Total Value</p>
                      <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                        ₹{proposal.total_value.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {proposal.buyer_note && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                      &ldquo;{proposal.buyer_note}&rdquo;
                    </p>
                  )}

                  {proposal.status === "REJECTED" && proposal.rejection_reason && (
                    <div className="flex items-start gap-2 text-xs bg-red-500/5 border border-red-500/20 rounded-md p-2">
                      <X className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-red-600 dark:text-red-400">
                        Rejection reason: {proposal.rejection_reason}
                      </span>
                    </div>
                  )}

                  {proposal.status === "ACCEPTED" && proposal.trade_id && (
                    <div className="flex items-start gap-2 text-xs bg-emerald-500/5 border border-emerald-500/20 rounded-md p-2">
                      <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Trade settled — ID: {proposal.trade_id.substring(0, 8)}
                      </span>
                    </div>
                  )}

                  {proposal.responded_at && (
                    <p className="text-[10px] text-muted-foreground">
                      Responded: {formatDate(proposal.responded_at)}
                    </p>
                  )}
                </div>

                {/* Right: Action buttons */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {tab === "received" && proposal.status === "PENDING" && (
                    <>
                      <Button
                        onClick={() => handleAccept(proposal.id)}
                        disabled={actionStatus === "loading"}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => setRejectingId(proposal.id)}
                        disabled={actionStatus === "loading"}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {tab === "sent" && proposal.status === "PENDING" && (
                    <Button
                      onClick={() => handleCancel(proposal.id)}
                      disabled={actionStatus === "loading"}
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:text-foreground text-xs"
                    >
                      <Ban className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <X className="w-4 h-4" />
              Reject Proposal
            </DialogTitle>
            <DialogDescription>
              Provide an optional reason so the buyer understands why.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Price too low, need minimum ₹1500/tCO₂e..."
              className="bg-background border-border text-foreground text-xs"
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose>
              <Button variant="outline" size="sm" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleReject}
              disabled={actionStatus === "loading"}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
