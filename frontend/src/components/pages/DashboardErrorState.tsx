/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function DashboardErrorState() {
  return (
    <>

{/*  Decorative Eco-Futuristic Background Blurs  */}
<div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
<div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary-fixed opacity-20 blur-[100px]"></div>
<div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-secondary-fixed opacity-30 blur-[120px]"></div>
</div>
{/*  SideNavBar (Desktop)  */}
<nav className="fixed left-0 top-0 h-screen w-64 hidden md:flex flex-col bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 font-space-grotesk text-sm font-semibold border-white/40 dark:border-slate-800/40 shadow-xl p-6 gap-8 z-40">
<div className="mb-4">
<h1 className="text-2xl font-black text-emerald-900 dark:text-emerald-50 tracking-tighter">IndiCarbon</h1>
<p className="text-emerald-700 dark:text-emerald-400 opacity-80 text-xs">Carbon Intelligence</p>
</div>
<div className="flex flex-col gap-2">
{/*  Active Tab: Dashboard  */}
<a className="flex items-center gap-3 text-emerald-900 dark:text-emerald-300 relative after:content-[''] after:absolute after:right-0 after:w-1 after:h-4 after:bg-emerald-600 after:rounded-full px-3 py-2 duration-300 ease-out" href="#">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>dashboard</span>
                Dashboard
            </a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all px-3 py-2 duration-300 ease-out" href="#">
<span className="material-symbols-outlined">analytics</span>
                Simulator
            </a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all px-3 py-2 duration-300 ease-out" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
                Budget
            </a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all px-3 py-2 duration-300 ease-out" href="#">
<span className="material-symbols-outlined">swap_horiz</span>
                Trading
            </a>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all px-3 py-2 duration-300 ease-out" href="#">
<span className="material-symbols-outlined">settings</span>
                Settings
            </a>
</div>
</nav>
{/*  Main Content Wrapper  */}
<div className="flex-1 flex flex-col min-w-0 md:ml-64 relative">
{/*  TopAppBar  */}
<header className="fixed w-full top-0 z-50 bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 font-space-grotesk text-sm font-medium tracking-wide shadow-sm flex justify-between items-center px-6 py-3 transition-colors duration-200 ease-in-out md:w-[calc(100%-16rem)]">
<div className="text-xl font-bold text-emerald-900 dark:text-emerald-50 tracking-tighter">
                IndiCarbon AI
            </div>
<div className="flex items-center gap-4">
<button className="text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors p-2 rounded-full duration-200 ease-in-out flex items-center justify-center">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors p-2 rounded-full duration-200 ease-in-out flex items-center justify-center">
<span className="material-symbols-outlined">account_circle</span>
</button>
</div>
</header>
{/*  Canvas Area  */}
<main className="flex-1 overflow-y-auto pt-24 pb-32 md:pb-container-padding px-6 md:px-container-padding">
<div className="max-w-6xl mx-auto space-y-section-gap">
{/*  Page Header  */}
<header className="mb-12">
<h2 className="font-display-lg text-display-lg text-on-background">Compliance Lab</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
                        AI-driven analysis of your latest emissions data upload. Review processing status and actionable insights below.
                    </p>
</header>
{/*  Bento Grid Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
{/*  Primary Error Canvas (Span 2)  */}
<div className="lg:col-span-2 glass-surface-error rounded-xl p-glass-padding flex flex-col gap-6 relative overflow-hidden">
{/*  Subtle background pulse for urgency  */}
<div className="absolute top-0 right-0 w-32 h-32 bg-error opacity-10 blur-3xl rounded-full"></div>
<div className="flex items-start gap-4 z-10">
<div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center shrink-0 border border-error/20">
<span className="material-symbols-outlined text-error" style={{fontSize: '28px'}}>error</span>
</div>
<div>
<h3 className="font-title-sm text-title-sm text-error">Parsing Failed: Schema Mismatch</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">
                                    The uploaded file <code className="font-mono text-sm bg-surface-container px-2 py-0.5 rounded text-on-surface">q3_facility_emissions.csv</code> structurally deviates from the required IndiCarbon standard. Critical columns are missing or malformed, preventing AI ingestion.
                                </p>
</div>
</div>
{/*  Reasoning Logs  */}
<div className="bg-error-container/40 border border-error/10 rounded-lg p-5 mt-2 z-10 font-mono text-sm text-on-error-container space-y-2 overflow-x-auto shadow-inner">
<div className="flex items-start gap-2">
<span className="text-error font-bold text-xs mt-0.5">09:41:02</span>
<span>[INFO] Initializing schema validation protocol...</span>
</div>
<div className="flex items-start gap-2">
<span className="text-error font-bold text-xs mt-0.5">09:41:04</span>
<span>[WARN] Header analysis complete. Anomalies detected.</span>
</div>
<div className="flex items-start gap-2">
<span className="text-error font-bold text-xs mt-0.5">09:41:05</span>
<span className="font-semibold">&gt; ERROR: Required column &apos;Scope_3_Category&apos; is missing entirely.</span>
</div>
<div className="flex items-start gap-2">
<span className="text-error font-bold text-xs mt-0.5">09:41:05</span>
<span className="font-semibold">&gt; ERROR: Data type constraint violation in column &apos;CO2e_Metric_Tons&apos; (Row 142). Expected Float, encountered String (&quot;N/A&quot;).</span>
</div>
<div className="flex items-start gap-2">
<span className="text-error font-bold text-xs mt-0.5">09:41:06</span>
<span>[FATAL] Pipeline halted. Awaiting manual resolution.</span>
</div>
</div>
{/*  Actions  */}
<div className="flex flex-wrap gap-4 mt-4 z-10 border-t border-error/10 pt-6">
<button className="bg-primary-container text-on-primary-container font-label-caps text-label-caps px-6 py-3 rounded-leaf hover:bg-primary transition-colors flex items-center gap-2 duration-200">
<span className="material-symbols-outlined" style={{fontSize: '18px'}}>upload_file</span>
                                RE-UPLOAD CORRECTED FILE
                            </button>
<button className="bg-transparent border border-secondary text-secondary font-label-caps text-label-caps px-6 py-3 rounded-leaf hover:bg-secondary/10 transition-colors flex items-center gap-2 duration-200">
<span className="material-symbols-outlined" style={{fontSize: '18px'}}>visibility</span>
                                VIEW REQUIRED SCHEMA
                            </button>
</div>
</div>
{/*  Secondary Functional Area (Awaiting Data)  */}
<div className="lg:col-span-1 flex flex-col gap-gutter">
<div className="glass-surface rounded-xl p-glass-padding flex flex-col justify-between min-h-[160px]">
<div className="flex justify-between items-start">
<h4 className="font-label-caps text-label-caps text-on-surface-variant">Projected Q3 Emissions</h4>
<span className="material-symbols-outlined text-outline">query_stats</span>
</div>
<div className="my-4">
<div className="font-headline-md text-headline-md text-surface-dim tracking-widest">---</div>
</div>
<div className="mt-auto">
<span className="inline-flex items-center gap-1.5 bg-surface-variant text-on-surface-variant font-label-caps text-[10px] px-3 py-1 rounded-full">
<div className="w-1.5 h-1.5 rounded-full bg-outline animate-pulse"></div>
                                    AWAITING VALID DATA
                                </span>
</div>
</div>
<div className="glass-surface rounded-xl p-glass-padding flex flex-col justify-between min-h-[160px]">
<div className="flex justify-between items-start">
<h4 className="font-label-caps text-label-caps text-on-surface-variant">Offset Compliance Gap</h4>
<span className="material-symbols-outlined text-outline">energy_savings_leaf</span>
</div>
<div className="my-4">
<div className="font-headline-md text-headline-md text-surface-dim tracking-widest">---</div>
</div>
<div className="mt-auto">
<span className="inline-flex items-center gap-1.5 bg-surface-variant text-on-surface-variant font-label-caps text-[10px] px-3 py-1 rounded-full">
<div className="w-1.5 h-1.5 rounded-full bg-outline animate-pulse"></div>
                                    AWAITING VALID DATA
                                </span>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
{/*  BottomNavBar (Mobile)  */}
<nav className="fixed bottom-0 left-0 w-full z-50 md:hidden rounded-t-[24px] bg-white/70 backdrop-blur-lg dark:bg-slate-900/80 font-space-grotesk text-[10px] font-bold uppercase tracking-widest shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center h-20 px-4 pb-safe">
{/*  Active Tab: Home (Maps to Dashboard conceptually)  */}
<button className="flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-400 bg-sky-400/15 rounded-xl px-3 py-1 active:scale-95 transition-transform duration-200">
<span className="material-symbols-outlined mb-1" style={{fontVariationSettings: '"FILL" 1'}}>home</span>
            Home
        </button>
<button className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200">
<span className="material-symbols-outlined mb-1">eco</span>
            Impact
        </button>
<button className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200">
<span className="material-symbols-outlined mb-1">currency_exchange</span>
            Trade
        </button>
<button className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200">
<span className="material-symbols-outlined mb-1">notifications</span>
            Alerts
        </button>
<button className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200">
<span className="material-symbols-outlined mb-1">person</span>
            Profile
        </button>
</nav>

    </>
  );
}
