"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWallet, fetchWalletTransactions } from "@/store/wallet-slice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WalletTransactionResponse } from "@/lib/api/types";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Globe,
  CreditCard,
  RefreshCw,
  Plus,
  Minus,
  ArrowRight,
  History,
} from "lucide-react";

const TXN_CONFIG: Record<string, { label: string; icon: typeof ArrowDownLeft; color: string }> = {
  ADMIN_CREDIT: { label: "Funds Added", icon: Plus, color: "text-emerald-600 dark:text-emerald-400" },
  ADMIN_DEBIT: { label: "Funds Withdrawn", icon: Minus, color: "text-red-600 dark:text-red-400" },
  TRADE_DEBIT: { label: "Purchase Payment", icon: ArrowUpRight, color: "text-red-600 dark:text-red-400" },
  TRADE_CREDIT: { label: "Sale Revenue", icon: ArrowDownLeft, color: "text-emerald-600 dark:text-emerald-400" },
  REFUND: { label: "Refund", icon: RefreshCw, color: "text-blue-600 dark:text-blue-400" },
};

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

function TransactionRow({ txn }: { txn: WalletTransactionResponse }) {
  const config = TXN_CONFIG[txn.txn_type] ?? {
    label: txn.txn_type,
    icon: CreditCard,
    color: "text-muted-foreground",
  };
  const Icon = config.icon;
  const isCredit = txn.amount > 0;

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-border/50 last:border-0">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isCredit ? "bg-emerald-500/10" : "bg-red-500/10"
        }`}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{config.label}</p>
          {txn.reference_id && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Ref: {txn.reference_id.substring(0, 8)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{txn.description ?? "—"}</p>
      </div>

      <div className="text-right shrink-0">
        <p
          className={`text-sm font-bold tabular-nums ${
            isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {isCredit ? "+" : ""}₹{Math.abs(txn.amount).toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground tabular-nums">
          Bal: ₹{txn.balance_after.toLocaleString()}
        </p>
      </div>

      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-[10px] text-muted-foreground">{formatDate(txn.created_at)}</p>
      </div>
    </div>
  );
}

export function MarketplaceWalletPage() {
  const dispatch = useAppDispatch();
  const { wallet, transactions, status } = useAppSelector((s) => s.wallet);
  const { tokens } = useAppSelector((s) => s.auth);
  const orgId = tokens?.organization_id ?? tokens?.user_id ?? "";

  useEffect(() => {
    if (orgId) {
      dispatch(fetchWallet(orgId));
      dispatch(fetchWalletTransactions(orgId));
    }
  }, [dispatch, orgId]);

  const totalCredits = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const totalDebits = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Wallet</h1>
            <p className="text-sm text-muted-foreground">Balance, transactions, and payment history</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/marketplace/buy">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              Marketplace
            </Button>
          </Link>
          <Link href="/marketplace/orders">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              My Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <p className="text-xs text-muted-foreground font-medium">Available Balance</p>
            </div>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{wallet ? wallet.balance.toLocaleString() : "0"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{wallet?.currency ?? "INR"}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
              <p className="text-xs text-muted-foreground font-medium">Total Credits</p>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              +₹{totalCredits.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Income & deposits</p>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-red-500" />
              <p className="text-xs text-muted-foreground font-medium">Total Debits</p>
            </div>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">
              -₹{totalDebits.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Purchases & withdrawals</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="glass border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                Transaction History
              </CardTitle>
              <CardDescription className="text-xs">
                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} recorded
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (orgId) {
                  dispatch(fetchWallet(orgId));
                  dispatch(fetchWalletTransactions(orgId));
                }
              }}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {status === "loading" && transactions.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading transactions...</p>
          )}

          {transactions.length === 0 && status !== "loading" && (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No transactions yet</p>
              <p className="text-xs text-muted-foreground">
                Transactions appear here when you buy or sell credits.
              </p>
            </div>
          )}

          <div className="divide-y-0">
            {transactions.map((txn) => (
              <TransactionRow key={txn.id} txn={txn} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
