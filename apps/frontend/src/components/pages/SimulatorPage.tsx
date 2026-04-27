"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Zap, Play, RotateCcw, TrendingDown, Download, Leaf, Sun, Wind, Factory } from "lucide-react";

const baselineData = [
  { year: "2026", baseline: 5000, optimized: 5000 },
  { year: "2027", baseline: 5100, optimized: 4600 },
  { year: "2028", baseline: 5200, optimized: 4100 },
  { year: "2029", baseline: 5300, optimized: 3500 },
  { year: "2030", baseline: 5400, optimized: 2800 },
  { year: "2035", baseline: 5600, optimized: 1800 },
  { year: "2040", baseline: 5800, optimized: 900 },
  { year: "2045", baseline: 6000, optimized: 300 },
  { year: "2050", baseline: 6200, optimized: 0 },
];

export function SimulatorPage() {
  const [solar, setSolar] = useState([30]);
  const [wind, setWind] = useState([15]);
  const [efficiency, setEfficiency] = useState([20]);
  const [offsets, setOffsets] = useState([50]);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const reduction = Math.round(solar[0] * 0.8 + wind[0] * 0.6 + efficiency[0] * 0.9 + offsets[0] * 0.5);
  const targetYear = reduction > 80 ? 2038 : reduction > 60 ? 2042 : reduction > 40 ? 2048 : 2055;

  const handleRun = () => {
    setRunning(true);
    setRan(false);
    setTimeout(() => {
      setRunning(false);
      setRan(true);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white">Climate Lab</h1>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">AI Simulator</Badge>
          </div>
          <p className="text-sm text-green-400/60">
            Project future emissions based on energy transitions and policy interventions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-green-900/50 text-green-400/70 hover:bg-green-500/10"
            onClick={() => { setSolar([30]); setWind([15]); setEfficiency([20]); setOffsets([50]); setRan(false); }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>
          {ran && (
            <Button size="sm" variant="outline" className="border-green-500/30 text-green-400">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <Card className="lg:col-span-2 glass border-green-900/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-green-100">Scenario Parameters</CardTitle>
            <CardDescription className="text-green-500/50 text-xs">
              Adjust sliders to model different intervention strategies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Solar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-green-300/70 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-yellow-400" />
                  Solar Adoption
                </Label>
                <span className="text-xs font-bold text-green-400">{solar[0]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={solar[0]}
                onChange={(e) => setSolar([Number(e.target.value)])}
                className="w-full accent-green-500 cursor-pointer"
              />
              <p className="text-[10px] text-green-600/40">Penetration of solar energy across facilities</p>
            </div>

            {/* Wind */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-green-300/70 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-400" />
                  Wind Energy
                </Label>
                <span className="text-xs font-bold text-green-400">{wind[0]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={wind[0]}
                onChange={(e) => setWind([Number(e.target.value)])}
                className="w-full accent-green-500 cursor-pointer"
              />
              <p className="text-[10px] text-green-600/40">Wind power capacity installation</p>
            </div>

            {/* Efficiency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-green-300/70 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-blue-400" />
                  Process Efficiency
                </Label>
                <span className="text-xs font-bold text-green-400">{efficiency[0]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={efficiency[0]}
                onChange={(e) => setEfficiency([Number(e.target.value)])}
                className="w-full accent-green-500 cursor-pointer"
              />
              <p className="text-[10px] text-green-600/40">Manufacturing process improvement</p>
            </div>

            {/* Offsets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-green-300/70 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  Carbon Offsets (ktCO₂)
                </Label>
                <span className="text-xs font-bold text-green-400">{offsets[0]}k</span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                value={offsets[0]}
                onChange={(e) => setOffsets([Number(e.target.value)])}
                className="w-full accent-green-500 cursor-pointer"
              />
              <p className="text-[10px] text-green-600/40">Annual carbon credit purchases</p>
            </div>

            <Button
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold"
              onClick={handleRun}
              disabled={running}
            >
              {running ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Running simulation...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Run AI Simulation
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Est. Reduction", value: `${reduction}%`, sub: "vs. BAU 2050", color: "text-green-400" },
              { label: "Net-Zero Year", value: `${targetYear}`, sub: "projected", color: "text-emerald-400" },
              { label: "Cost Saving", value: "₹240Cr", sub: "over 10 years", color: "text-teal-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="glass border-green-900/30 text-center">
                <CardContent className="p-4">
                  <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs font-medium text-green-200/60 mt-0.5">{kpi.label}</p>
                  <p className="text-[10px] text-green-600/40">{kpi.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card className="glass border-green-900/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-green-100">Emissions Projection</CardTitle>
                  <CardDescription className="text-green-500/50 text-xs">
                    Business-as-usual vs. optimized scenario (tCO₂e)
                  </CardDescription>
                </div>
                {ran && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    AI Simulated
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={baselineData}>
                  <defs>
                    <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="optimGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.06)" />
                  <XAxis dataKey="year" tick={{ fill: "#4d7a5a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4d7a5a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--card-foreground)" }}
                  />
                  <Area type="monotone" dataKey="baseline" stroke="#ef4444" fill="url(#baselineGrad)" strokeWidth={1.5} name="Business as Usual" strokeDasharray="4 3" />
                  <Area type="monotone" dataKey="optimized" stroke="#22c55e" fill="url(#optimGrad)" strokeWidth={2} name="Optimized Scenario" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-3 justify-center">
                <div className="flex items-center gap-2 text-xs text-green-400/60">
                  <div className="w-4 h-0.5 bg-red-400 border-dashed border-t border-red-400" />
                  Business as Usual
                </div>
                <div className="flex items-center gap-2 text-xs text-green-400/60">
                  <div className="w-4 h-0.5 bg-green-400" />
                  Optimized Scenario
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
