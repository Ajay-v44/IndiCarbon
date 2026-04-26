/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function DashboardSuccessState() {
  return (
    <>

{/*  Decorative Background Element  */}
<div className="fixed top-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full bg-primary-fixed/20 blur-[100px] pointer-events-none -z-10"></div>
<div className="fixed bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-secondary-fixed/30 blur-[100px] pointer-events-none -z-10"></div>
{/*  TopAppBar  */}
<header className="bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 text-emerald-900 dark:text-emerald-400 font-space-grotesk text-sm font-medium tracking-wide docked full-width top-0 z-50 border-b border-white/40 dark:border-slate-800/40 shadow-sm backdrop-blur-2xl flex justify-between items-center px-6 py-3 w-full fixed">
<div className="text-xl font-bold text-emerald-900 dark:text-emerald-50 tracking-tighter">
            IndiCarbon AI
        </div>
<div className="flex items-center gap-4">
<button className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-200 ease-in-out p-2 rounded-full flex items-center justify-center">
<span className="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
</button>
<button className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-200 ease-in-out p-2 rounded-full flex items-center justify-center">
<span className="material-symbols-outlined text-slate-600 dark:text-slate-400">account_circle</span>
</button>
</div>
</header>
{/*  SideNavBar (Desktop)  */}
<nav className="bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 font-space-grotesk text-sm font-semibold fixed left-0 top-0 h-screen w-64 border-r hidden md:flex flex-col border-white/40 dark:border-slate-800/40 shadow-xl p-6 flex flex-col gap-8 z-40 pt-24">
<div>
<div className="text-2xl font-black text-emerald-900 dark:text-emerald-50">IndiCarbon</div>
<div className="text-emerald-900 dark:text-emerald-400 opacity-70 mt-1">Carbon Intelligence</div>
</div>
<ul className="flex flex-col gap-2">
{/*  Active Tab  */}
<li>
<a className="flex items-center gap-3 text-emerald-900 dark:text-emerald-300 relative after:content-[''] after:absolute after:right-0 after:w-1 after:h-4 after:bg-emerald-600 after:rounded-full hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out px-4 py-3 rounded-lg bg-emerald-50/30" href="#">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>dashboard</span>
<span>Dashboard</span>
</a>
</li>
{/*  Inactive Tabs  */}
<li>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out px-4 py-3 rounded-lg" href="#">
<span className="material-symbols-outlined">analytics</span>
<span>Simulator</span>
</a>
</li>
<li>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out px-4 py-3 rounded-lg" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span>Budget</span>
</a>
</li>
<li>
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out px-4 py-3 rounded-lg" href="#">
<span className="material-symbols-outlined">swap_horiz</span>
<span>Trading</span>
</a>
</li>
<li className="mt-auto">
<a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 opacity-80 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:opacity-100 transition-all duration-300 ease-out px-4 py-3 rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
<span>Settings</span>
</a>
</li>
</ul>
</nav>
{/*  Main Content Canvas  */}
<main className="md:ml-64 pt-[88px] pb-32 md:pb-12 px-container-padding flex flex-col gap-section-gap">
{/*  Success Header  */}
<header className="flex flex-col gap-unit items-start max-w-3xl">
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/30 border border-primary-fixed text-primary font-label-caps text-label-caps mb-4">
<span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
                SYSTEM ALIGNED
            </div>
<h1 className="font-display-lg text-display-lg text-primary">All Protocols Compliant</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-xl">Your carbon strategy has been successfully validated. All operational metrics are currently operating within established environmental thresholds.</p>
</header>
{/*  Bento Grid Layout  */}
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter auto-rows-min">
{/*  Compliance Lab Widget (Success)  */}
<article className="bg-surface/80 backdrop-blur-2xl border border-outline-variant/50 rounded-xl p-glass-padding shadow-sm flex flex-col gap-6 relative overflow-hidden group">
<div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150"></div>
<div className="flex justify-between items-start z-10">
<div className="flex flex-col gap-1">
<span className="font-label-caps text-label-caps text-outline uppercase">Compliance Lab</span>
<h2 className="font-title-sm text-title-sm text-on-surface">Audit Status</h2>
</div>
<div className="w-10 h-10 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>fact_check</span>
</div>
</div>
<div className="flex flex-col items-center justify-center py-6 gap-4 z-10">
<div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-fixed to-primary-container flex items-center justify-center shadow-[0_0_40px_rgba(27,94,32,0.3)]">
<span className="material-symbols-outlined text-on-primary text-[40px]" style={{fontVariationSettings: '"FILL" 1'}}>check</span>
</div>
<div className="text-center">
<div className="font-title-sm text-title-sm text-primary">Verification Complete</div>
<div className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">ISO 14064 criteria met</div>
</div>
</div>
</article>
{/*  What-If Simulator Widget (Success)  */}
<article className="bg-surface/80 backdrop-blur-2xl border border-outline-variant/50 rounded-xl p-glass-padding shadow-sm flex flex-col gap-6 relative overflow-hidden lg:col-span-2 group">
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary-fixed/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
<div className="flex justify-between items-start z-10">
<div className="flex flex-col gap-1">
<span className="font-label-caps text-label-caps text-outline uppercase">What-If Simulator</span>
<h2 className="font-title-sm text-title-sm text-on-surface">Scenario Outcome</h2>
</div>
<div className="px-3 py-1 rounded-full bg-secondary-fixed border border-secondary text-secondary font-label-caps text-label-caps flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        Optimized
                    </div>
</div>
<div className="flex flex-col md:flex-row items-center gap-8 z-10 mt-2">
<div className="flex-1 flex flex-col gap-2 border-l-2 border-primary-fixed pl-4">
<div className="font-display-lg text-display-lg text-primary flex items-baseline gap-2">
                            -14.2<span className="font-title-sm text-title-sm text-on-surface-variant">%</span>
</div>
<div className="font-body-md text-body-md text-on-surface-variant">Projected emissions reduction across supply chain node Alpha.</div>
</div>
<div className="bg-surface-container-low rounded-lg p-4 flex-1 w-full border border-outline-variant/30 flex items-center justify-center relative min-h-[120px]">
<div className="absolute inset-0 flex items-center justify-center opacity-20">
{/*  Abstract Chart Representation  */}
<svg height="80%" preserveAspectRatio="none" viewBox="0 0 200 100" width="100%">
<path d="M0,80 Q50,70 100,40 T200,20 L200,100 L0,100 Z" fill="#acf4a4"></path>
<path d="M0,80 Q50,70 100,40 T200,20" fill="none" stroke="#1b5e20" strokeWidth="2"></path>
</svg>
</div>
<div className="flex flex-col items-center gap-2 z-10">
<span className="material-symbols-outlined text-primary-container text-[32px]" style={{fontVariationSettings: '"FILL" 1'}}>celebration</span>
<div className="font-title-sm text-title-sm text-primary">Target Met</div>
</div>
</div>
</div>
</article>
{/*  Carbon Budget Widget (Success)  */}
<article className="bg-surface/80 backdrop-blur-2xl border border-outline-variant/50 rounded-xl p-glass-padding shadow-sm flex flex-col gap-6 relative overflow-hidden">
<div className="flex justify-between items-start z-10">
<div className="flex flex-col gap-1">
<span className="font-label-caps text-label-caps text-outline uppercase">Carbon Budget</span>
<h2 className="font-title-sm text-title-sm text-on-surface">Q3 Allocation</h2>
</div>
</div>
<div className="flex flex-col gap-6 z-10 flex-1 justify-center">
<div className="flex flex-col gap-1">
<div className="font-display-lg text-display-lg text-on-surface">4,250 <span className="font-title-sm text-title-sm text-on-surface-variant font-normal">tCO2e</span></div>
<div className="font-body-md text-body-md text-outline">Remaining allowance</div>
</div>
<div className="flex flex-col gap-2">
<div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
<span>Utilized (65%)</span>
<span className="text-primary-container font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">done_all</span>
                                Compliant
                            </span>
</div>
<div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full" style={{width: '65%'}}></div>
</div>
</div>
</div>
</article>
{/*  Secondary Insight / Action  */}
<article className="bg-[#1b5e20] text-on-primary rounded-xl p-glass-padding shadow-md flex flex-col justify-between gap-6 relative overflow-hidden lg:col-span-2 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-[32px]">
<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay"></div>
<div className="z-10 flex flex-col gap-2 max-w-lg">
<div className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-wider mb-2">Next Steps Active</div>
<h2 className="font-title-sm text-title-sm text-on-primary">Initiate automated reporting for stakeholders</h2>
<p className="font-body-md text-body-md text-on-primary/80">With all targets met and budgets compliant, the system is ready to generate and distribute the quarterly sustainability report.</p>
</div>
<div className="z-10 flex justify-end">
<button className="bg-primary-fixed text-primary-container font-label-caps text-label-caps px-6 py-3 rounded-xl rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-[24px] hover:bg-white transition-colors duration-200 flex items-center gap-2">
                        Generate Report
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</article>
</section>
</main>
{/*  BottomNavBar (Mobile)  */}
<nav className="bg-white/70 backdrop-blur-lg dark:bg-slate-900/80 font-space-grotesk text-[10px] font-bold uppercase tracking-widest fixed bottom-0 left-0 w-full z-50 md:hidden rounded-t-[24px] border-t border-white/20 dark:border-slate-800/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center h-20 px-4 pb-safe">
{/*  Active Tab  */}
<a className="flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-400 bg-sky-400/15 rounded-xl px-3 py-1 active:scale-95 transition-transform duration-200 w-16 h-14" href="#">
<span className="material-symbols-outlined mb-1" style={{fontVariationSettings: '"FILL" 1'}}>home</span>
<span>Home</span>
</a>
{/*  Inactive Tabs  */}
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200 w-16 h-14" href="#">
<span className="material-symbols-outlined mb-1">eco</span>
<span>Impact</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200 w-16 h-14" href="#">
<span className="material-symbols-outlined mb-1">currency_exchange</span>
<span>Trade</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200 w-16 h-14" href="#">
<span className="material-symbols-outlined mb-1">notifications</span>
<span>Alerts</span>
</a>
<a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 active:scale-95 transition-transform duration-200 w-16 h-14" href="#">
<span className="material-symbols-outlined mb-1">person</span>
<span>Profile</span>
</a>
</nav>

    </>
  );
}
