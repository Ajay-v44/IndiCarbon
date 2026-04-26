"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Leaf,
  FlaskConical,
  BarChart2,
  Vault,
  ShieldCheck,
  Menu,
  Bell,
  User,
  ChevronDown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/simulator", label: "AI Simulator", icon: FlaskConical },
  { href: "/portfolio", label: "Carbon Vault", icon: Vault },
  { href: "/mission", label: "Mission", icon: Leaf },
  { href: "/admin", label: "Command Center", icon: ShieldCheck },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-green-900/30">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center glow-green-sm">
              <Leaf className="w-4 h-4 text-green-400" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              <span className="text-gradient">IndiCarbon</span>
              <span className="text-green-600/60 font-light"> AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-green-500/15 text-green-400 border border-green-500/20"
                      : "text-green-100/60 hover:text-green-300 hover:bg-green-500/8"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="status-dot-green" />
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-green-400/60 hover:text-green-400 hover:bg-green-500/10">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-400 rounded-full" />
            </Button>

            {/* Avatar */}
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-green-100/70 hover:text-green-300 hover:bg-green-500/10">
              <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-green-400" />
              </div>
              <span className="text-sm">Ajay</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-green-400/70 hover:text-green-400">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-[#0c1610] border-green-900/30 p-0">
                <div className="p-6 border-b border-green-900/30">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="font-bold text-lg">
                      <span className="text-gradient">IndiCarbon</span>
                      <span className="text-green-600/60 font-light"> AI</span>
                    </span>
                  </Link>
                </div>
                <div className="p-4 space-y-1">
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
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "text-green-100/60 hover:text-green-300 hover:bg-green-500/8"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-900/30">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <User className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-100">Ajay Verma</p>
                      <p className="text-xs text-green-500/60">Enterprise Plan</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
