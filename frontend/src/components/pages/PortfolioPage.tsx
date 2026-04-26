/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function PortfolioPage() {
  return (
    <>

{/*  SideNavBar (Web)  */}
<nav className="hidden md:flex flex-col h-full py-8 px-6 space-y-8 bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl fixed left-0 h-full w-64 border-r border-white/40 dark:border-emerald-700/30 shadow-xl z-40">
<div className="flex items-center space-x-3 mb-8">
<div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-display-lg text-title-sm font-bold shadow-inner">
                IC
            </div>
<div>
<div className="font-['Space_Grotesk'] text-lg font-black text-emerald-950 dark:text-emerald-100">IndiCarbon AI</div>
<div className="font-title-sm text-title-sm text-xs text-on-surface-variant/70">The Great Restoration</div>
</div>
</div>
<ul className="flex-grow space-y-4">
<li>
<a className="flex items-center space-x-3 p-3 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold group" href="#">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">dashboard</span>
<span>Command Center</span>
</a>
</li>
<li>
<a className="flex items-center space-x-3 p-3 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold group" href="#">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">science</span>
<span>Climate Lab</span>
</a>
</li>
<li>
<a className="flex items-center space-x-3 p-3 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold group" href="#">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">history_edu</span>
<span>Restoration Log</span>
</a>
</li>
<li>
<a className="flex items-center space-x-3 p-3 rounded-lg text-emerald-900 dark:text-emerald-100 relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-1 after:bg-emerald-600 after:rounded-l-full font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold group" href="#">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>psychology</span>
<span>Eco Intelligence</span>
</a>
</li>
</ul>
<button className="w-full py-3 bg-primary-container text-on-primary-container rounded-lg font-label-caps text-label-caps shadow-md hover:shadow-lg transition-shadow active:scale-95 duration-150 flex items-center justify-center space-x-2">
<span className="material-symbols-outlined text-[18px]">add</span>
<span>New Simulation</span>
</button>
<div className="pt-6 border-t border-white/40 dark:border-emerald-700/30 space-y-2">
<a className="flex items-center space-x-3 p-2 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold" href="#">
<span className="material-symbols-outlined text-[18px]">help_outline</span>
<span>Support</span>
</a>
<a className="flex items-center space-x-3 p-2 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold" href="#">
<span className="material-symbols-outlined text-[18px]">manage_accounts</span>
<span>Account</span>
</a>
</div>
</nav>
{/*  Main Content Area  */}
<main className="flex-1 md:ml-64 relative min-h-screen pb-24 md:pb-0">
{/*  TopNavBar (Web)  */}
<header className="hidden md:flex justify-between items-center w-full px-8 py-4 bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl docked full-width top-0 border-b border-white/40 dark:border-emerald-700/30 shadow-sm sticky z-30 font-['Space_Grotesk'] antialiased">
<div className="text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-50">IndiCarbon AI</div>
<div className="flex items-center space-x-6">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
<input className="pl-10 pr-4 py-2 rounded-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary-container text-sm w-64 shadow-inner transition-all" placeholder="Search Vault..." type="text"/>
</div>
<div className="flex items-center space-x-4 text-emerald-800 dark:text-emerald-400">
<button className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors">
<span className="material-symbols-outlined">settings</span>
</button>
<img alt="Chief Ecology Officer" className="w-10 h-10 rounded-full object-cover border-2 border-surface-container shadow-sm cursor-pointer hover:opacity-80 transition-opacity" data-alt="Portrait of a professional man in a modern office, cinematic lighting, corporate headshot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyjKSrIImL65_yEcJ1UfMLIP3Su3Y8BJwBYk64T-spPN1kRqNeFHbPyzLVjvyUptuzMGgnrqHaoQyfGcOGeIfxA69DCETRW3UOabEuNU7BqtyWfzgcg2RmAsHMNiIbUHamXXWlMHSgKBJnu9bc_DV95rWrFFdc4V0F-NiIrpwBcPa58mr2MjWyHeuhi5Bndj3majavye5eOieF7xoXdvMcK9T2UxwgNMYDoCuQa2mxBgOKvDdLzaH8vDbBWI36Dp69rAxU9Yml-shl"/>
</div>
</div>
</header>
{/*  TopNavBar (Mobile Fallback)  */}
<header className="md:hidden flex justify-between items-center w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-white/40 sticky top-0 z-30 shadow-sm">
<div className="font-display-lg text-title-sm font-bold text-primary">Carbon Portfolio</div>
<button className="p-2 rounded-full bg-surface-container-low">
<span className="material-symbols-outlined text-primary">notifications</span>
</button>
</header>
<div className="p-container-padding max-w-[1400px] mx-auto space-y-8">
{/*  Header Section  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
<div>
<h1 className="font-display-lg text-display-lg text-on-surface mb-2 tracking-tight">The Digital Vault</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Manage your certified high-integrity Custom Carbon Credits (CCCs). Each asset is permanently recorded on the ledger with complete provenance.</p>
</div>
<div className="flex gap-4">
<div className="bg-surface-container-low px-6 py-3 rounded-2xl shadow-inner border border-white/50 flex flex-col items-end">
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Total Held</span>
<span className="font-headline-md text-headline-md text-primary-container">12,450 <span className="text-title-sm text-on-surface-variant font-normal">tCO₂e</span></span>
</div>
</div>
</div>
{/*  Bento Grid layout for Portfolio  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Main Portfolio List (8 columns)  */}
<div className="lg:col-span-8 flex flex-col gap-unit">
{/*  Search/Filter Bar inside Card  */}
<div className="bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl border border-white/40 dark:border-emerald-700/30 shadow-sm rounded-t-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
<div className="relative w-full sm:w-auto flex-1 max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
<input className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-sm shadow-inner transition-all" placeholder="Search by Serial ID or Project..." type="text"/>
</div>
<div className="flex gap-2 w-full sm:w-auto">
<button className="px-4 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-label-caps text-label-caps flex items-center gap-2 hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                            </button>
<button className="px-4 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-label-caps text-label-caps flex items-center gap-2 hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined text-[18px]">swap_vert</span> Sort
                            </button>
</div>
</div>
{/*  Asset Items  */}
<div className="flex flex-col gap-unit">
{/*  Asset Item 1  */}
<div className="bg-white/80 dark:bg-emerald-900/40 backdrop-blur-xl border border-white/40 dark:border-emerald-700/30 shadow-md rounded-xl p-glass-padding hover:shadow-lg transition-shadow relative overflow-hidden group">
{/*  Subtle decorative bg  */}
<div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl group-hover:bg-primary-fixed/30 transition-colors z-0"></div>
<div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
<div className="flex-1">
<div className="flex items-center gap-3 mb-2">
<span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-stream text-[11px] font-bold tracking-wider border border-secondary-fixed-dim/30 shadow-sm">ID: CCC-2023-AMZ-0892</span>
<span className="flex items-center gap-1 font-label-caps text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Active
                                        </span>
</div>
<h3 className="font-title-sm text-title-sm text-on-surface mb-1">Amazonian Reforestation Block Alpha</h3>
<p className="font-body-md text-sm text-on-surface-variant mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">location_on</span> Para, Brazil • Vintage: 2023
                                    </p>
<div className="flex flex-wrap gap-4 mt-auto">
<div className="flex flex-col">
<span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Volume</span>
<span className="font-title-sm text-lg text-primary-container">2,500 tCO₂e</span>
</div>
<div className="w-px h-10 bg-outline-variant/30 hidden sm:block"></div>
<div className="flex flex-col">
<span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Protocol</span>
<span className="font-title-sm text-lg text-on-surface">Verra VM0047</span>
</div>
<div className="w-px h-10 bg-outline-variant/30 hidden sm:block"></div>
<div className="flex flex-col">
<span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Purchase Date</span>
<span className="font-title-sm text-lg text-on-surface">Oct 12, 2023</span>
</div>
</div>
</div>
<div className="flex flex-row md:flex-col justify-end gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-6">
<button className="flex-1 py-2 px-4 rounded-lg border border-primary-container/20 text-primary-container font-label-caps text-label-caps hover:bg-primary-container/5 transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[16px]">data_object</span> Metadata
                                    </button>
<button className="flex-1 py-2 px-4 rounded-lg border border-primary-container/20 text-primary-container font-label-caps text-label-caps hover:bg-primary-container/5 transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[16px]">history</span> Audit Trail
                                    </button>
<button className="flex-1 py-2 px-4 rounded-lg bg-error text-on-error font-label-caps text-label-caps shadow-md hover:shadow-lg hover:bg-error/90 transition-all flex items-center justify-center gap-2 mt-auto">
<span className="material-symbols-outlined text-[16px]">local_fire_department</span> Retire Credit
                                    </button>
</div>
</div>
</div>
{/*  Asset Item 2  */}
<div className="bg-white/80 dark:bg-emerald-900/40 backdrop-blur-xl border border-white/40 dark:border-emerald-700/30 shadow-md rounded-xl p-glass-padding hover:shadow-lg transition-shadow relative overflow-hidden group">
<div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
<div className="flex-1">
<div className="flex items-center gap-3 mb-2">
<span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-stream text-[11px] font-bold tracking-wider border border-secondary-fixed-dim/30 shadow-sm">ID: CCC-2022-MGR-1440</span>
<span className="flex items-center gap-1 font-label-caps text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Active
                                        </span>
</div>
<h3 className="font-title-sm text-title-sm text-on-surface mb-1">Coastal Mangrove Restoration Project</h3>
<p className="font-body-md text-sm text-on-surface-variant mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">location_on</span> Sumatra, Indonesia • Vintage: 2022
                                    </p>
<div className="flex flex-wrap gap-4 mt-auto">
<div className="flex flex-col">
<span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Volume</span>
<span className="font-title-sm text-lg text-primary-container">8,200 tCO₂e</span>
</div>
<div className="w-px h-10 bg-outline-variant/30 hidden sm:block"></div>
<div className="flex flex-col">
<span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Protocol</span>
<span className="font-title-sm text-lg text-on-surface">Blue Carbon Initiative</span>
</div>
<div className="w-px h-10 bg-outline-variant/30 hidden sm:block"></div>
<div className="flex flex-col">
<span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Purchase Date</span>
<span className="font-title-sm text-lg text-on-surface">Jan 05, 2023</span>
</div>
</div>
</div>
<div className="flex flex-row md:flex-col justify-end gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-6">
<button className="flex-1 py-2 px-4 rounded-lg border border-primary-container/20 text-primary-container font-label-caps text-label-caps hover:bg-primary-container/5 transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[16px]">data_object</span> Metadata
                                    </button>
<button className="flex-1 py-2 px-4 rounded-lg border border-primary-container/20 text-primary-container font-label-caps text-label-caps hover:bg-primary-container/5 transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[16px]">history</span> Audit Trail
                                    </button>
<button className="flex-1 py-2 px-4 rounded-lg bg-error text-on-error font-label-caps text-label-caps shadow-md hover:shadow-lg hover:bg-error/90 transition-all flex items-center justify-center gap-2 mt-auto">
<span className="material-symbols-outlined text-[16px]">local_fire_department</span> Retire Credit
                                    </button>
</div>
</div>
</div>
{/*  Retired Asset Item (Dimmed)  */}
<div className="bg-surface-container-low border border-outline-variant/20 shadow-sm rounded-b-xl p-glass-padding opacity-75 grayscale-[0.5]">
<div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
<div className="flex-1">
<div className="flex items-center gap-3 mb-2">
<span className="px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-mono-stream text-[11px] font-bold tracking-wider border border-outline-variant/30">ID: CCC-2021-WND-0012</span>
<span className="flex items-center gap-1 font-label-caps text-[10px] text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full">
<span className="material-symbols-outlined text-[12px]">done_all</span> Retired
                                        </span>
</div>
<h3 className="font-title-sm text-title-sm text-on-surface-variant mb-1 line-through decoration-outline-variant/50">North Sea Wind Farm Expansion</h3>
<p className="font-body-md text-sm text-on-surface-variant mb-4">
                                        Vintage: 2021 • Retired on: Nov 18, 2023
                                    </p>
</div>
<div className="flex items-center md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-6">
<button className="w-full py-2 px-4 rounded-lg border border-outline-variant text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[16px]">receipt_long</span> View Certificate
                                    </button>
</div>
</div>
</div>
</div>
{/*  Pagination  */}
<div className="flex justify-center mt-4 pb-8">
<div className="flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-2 border border-white/50 shadow-sm">
<button className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant disabled:opacity-50"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
<span className="font-label-caps text-[12px] px-2 text-on-surface">Page 1 of 3</span>
<button className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
</div>
</div>
</div>
{/*  Side Panel (4 columns)  */}
<div className="lg:col-span-4 flex flex-col gap-unit">
{/*  Ledger Status Card  */}
<div className="bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl border border-white/40 dark:border-emerald-700/30 shadow-xl rounded-2xl p-glass-padding sticky top-[100px]">
<div className="flex items-center gap-3 mb-6 border-b border-outline-variant/20 pb-4">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined">link</span>
</div>
<div>
<h3 className="font-title-sm text-title-sm text-on-surface">Ledger Status</h3>
<p className="font-body-md text-[12px] text-on-surface-variant">Connected to IndiChain Network</p>
</div>
<div className="ml-auto flex items-center gap-1 bg-primary-container/10 px-2 py-1 rounded-full border border-primary-container/20">
<span className="w-2 h-2 rounded-full bg-primary-fixed-dim shadow-[0_0_8px_rgba(149,215,142,0.8)]"></span>
<span className="font-mono-stream text-[10px] text-primary-container font-bold">SYNCED</span>
</div>
</div>
{/*  AI Stream Log inside Side Card  */}
<div className="bg-surface-container-lowest rounded-xl shadow-inner border border-outline-variant/30 p-4 h-[300px] overflow-hidden flex flex-col relative">
<div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-surface-container-lowest to-transparent z-10"></div>
<div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface-container-lowest to-transparent z-10 pointer-events-none"></div>
<div className="flex-1 overflow-y-auto space-y-3 font-mono-stream text-mono-stream scrollbar-hide flex flex-col justify-end pb-4">
<div className="opacity-40 text-on-surface-variant border-l-2 border-outline-variant/30 pl-3 py-1">
<div className="text-[10px] text-outline mb-0.5">14:02:11 UTC</div>
<div>[NODE_8] Verified CCC-2022-MGR-1440 provenance hash.</div>
</div>
<div className="opacity-60 text-on-surface-variant border-l-2 border-secondary-fixed pl-3 py-1 bg-secondary-fixed/5 rounded-r-sm">
<div className="text-[10px] text-outline mb-0.5">14:05:33 UTC</div>
<div>[AUDIT] Routine integrity check passed for portfolio block #88492.</div>
</div>
<div className="opacity-80 text-on-surface-variant border-l-2 border-outline-variant/30 pl-3 py-1">
<div className="text-[10px] text-outline mb-0.5">14:10:05 UTC</div>
<div>[SYNC] fetching latest market valuation data...</div>
</div>
<div className="opacity-100 text-on-surface border-l-2 border-primary pl-3 py-1 bg-primary/5 rounded-r-sm shadow-sm relative">
<div className="absolute -left-[5px] top-2.5 w-2 h-2 rounded-full bg-primary animate-ping"></div>
<div className="text-[10px] text-primary mb-0.5 font-bold">14:12:40 UTC - LIVE</div>
<div>[VAULT] Ready. Awaiting user commands. Vault integrity: 100%.</div>
</div>
</div>
</div>
<div className="mt-6">
<div className="flex justify-between items-center mb-2">
<span className="font-label-caps text-label-caps text-on-surface-variant">Network Load</span>
<span className="font-mono-stream text-[12px] text-on-surface">24%</span>
</div>
<div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-secondary-container to-primary-container w-[24%] rounded-full"></div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
{/*  BottomNavBar (Mobile)  */}
<nav className="md:hidden bg-white/80 dark:bg-emerald-950/80 backdrop-blur-xl fixed bottom-0 w-full rounded-t-3xl border-t z-50 border-white/40 dark:border-emerald-700/30 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] flex justify-around items-center px-4 pb-6 pt-3 font-['Space_Grotesk'] text-[10px] font-medium">
<a className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 active:bg-emerald-200/50 dark:active:bg-emerald-800/50 rounded-2xl transition-colors" href="#">
<span className="material-symbols-outlined mb-1">grid_view</span>
<span>Home</span>
</a>
<a className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 active:bg-emerald-200/50 dark:active:bg-emerald-800/50 rounded-2xl transition-colors" href="#">
<span className="material-symbols-outlined mb-1">biotech</span>
<span>Labs</span>
</a>
<a className="flex flex-col items-center justify-center bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-50 rounded-2xl p-2 w-16 shadow-inner" href="#">
<span className="material-symbols-outlined mb-1" style={{fontVariationSettings: '"FILL" 1'}}>query_stats</span>
<span>Data</span>
</a>
<a className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 active:bg-emerald-200/50 dark:active:bg-emerald-800/50 rounded-2xl transition-colors" href="#">
<span className="material-symbols-outlined mb-1">person</span>
<span>User</span>
</a>
</nav>
{/*  Overlay/Modal (Hidden by default, shown for demonstration of the high-stakes action)  */}
<div className="hidden fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
<div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"></div>
<div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-white/50 w-full max-w-md relative z-10 overflow-hidden transform scale-100 transition-transform">
<div className="bg-error-container/30 px-6 py-4 border-b border-error/10 flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
<span className="material-symbols-outlined">warning</span>
</div>
<h2 className="font-display-lg text-title-sm font-bold text-on-surface">Confirm Retirement</h2>
</div>
<div className="p-6 space-y-4">
<p className="font-body-md text-on-surface-variant">You are about to permanently retire the following Carbon Credit. This action will write a final state to the blockchain and cannot be undone.</p>
<div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 font-mono-stream text-sm text-on-surface">
<div className="flex justify-between border-b border-outline-variant/20 pb-2 mb-2">
<span className="text-outline">Asset ID</span>
<span className="font-bold">CCC-2023-AMZ-0892</span>
</div>
<div className="flex justify-between border-b border-outline-variant/20 pb-2 mb-2">
<span className="text-outline">Volume</span>
<span className="font-bold">2,500 tCO₂e</span>
</div>
<div className="flex justify-between">
<span className="text-outline">Action</span>
<span className="font-bold text-error">PERMANENT_RETIRE</span>
</div>
</div>
<div className="pt-4 flex gap-3">
<button className="flex-1 py-3 px-4 rounded-xl border border-outline-variant text-on-surface font-label-caps text-label-caps hover:bg-surface-container transition-colors">Cancel</button>
<button className="flex-1 py-3 px-4 rounded-xl bg-error text-on-error font-label-caps text-label-caps shadow-md hover:bg-error/90 hover:shadow-lg transition-all flex justify-center items-center gap-2">
<span className="material-symbols-outlined text-[18px]">verified</span> Execute Burn
                    </button>
</div>
</div>
</div>
</div>

    </>
  );
}
