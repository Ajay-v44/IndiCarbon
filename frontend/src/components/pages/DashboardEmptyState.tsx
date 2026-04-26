/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function DashboardEmptyState() {
  return (
    <>

{/*  Ambient Background Lighting  */}
<div className="ambient-blob-1"></div>
<div className="ambient-blob-2"></div>
{/*  SideNavBar (Desktop)  */}
<nav className="bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 font-space-grotesk text-sm font-semibold fixed left-0 top-0 h-screen w-64 border-r hidden md:flex flex-col shadow-xl z-50 duration-300 ease-out border-white/40 dark:border-slate-800/40 p-6 flex flex-col gap-8">
{/*  Brand  */}
<div>
<h1 className="text-2xl font-black text-emerald-900 dark:text-emerald-50">IndiCarbon</h1>
<p className="text-slate-500 text-xs mt-1">Carbon Intelligence</p>
</div>
{/*  Navigation Links  */}
<div className="flex flex-col gap-4 mt-8 flex-1">
{/*  Active Tab: Dashboard  */}
<a className="flex items-center gap-3 text-emerald-900 dark:text-emerald-300 relative after:content-[''] after:absolute after:right-0 after:w-1 after:h-4 after:bg-emerald-600 after:rounded-full hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all p-2 rounded-lg" href="#">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>dashboard</span>
<span>Dashboard</span>
</a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all p-2 rounded-lg" href="#">
<span className="material-symbols-outlined">analytics</span>
<span>Simulator</span>
</a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all p-2 rounded-lg" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span>Budget</span>
</a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all p-2 rounded-lg" href="#">
<span className="material-symbols-outlined">swap_horiz</span>
<span>Trading</span>
</a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all p-2 rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
<span>Settings</span>
</a>
</div>
</nav>
{/*  Main Content Wrapper  */}
<div className="flex-1 md:ml-64 flex flex-col min-h-screen relative z-10 pb-24 md:pb-0">
{/*  TopAppBar  */}
<header className="bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 font-space-grotesk text-sm font-medium tracking-wide docked full-width top-0 z-50 border-b border-white/40 dark:border-slate-800/40 shadow-sm backdrop-blur-2xl duration-200 ease-in-out flex justify-between items-center px-6 py-3 w-full sticky">
<div className="flex items-center gap-4">
<div className="text-xl font-bold text-emerald-900 dark:text-emerald-50 tracking-tighter md:hidden">IndiCarbon AI</div>
<div className="hidden md:block text-slate-500 text-sm">Workspace Overview</div>
</div>
<div className="flex items-center gap-4">
<div className="relative hidden sm:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
<input className="bg-white/50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-48 transition-all" placeholder="Search data..." type="text"/>
</div>
<button className="text-emerald-900 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors p-2 rounded-full relative">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-emerald-900 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors p-1 rounded-full">
<span className="material-symbols-outlined text-3xl">account_circle</span>
</button>
</div>
</header>
{/*  Canvas / Dashboard Content  */}
<main className="flex-1 p-container-padding flex flex-col gap-section-gap max-w-7xl mx-auto w-full">
{/*  Welcome Header (Empty State)  */}
<section className="flex flex-col gap-4 mt-8">
<div className="inline-flex items-center gap-2 bg-surface-container-high text-on-surface-variant rounded-full px-3 py-1 w-max font-label-caps text-label-caps">
<span className="material-symbols-outlined text-xs">auto_awesome</span>
                    WORKSPACE INITIALIZED
                </div>
<h1 className="font-display-lg text-display-lg text-on-background">Ready to track your impact.</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Your intelligence dashboard is configured and awaiting data. Connect sources or run a simulation to begin mapping your carbon trajectory.</p>
</section>
{/*  Top Row: Bento Grid (Budget & Simulator Empty States)  */}
<section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
{/*  Carbon Budget Gauge (Empty State)  */}
<div className="eco-glass-panel p-glass-padding flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden group">
<div className="absolute top-6 left-6 flex items-center gap-2">
<span className="material-symbols-outlined text-surface-tint">account_balance_wallet</span>
<h2 className="font-title-sm text-title-sm text-on-surface">Carbon Budget</h2>
</div>
{/*  0% Gauge Visualization  */}
<div className="relative w-48 h-48 mt-8 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
{/*  Background track  */}
<circle className="text-surface-container-high" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
{/*  Empty indicator dot  */}
<circle className="text-outline-variant" cx="50" cy="10" fill="currentColor" r="4"></circle>
</svg>
<div className="absolute flex flex-col items-center">
<span className="font-headline-md text-headline-md text-outline">0%</span>
<span className="font-label-caps text-label-caps text-outline-variant mt-1">ALLOCATED</span>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mt-6 text-center text-sm">No baseline established.</p>
</div>
{/*  What-If Simulator (Reset/Empty State)  */}
<div className="eco-glass-panel p-glass-padding flex flex-col min-h-[360px]">
<div className="flex items-center gap-2 mb-6">
<span className="material-symbols-outlined text-secondary">analytics</span>
<h2 className="font-title-sm text-title-sm text-on-surface">What-If Simulator</h2>
</div>
<div className="flex-1 flex flex-col items-center justify-center bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant/50 p-8 text-center gap-4">
<div className="w-16 h-16 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-secondary mb-2">
<span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: '"FILL" 1'}}>tune</span>
</div>
<h3 className="font-title-sm text-title-sm text-on-background">Awaiting Parameters</h3>
<p className="font-body-md text-body-md text-on-surface-variant text-sm">Configure variables to forecast potential outcomes and optimize your carbon strategy.</p>
<button className="mt-4 px-6 py-2.5 bg-surface text-primary-container font-label-caps text-label-caps rounded-xl border border-primary-container/20 hover:bg-primary-container/5 transition-colors duration-200">
                            Initialize Model
                        </button>
</div>
</div>
</section>
{/*  SDG Impact Tiles (Empty State)  */}
<section className="flex flex-col gap-6">
<div className="flex items-center justify-between">
<h2 className="font-headline-md text-title-sm text-on-background">SDG Alignment</h2>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
{/*  Placeholder Tile 1  */}
<button className="eco-glass-panel p-6 h-40 flex flex-col items-center justify-center gap-3 border-dashed border-outline-variant hover:border-surface-tint hover:bg-surface-tint/5 transition-all duration-200 group text-outline-variant hover:text-surface-tint">
<span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_circle</span>
<span className="font-label-caps text-label-caps">Set Your First Goal</span>
</button>
{/*  Placeholder Tile 2  */}
<button className="eco-glass-panel p-6 h-40 flex flex-col items-center justify-center gap-3 border-dashed border-outline-variant hover:border-surface-tint hover:bg-surface-tint/5 transition-all duration-200 group text-outline-variant hover:text-surface-tint">
<span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_circle</span>
<span className="font-label-caps text-label-caps">Add Target</span>
</button>
{/*  Placeholder Tile 3  */}
<button className="eco-glass-panel p-6 h-40 hidden sm:flex flex-col items-center justify-center gap-3 border-dashed border-outline-variant hover:border-surface-tint hover:bg-surface-tint/5 transition-all duration-200 group text-outline-variant hover:text-surface-tint">
<span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_circle</span>
<span className="font-label-caps text-label-caps">Add Target</span>
</button>
{/*  Placeholder Tile 4  */}
<button className="eco-glass-panel p-6 h-40 hidden lg:flex flex-col items-center justify-center gap-3 border-dashed border-outline-variant hover:border-surface-tint hover:bg-surface-tint/5 transition-all duration-200 group text-outline-variant hover:text-surface-tint opacity-50">
<span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_circle</span>
<span className="font-label-caps text-label-caps">Add Target</span>
</button>
</div>
</section>
{/*  Compliance Lab (Empty Upload State)  */}
<section className="eco-glass-panel p-glass-padding">
<div className="flex items-center gap-2 mb-6">
<span className="material-symbols-outlined text-on-surface">science</span>
<h2 className="font-title-sm text-title-sm text-on-surface">Compliance Lab</h2>
</div>
<div className="border-2 border-dashed border-outline-variant/60 rounded-[20px] bg-surface-container-lowest/50 p-12 flex flex-col items-center justify-center text-center transition-colors hover:border-surface-tint hover:bg-surface-container-lowest">
<div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-4xl text-outline">cloud_upload</span>
</div>
<h3 className="font-title-sm text-title-sm text-on-background mb-2">Upload your first data log to begin analysis</h3>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-8">Supported formats: .csv, .xlsx, .json containing Scope 1, 2, or 3 emissions data.</p>
<div className="flex gap-4">
<button className="px-6 py-3 bg-primary-container text-on-primary rounded-xl font-label-caps text-label-caps hover:opacity-90 transition-opacity" style={{borderRadius: '12px 0 12px 0'}}>
                            Browse Files
                        </button>
</div>
</div>
</section>
</main>
</div>
{/*  BottomNavBar (Mobile)  */}
<nav className="bg-white/70 backdrop-blur-lg dark:bg-slate-900/80 font-space-grotesk text-[10px] font-bold uppercase tracking-widest fixed bottom-0 left-0 w-full z-50 md:hidden rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] duration-200 flex justify-around items-center h-20 px-4 pb-safe border-t-0">
{/*  Active Tab: Mapped "Dashboard" to "Home"  */}
<a className="flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-400 bg-sky-400/15 rounded-xl px-3 py-1 active:scale-95 transition-transform" href="#">
<span className="material-symbols-outlined mb-1" style={{fontVariationSettings: '"FILL" 1'}}>home</span>
<span>Home</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform hover:text-emerald-700" href="#">
<span className="material-symbols-outlined mb-1">eco</span>
<span>Impact</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform hover:text-emerald-700" href="#">
<span className="material-symbols-outlined mb-1">currency_exchange</span>
<span>Trade</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform hover:text-emerald-700" href="#">
<span className="material-symbols-outlined mb-1">notifications</span>
<span>Alerts</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform hover:text-emerald-700" href="#">
<span className="material-symbols-outlined mb-1">person</span>
<span>Profile</span>
</a>
</nav>

    </>
  );
}
