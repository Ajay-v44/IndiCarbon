/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function DashboardPage() {
  return (
    <>

{/*  TopAppBar (Mobile only in layout)  */}
<header className="md:hidden flex justify-between items-center px-6 py-3 w-full bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 font-space-grotesk text-sm font-medium tracking-wide shadow-sm border-b border-white/40 dark:border-slate-800/40 sticky top-0 z-50">
<div className="text-xl font-bold text-emerald-900 dark:text-emerald-50 tracking-tighter">IndiCarbon AI</div>
<div className="flex gap-4 text-emerald-900 dark:text-emerald-400">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
</div>
</header>
{/*  SideNavBar (Desktop)  */}
<nav className="fixed left-0 top-0 h-screen w-64 border-r hidden md:flex flex-col p-6 gap-8 bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 shadow-xl border-white/40 dark:border-slate-800/40 z-40">
<div>
<div className="text-2xl font-black text-emerald-900 dark:text-emerald-50">IndiCarbon</div>
<div className="text-xs text-slate-500">Carbon Intelligence</div>
</div>
<div className="flex flex-col gap-4 font-space-grotesk text-sm font-semibold">
{/*  Active Tab: Dashboard  */}
<a className="flex items-center gap-3 text-emerald-900 dark:text-emerald-300 relative after:content-[''] after:absolute after:right-0 after:w-1 after:h-4 after:bg-emerald-600 after:rounded-full hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out p-2 rounded-lg bg-emerald-50/20 shadow-[inset_0_0_10px_rgba(27,94,32,0.05)]" href="#">
<span className="material-symbols-outlined text-primary-container" data-icon="dashboard">dashboard</span>
                Dashboard
            </a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out p-2 rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="analytics">analytics</span>
                Simulator
            </a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out p-2 rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="account_balance_wallet">account_balance_wallet</span>
                Budget
            </a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out p-2 rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="swap_horiz">swap_horiz</span>
                Trading
            </a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out p-2 rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
                Settings
            </a>
</div>
</nav>
{/*  Main Content Canvas  */}
<main className="flex-1 md:ml-64 p-container-padding pb-[100px] md:pb-container-padding flex flex-col gap-section-gap">
{/*  Dashboard Header  */}
<header className="flex flex-col gap-2">
<h1 className="font-display-lg text-display-lg text-on-surface">Global Operations</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Real-time carbon footprint monitoring and predictive sustainability modeling.</p>
</header>
{/*  Bento Grid Layout  */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
{/*  Central Carbon Budget Gauge  */}
<section className="glass-panel organic-curve p-glass-padding flex flex-col items-center justify-center col-span-1 md:col-span-8 shadow-[0_8px_32px_rgba(27,94,32,0.05)] relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent pointer-events-none"></div>
<h2 className="font-title-sm text-title-sm text-on-surface self-start w-full mb-8">Carbon Budget</h2>
<div className="relative w-64 h-64 flex items-center justify-center">
{/*  Placeholder for SVG Gauge  */}
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
<circle cx="50" cy="50" fill="none" r="45" stroke="#e0e4db" strokeDasharray="283" strokeDashoffset="0" strokeLinecap="round" strokeWidth="8"></circle>
<circle className="drop-shadow-md" cx="50" cy="50" fill="none" r="45" stroke="#1b5e20" strokeDasharray="283" strokeDashoffset="80" strokeLinecap="round" strokeWidth="8"></circle>
</svg>
<div className="absolute flex flex-col items-center">
<span className="font-display-lg text-display-lg text-primary-container">72%</span>
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Utilized</span>
</div>
</div>
<div className="flex gap-8 mt-8 w-full justify-around border-t border-outline-variant/30 pt-6">
<div className="flex flex-col items-center">
<span className="font-label-caps text-label-caps text-outline uppercase">Target</span>
<span className="font-title-sm text-title-sm text-on-surface mt-1">450k <span className="text-sm font-normal">tCO2e</span></span>
</div>
<div className="flex flex-col items-center">
<span className="font-label-caps text-label-caps text-outline uppercase">Current</span>
<span className="font-title-sm text-title-sm text-error mt-1">324k <span className="text-sm font-normal">tCO2e</span></span>
</div>
</div>
</section>
{/*  Compliance Lab  */}
<section className="glass-panel organic-curve p-glass-padding flex flex-col col-span-1 md:col-span-4 gap-6">
<h2 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="science">science</span>
                    Compliance Lab
                </h2>
<div className="flex-1 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-6 text-center hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="bg-primary-container/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-primary-container" data-icon="cloud_upload">cloud_upload</span>
</div>
<p className="font-title-sm text-base text-on-surface">Upload Data Logs</p>
<p className="font-label-caps text-label-caps text-outline mt-1">CSV, JSON, PDF</p>
</div>
<div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/50 max-h-40 overflow-y-auto">
<div className="font-label-caps text-label-caps text-outline mb-2">Real-time Reasoning Logs</div>
<div className="flex flex-col gap-2 font-mono text-xs text-on-surface-variant">
<div className="flex gap-2"><span className="text-primary">[INFO]</span> Parsing Scope 3 emissions...</div>
<div className="flex gap-2"><span className="text-secondary">[WARN]</span> Anomaly detected in logistics data.</div>
<div className="flex gap-2"><span className="text-primary">[INFO]</span> Aligning with GHG Protocol...</div>
</div>
</div>
</section>
{/*  What-if Simulator  */}
<section className="glass-panel organic-curve p-glass-padding flex flex-col col-span-1 md:col-span-12 gap-8">
<div className="flex justify-between items-end">
<div>
<h2 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" data-icon="tune">tune</span>
                            What-If Simulator
                        </h2>
<p className="font-body-md text-sm text-on-surface-variant mt-1">Project future emissions based on energy transitions.</p>
</div>
<button className="bg-primary-container text-on-primary font-label-caps text-label-caps px-6 py-3 rounded-leaf hover:bg-on-primary-fixed transition-colors flex items-center gap-2 shadow-md">
                        RUN SIMULATION
                        <span className="material-symbols-outlined text-[16px]" data-icon="play_arrow">play_arrow</span>
</button>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
{/*  Sliders  */}
<div className="col-span-1 flex flex-col gap-6">
<div className="flex flex-col gap-2">
<div className="flex justify-between">
<span className="font-label-caps text-label-caps text-on-surface uppercase">Coal Reduction</span>
<span className="font-label-caps text-label-caps text-primary-container">40%</span>
</div>
<input className="w-full h-2 bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary-container" max="100" min="0" type="range" defaultValue="40"/>
</div>
<div className="flex flex-col gap-2">
<div className="flex justify-between">
<span className="font-label-caps text-label-caps text-on-surface uppercase">Solar Adoption</span>
<span className="font-label-caps text-label-caps text-secondary">65%</span>
</div>
<input className="w-full h-2 bg-surface-variant rounded-full appearance-none cursor-pointer accent-secondary" max="100" min="0" type="range" defaultValue="65"/>
</div>
<div className="flex flex-col gap-2">
<div className="flex justify-between">
<span className="font-label-caps text-label-caps text-on-surface uppercase">Wind Expansion</span>
<span className="font-label-caps text-label-caps text-tertiary-container">20%</span>
</div>
<input className="w-full h-2 bg-surface-variant rounded-full appearance-none cursor-pointer accent-tertiary-container" max="100" min="0" type="range" defaultValue="20"/>
</div>
</div>
{/*  Graph Placeholder  */}
<div className="col-span-1 lg:col-span-2 h-64 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center relative overflow-hidden">
{/*  Abstract representation of a chart  */}
<div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary-fixed/30 to-transparent"></div>
<svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
<path d="M0,200 Q100,180 200,100 T400,120 T600,40 L600,250 L0,250 Z" fill="rgba(145, 215, 138, 0.2)" stroke="none"></path>
<path d="M0,200 Q100,180 200,100 T400,120 T600,40" fill="none" stroke="#1b5e20" strokeWidth="3"></path>
{/*  Baseline  */}
<path d="M0,150 L600,150" fill="none" stroke="#717a6d" strokeDasharray="4" strokeWidth="1"></path>
</svg>
<span className="absolute top-4 left-4 font-label-caps text-label-caps text-outline bg-surface px-2 py-1 rounded shadow-sm">Projected vs Baseline</span>
</div>
</div>
</section>
{/*  SDG Impact Tiles  */}
<section className="col-span-1 md:col-span-12 flex flex-col gap-6">
<h2 className="font-title-sm text-title-sm text-on-surface">SDG Impact</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
<div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:shadow-[0_4px_20px_rgba(27,94,32,0.1)] transition-all cursor-pointer border-t-4 border-t-primary-container">
<div className="flex justify-between items-start">
<div className="bg-primary-container/10 p-2 rounded-lg">
<span className="material-symbols-outlined text-primary-container" data-icon="bolt">bolt</span>
</div>
<span className="bg-primary-fixed text-on-primary-fixed font-label-caps text-[10px] px-2 py-1 rounded-full">SDG 7</span>
</div>
<div>
<h3 className="font-title-sm text-base text-on-surface">Clean Energy</h3>
<p className="font-body-md text-sm text-on-surface-variant mt-1">+12% adoption across facilities</p>
</div>
</div>
<div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:shadow-[0_4px_20px_rgba(27,94,32,0.1)] transition-all cursor-pointer border-t-4 border-t-secondary">
<div className="flex justify-between items-start">
<div className="bg-secondary/10 p-2 rounded-lg">
<span className="material-symbols-outlined text-secondary" data-icon="factory">factory</span>
</div>
<span className="bg-secondary-fixed text-on-secondary-fixed font-label-caps text-[10px] px-2 py-1 rounded-full">SDG 9</span>
</div>
<div>
<h3 className="font-title-sm text-base text-on-surface">Innovation</h3>
<p className="font-body-md text-sm text-on-surface-variant mt-1">3 new patents filed for capture</p>
</div>
</div>
<div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:shadow-[0_4px_20px_rgba(27,94,32,0.1)] transition-all cursor-pointer border-t-4 border-t-tertiary-container">
<div className="flex justify-between items-start">
<div className="bg-tertiary-container/10 p-2 rounded-lg">
<span className="material-symbols-outlined text-tertiary-container" data-icon="public">public</span>
</div>
<span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-[10px] px-2 py-1 rounded-full">SDG 13</span>
</div>
<div>
<h3 className="font-title-sm text-base text-on-surface">Climate Action</h3>
<p className="font-body-md text-sm text-on-surface-variant mt-1">-450 tons CO2 this quarter</p>
</div>
</div>
<div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:shadow-[0_4px_20px_rgba(27,94,32,0.1)] transition-all cursor-pointer border-t-4 border-t-outline">
<div className="flex justify-between items-start">
<div className="bg-surface-variant p-2 rounded-lg">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="add">add</span>
</div>
</div>
<div className="mt-auto">
<h3 className="font-title-sm text-base text-on-surface">Track New Goal</h3>
</div>
</div>
</div>
</section>
</div>
</main>
{/*  BottomNavBar (Mobile)  */}
<nav className="fixed bottom-0 left-0 w-full z-50 md:hidden rounded-t-[24px] border-t border-white/20 dark:border-slate-800/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-lg dark:bg-slate-900/80 flex justify-around items-center h-20 px-4 pb-safe font-space-grotesk text-[10px] font-bold uppercase tracking-widest">
{/*  Active Tab: Home maps to Dashboard  */}
<a className="flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-400 bg-sky-400/15 rounded-xl px-3 py-1 active:scale-95 transition-transform duration-200 spring-dampened" href="#">
<span className="material-symbols-outlined" data-icon="home" style={{fontVariationSettings: '"FILL" 1'}}>home</span>
<span className="mt-1">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200 spring-dampened" href="#">
<span className="material-symbols-outlined" data-icon="eco">eco</span>
<span className="mt-1">Impact</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200 spring-dampened" href="#">
<span className="material-symbols-outlined" data-icon="currency_exchange">currency_exchange</span>
<span className="mt-1">Trade</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200 spring-dampened" href="#">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="mt-1">Alerts</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200 spring-dampened" href="#">
<span className="material-symbols-outlined" data-icon="person">person</span>
<span className="mt-1">Profile</span>
</a>
</nav>

    </>
  );
}
