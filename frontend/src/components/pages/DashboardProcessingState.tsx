/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function DashboardProcessingState() {
  return (
    <>

{/*  Desktop Side Navigation  */}
<nav className="fixed left-0 top-0 h-screen w-64 border-r hidden md:flex flex-col bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 font-space-grotesk text-sm font-semibold border-white/40 dark:border-slate-800/40 shadow-xl p-6 gap-8 z-50">
<div>
<h1 className="text-2xl font-black text-emerald-900 dark:text-emerald-50">IndiCarbon</h1>
<p className="text-slate-600 dark:text-slate-400 font-medium text-xs mt-1">Carbon Intelligence</p>
</div>
<div className="flex flex-col gap-4">
{/*  Active Tab: Dashboard  */}
<a className="flex items-center gap-3 text-emerald-900 dark:text-emerald-300 relative after:content-[''] after:absolute after:right-0 after:w-1 after:h-4 after:bg-emerald-600 after:rounded-full transition-all duration-300 ease-out" href="#">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>dashboard</span>
<span>Dashboard</span>
</a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out" href="#">
<span className="material-symbols-outlined">analytics</span>
<span>Simulator</span>
</a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span>Budget</span>
</a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out" href="#">
<span className="material-symbols-outlined">swap_horiz</span>
<span>Trading</span>
</a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out" href="#">
<span className="material-symbols-outlined">settings</span>
<span>Settings</span>
</a>
</div>
</nav>
{/*  Mobile Bottom Navigation  */}
<nav className="fixed bottom-0 left-0 w-full z-50 md:hidden rounded-t-[24px] border-t bg-white/70 backdrop-blur-lg dark:bg-slate-900/80 border-white/20 dark:border-slate-800/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center h-20 px-4 pb-safe">
{/*  Active Tab: Home  */}
<a className="flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-400 bg-sky-400/15 rounded-xl px-3 py-1 font-space-grotesk text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform duration-200" href="#">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>home</span>
<span className="mt-1">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-space-grotesk text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform duration-200" href="#">
<span className="material-symbols-outlined">eco</span>
<span className="mt-1">Impact</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-space-grotesk text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform duration-200" href="#">
<span className="material-symbols-outlined">currency_exchange</span>
<span className="mt-1">Trade</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-space-grotesk text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform duration-200" href="#">
<span className="material-symbols-outlined">notifications</span>
<span className="mt-1">Alerts</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-space-grotesk text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform duration-200" href="#">
<span className="material-symbols-outlined">person</span>
<span className="mt-1">Profile</span>
</a>
</nav>
{/*  Main Content Wrapper  */}
<main className="flex-1 md:ml-64 flex flex-col min-h-screen relative pb-24 md:pb-0">
{/*  Top App Bar  */}
<header className="sticky top-0 z-40 border-b w-full bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 border-white/40 dark:border-slate-800/40 shadow-sm flex justify-between items-center px-6 py-3 transition-colors duration-200 ease-in-out">
<div className="flex items-center gap-4">
<span className="text-xl font-bold text-emerald-900 dark:text-emerald-50 tracking-tighter hidden md:block">IndiCarbon AI</span>
</div>
<div className="flex items-center gap-2">
{/*  Search on right per JSON  */}
<div className="relative hidden sm:block mr-2">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
<input className="pl-9 pr-4 py-1.5 rounded-full bg-slate-100/50 border border-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-48" placeholder="Search insights..." type="text"/>
</div>
<button className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-200 flex items-center justify-center">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-200 flex items-center justify-center">
<span className="material-symbols-outlined">account_circle</span>
</button>
</div>
</header>
{/*  Canvas  */}
<div className="flex-1 p-container-padding max-w-[1440px] w-full mx-auto relative z-10">
{/*  Page Header  */}
<div className="flex items-center gap-4 mb-gutter">
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-2xl">memory</span>
</div>
<div>
<h2 className="font-headline-md text-headline-md text-on-background">System Processing</h2>
<p className="font-body-md text-body-md text-on-surface-variant opacity-80 mt-1">IndiCarbon AI is analyzing your environmental footprint</p>
</div>
</div>
{/*  Bento Grid Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Compliance Lab Card (Active Processing)  */}
{/*  Asymmetric "Leaf" border radius applied here  */}
<div className="col-span-1 lg:col-span-8 bg-surface/80 backdrop-blur-[24px] border border-outline-variant/30 rounded-tl-[32px] rounded-br-[32px] rounded-tr-xl rounded-bl-xl p-glass-padding shadow-[0_8px_32px_rgba(27,94,32,0.05)] flex flex-col relative overflow-hidden">
{/*  Decorative background gradient glow  */}
<div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/20 blur-[60px] rounded-full pointer-events-none -mr-20 -mt-20"></div>
<div className="flex justify-between items-start mb-6 relative z-10">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary-container text-xl">policy</span>
<h3 className="font-title-sm text-title-sm text-on-surface">Compliance Lab: SEBI Assessment</h3>
</div>
<span className="px-3 py-1 bg-surface-variant rounded-full font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary"></span>
                            In Progress
                        </span>
</div>
{/*  Progress Indicator  */}
<div className="mb-8 relative z-10">
<div className="flex justify-between items-end mb-3">
<span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Analyzing Data Pipeline...</span>
<span className="font-body-md text-sm text-on-surface-variant font-bold">68%</span>
</div>
<div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-secondary to-primary w-[68%] rounded-full relative">
{/*  Simulated shine/pulse without keyframes  */}
<div className="absolute inset-0 bg-white/20 w-1/2 skew-x-[-20deg] -ml-8"></div>
</div>
</div>
</div>
{/*  Rapid Reasoning Logs Box  */}
<div className="flex-1 bg-surface-container-low/60 border border-outline-variant/20 rounded-xl p-6 flex flex-col gap-4 font-body-md text-sm text-on-surface-variant overflow-hidden relative z-10 shadow-inner">
<div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10 text-xs font-label-caps uppercase tracking-wider text-outline">
<span className="material-symbols-outlined text-[16px]">terminal</span>
                            AI Agent Reasoning Stream
                        </div>
<div className="flex flex-col gap-3 font-mono">
<div className="flex justify-between items-start opacity-30">
<div><span className="text-secondary font-bold mr-2">System:</span> Initiating BRSR framework mapping module...</div>
<span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
</div>
<div className="flex justify-between items-start opacity-60">
<div><span className="text-primary-container font-bold mr-2">Agent 1:</span> Extracting Scope 3 category 4 (Upstream Transportation) data from ERP API...</div>
<span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
</div>
<div className="flex justify-between items-start bg-surface-container/50 p-2 -mx-2 rounded border-l-2 border-secondary">
<div><span className="text-secondary font-bold mr-2">Agent 2:</span> Validating extraction against SEBI formatting guidelines. Detecting missing supplier emission factors. Interpolating from industry baseline database.</div>
<span className="text-xs px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed rounded-full animate-pulse whitespace-nowrap">Computing</span>
</div>
<div className="flex justify-between items-start">
<div><span className="text-tertiary font-bold mr-2">Agent 3:</span> Cross-referencing identified gaps with GHG Protocol compliance rulesets...</div>
<span className="text-xs px-2 py-0.5 border border-outline-variant text-outline rounded-full whitespace-nowrap">Queued</span>
</div>
</div>
</div>
</div>
{/*  What-If Simulator (Skeleton Loader)  */}
<div className="col-span-1 lg:col-span-4 bg-surface/80 backdrop-blur-[24px] border border-outline-variant/30 rounded-xl p-glass-padding shadow-sm flex flex-col relative overflow-hidden">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-outline text-xl opacity-50">science</span>
<h3 className="font-title-sm text-title-sm text-on-surface opacity-50">What-If Simulator</h3>
</div>
<div className="flex-1 flex flex-col gap-6">
{/*  Controls Skeleton  */}
<div className="flex gap-2">
<div className="h-8 w-24 bg-surface-variant/60 rounded-full"></div>
<div className="h-8 w-32 bg-surface-variant/40 rounded-full"></div>
<div className="h-8 w-16 bg-surface-variant/30 rounded-full"></div>
</div>
{/*  Main Chart Area Skeleton  */}
<div className="flex-1 bg-surface-container-low/40 border border-outline-variant/10 rounded-xl p-4 flex items-end gap-2 h-48">
<div className="w-full bg-gradient-to-t from-surface-variant/80 to-surface-variant/20 h-[30%] rounded-t-md"></div>
<div className="w-full bg-gradient-to-t from-surface-variant/80 to-surface-variant/20 h-[50%] rounded-t-md"></div>
<div className="w-full bg-gradient-to-t from-surface-variant/80 to-surface-variant/20 h-[40%] rounded-t-md"></div>
<div className="w-full bg-gradient-to-t from-surface-variant/80 to-surface-variant/20 h-[70%] rounded-t-md"></div>
<div className="w-full bg-gradient-to-t from-surface-variant/80 to-surface-variant/20 h-[60%] rounded-t-md"></div>
<div className="w-full bg-gradient-to-t from-surface-variant/80 to-surface-variant/20 h-[85%] rounded-t-md"></div>
</div>
{/*  Data Row Skeletons  */}
<div className="space-y-3">
<div className="flex justify-between items-center">
<div className="h-4 w-3/4 bg-surface-variant/50 rounded"></div>
<div className="h-4 w-12 bg-surface-variant/30 rounded"></div>
</div>
<div className="flex justify-between items-center">
<div className="h-4 w-1/2 bg-surface-variant/40 rounded"></div>
<div className="h-4 w-16 bg-surface-variant/20 rounded"></div>
</div>
</div>
</div>
</div>
{/*  Footer Status Bar / Ingestion Hub  */}
<div className="col-span-1 lg:col-span-12 bg-surface/50 backdrop-blur-md border border-outline-variant/20 rounded-full px-6 py-4 flex items-center justify-between shadow-sm mt-4">
<div className="flex items-center gap-4">
<div className="relative flex h-3 w-3">
<span className="absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75 animate-pulse"></span>
<span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
</div>
<span className="font-body-md text-sm text-on-surface-variant">Live Data Connection Active</span>
</div>
<div className="flex items-center gap-6 hidden md:flex text-xs font-label-caps text-outline uppercase">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">cloud_sync</span>
                            AWS Hub
                        </div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">lock</span>
                            Encrypted
                        </div>
</div>
</div>
</div>
</div>
</main>

    </>
  );
}
