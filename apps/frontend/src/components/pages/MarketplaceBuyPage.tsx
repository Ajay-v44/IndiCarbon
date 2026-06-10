"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Globe,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  TreePine,
  Wind,
  Sun,
  Droplets,
  ArrowRight
} from "lucide-react";

const marketplaceListings = [
  { 
    id: "PRJ-901", 
    company: "EcoForest India Ltd.", 
    project: "Sundarbans Mangrove REDD+", 
    type: "Forestry & REDD+",
    icon: TreePine,
    volumeAvailable: "15,000",
    pricePerTon: "₹1,550",
    vintage: "2025",
    verified: true,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10"
  },
  { 
    id: "PRJ-842", 
    company: "GreenEnergy Co.", 
    project: "Rajasthan Wind Farm Phase II", 
    type: "Renewable Energy",
    icon: Wind,
    volumeAvailable: "8,500",
    pricePerTon: "₹1,200",
    vintage: "2024",
    verified: true,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10"
  },
  { 
    id: "PRJ-731", 
    company: "Solaris Power", 
    project: "Gujarat Solar Parks", 
    type: "Solar Projects",
    icon: Sun,
    volumeAvailable: "22,000",
    pricePerTon: "₹1,150",
    vintage: "2026",
    verified: true,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10"
  },
  { 
    id: "PRJ-654", 
    company: "AquaRestore Inc.", 
    project: "Western Ghats Wetlands", 
    type: "Blue Carbon",
    icon: Droplets,
    volumeAvailable: "5,200",
    pricePerTon: "₹2,100",
    vintage: "2025",
    verified: false,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10"
  },
];

export function MarketplaceBuyPage() {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="glass border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Global Avg Price</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹1,420<span className="text-xs font-normal text-muted-foreground/60 ml-1">/ tCO₂e</span>
              </p>
              <p className="text-xs text-emerald-600/80 mt-1">+1.2% today</p>
            </CardContent>
          </Card>
          <Card className="glass border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Volume Available</p>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400">
                2.4M<span className="text-xs font-normal text-muted-foreground/60 ml-1">tCO₂e</span>
              </p>
              <p className="text-xs text-teal-600/80 mt-1">Across 124 projects</p>
            </CardContent>
          </Card>
          <Card className="glass border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Verified Partners</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                48<span className="text-xs font-normal text-muted-foreground/60 ml-1">companies</span>
              </p>
              <p className="text-xs text-blue-600/80 mt-1">Selling credits today</p>
            </CardContent>
          </Card>
      </div>

      {/* Listings */}
      <Card className="glass border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-foreground">Available Projects</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">High-quality verified emission reductions</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search projects or companies..."
                  className="pl-8 h-8 text-xs w-64 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted h-8">
                <Filter className="w-3 h-3 mr-1" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {marketplaceListings.map((listing) => {
              const Icon = listing.icon;
              return (
                <Card key={listing.id} className="bg-background/50 border-border hover:border-teal-500/30 transition-all">
                  <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 shrink-0 rounded-xl ${listing.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${listing.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground line-clamp-1">{listing.project}</h3>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            <span>{listing.company}</span>
                          </div>
                        </div>
                      </div>
                      {listing.verified ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] whitespace-nowrap">
                          <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] whitespace-nowrap">
                          Pending Verification
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Volume</p>
                        <p className="text-sm font-medium text-foreground">{listing.volumeAvailable} <span className="text-[10px] text-muted-foreground">tCO₂e</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Vintage</p>
                        <p className="text-sm font-medium text-foreground">{listing.vintage}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Price</p>
                        <p className={`text-sm font-bold ${listing.color}`}>{listing.pricePerTon}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-1">
                      <span className="text-[10px] text-muted-foreground font-mono">{listing.id}</span>
                      <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 h-8 px-4 text-xs">
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
