"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Leaf,
  FlaskConical,
  Vault,
  ShieldCheck,
  Menu,
  Bell,
  User,
  ChevronDown,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { href: "/simulator",  label: "AI Simulator",    icon: FlaskConical },
  { href: "/portfolio",  label: "Carbon Vault",    icon: Vault },
  { href: "/mission",    label: "Mission",         icon: Leaf },
  { href: "/admin",      label: "Command Center",  icon: ShieldCheck },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="h-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

        {/* Logo – only shown when sidebar is hidden */}
        <Link href="/" className="flex items-center gap-2 shrink-0 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[15px] text-gray-900 tracking-tight">
            IndiCarbon <span className="text-green-600">AI</span>
          </span>
        </Link>

        {/* Desktop nav (hidden on desktop – sidebar handles it; shown only if sidebar absent) */}
        <div className="hidden md:flex lg:hidden items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-green-50 text-green-700 border border-green-200 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Spacer so right items stay right on desktop */}
        <div className="flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
            <div className="status-dot-green" />
            <span className="text-xs font-semibold text-green-700">Live</span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-600 rounded-full" />
          </Button>

          {/* Avatar */}
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
            <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AV</span>
            </div>
            <span className="text-sm font-medium text-gray-800">Ajay</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl" />
              }
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-white border-gray-200 p-0">
              <div className="p-5 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shadow-sm">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-[15px] text-gray-900 tracking-tight block leading-none">IndiCarbon</span>
                    <span className="text-[10px] text-green-600 font-semibold tracking-widest uppercase block mt-0.5">AI Platform</span>
                  </div>
                </Link>
              </div>

              <div className="p-3 space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        active
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", active ? "text-green-600" : "text-gray-400")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">AV</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Ajay Verma</p>
                    <p className="text-xs text-gray-500">Enterprise Plan</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
