import { CreditLedgerPage } from "@/components/pages/CreditLedgerPage";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/layout/AuthGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Ledger | IndiCarbon — Carbon Credit Transaction History",
  description: "Full audit trail of all carbon credit events: issued, applied to emissions, retired, and sold.",
};

export default function Page() {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <CreditLedgerPage />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
