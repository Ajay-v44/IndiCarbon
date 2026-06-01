import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
