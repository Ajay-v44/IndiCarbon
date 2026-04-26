/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function AdminPage() {
  return (
    <>

{/*  SideNavBar (Hidden on Mobile)  */}
<nav className="hidden md:flex fixed left-0 h-full w-64 border-r border-white/40 dark:border-emerald-700/30 shadow-xl bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl flex-col py-8 px-6 space-y-8 z-40">
<div className="flex items-center gap-3">
<img alt="IndiCarbon Logo" className="w-10 h-10 rounded-lg object-cover shadow-sm" data-alt="abstract organic leaf shape gradient logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBIfDUiknO7Qu0gb_Rsywy1ZQl4NbN1CkrvnsBNzqQbyV1Kdpbx6tKDL-ny3VQjE-31AC0na0ocLqhpdUwj32qb9os6LoNEEYDAKGd0tFJW8arT1BGYmW1lJ9f34xQASJSpNOXe8rbxiqJAKCM-ydm0OVwg9m0gvjUl4mDWImOhR0L1Kebm1scBfpG7Rg-pmoILqIabFMb7S9B3Lyh7XPtn9nolFfRpnD4cxhYgWUg2bSSJrHi7kpIlS7rtIYYLpXEFmi23nagO5KV"/>
<div>
<h1 className="text-lg font-black text-emerald-950 dark:text-emerald-100 font-['Space_Grotesk']">IndiCarbon AI</h1>
<p className="font-['Space_Grotesk'] uppercase tracking-widest text-[10px] font-semibold text-emerald-800/60 dark:text-emerald-400/50">The Great Restoration</p>
</div>
</div>
<button className="w-full py-3 px-4 bg-emerald-900 text-white rounded-lg font-title-sm text-title-sm shadow-md hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-sm">add</span> New Simulation
        </button>
<ul className="flex-1 space-y-2 mt-8 font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold">
<li>
<a className="flex items-center gap-4 px-4 py-3 rounded-lg text-emerald-900 dark:text-emerald-100 relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-1 after:bg-emerald-600 after:rounded-l-full bg-emerald-50/50" href="#">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>dashboard</span>
                    Command Center
                </a>
</li>
<li>
<a className="flex items-center gap-4 px-4 py-3 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all" href="#">
<span className="material-symbols-outlined">science</span>
                    Climate Lab
                </a>
</li>
<li>
<a className="flex items-center gap-4 px-4 py-3 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all" href="#">
<span className="material-symbols-outlined">history_edu</span>
                    Restoration Log
                </a>
</li>
<li>
<a className="flex items-center gap-4 px-4 py-3 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all" href="#">
<span className="material-symbols-outlined">psychology</span>
                    Eco Intelligence
                </a>
</li>
</ul>
<ul className="space-y-2 font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold border-t border-white/40 pt-6">
<li>
<a className="flex items-center gap-4 px-4 py-3 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all" href="#">
<span className="material-symbols-outlined">help_outline</span>
                    Support
                </a>
</li>
<li>
<a className="flex items-center gap-4 px-4 py-3 rounded-lg text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all" href="#">
<span className="material-symbols-outlined">manage_accounts</span>
                    Account
                </a>
</li>
</ul>
</nav>
{/*  Main Content Area  */}
<div className="flex-1 flex flex-col md:ml-64 h-full relative z-10">
{/*  TopNavBar  */}
<header className="hidden md:flex w-full top-0 border-b shadow-sm bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl justify-between items-center px-8 py-4 border-white/40 dark:border-emerald-700/30 z-30 font-['Space_Grotesk'] antialiased sticky">
<div className="flex-1">
{/*  Spacer for layout balance  */}
</div>
<div className="flex items-center gap-6 justify-end flex-1">
<div className="relative w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
<input className="w-full pl-10 pr-4 py-2 rounded-full bg-white/40 border border-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-emerald-900 dark:text-emerald-50 placeholder-emerald-800/40 text-sm" placeholder="Search eco-metrics..." type="text"/>
</div>
<button className="text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors p-2 rounded-full">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors p-2 rounded-full">
<span className="material-symbols-outlined">settings</span>
</button>
<img alt="Chief Ecology Officer" className="w-10 h-10 rounded-full border-2 border-white/80 shadow-sm object-cover" data-alt="professional portrait of female executive in bright modern office" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVzzG_J1-LQiUVGFx4Dke7CxDngol2rl5VK7OQPWJPZFavj-tsJh5r93uIFw0aX5UcJZRQ3_q8Ho1vaSI5_dok8sOZLen2A_Iage6-QmNooptFRFn-X8mMWxem4m_qMvdBE2W41tis0b1_w-pLdpLt4KVOnDOFFI6QQ7sKfNVcPSfBFV9dkhutVjo5W_SJ70tHYkzi2u-Em7qh9fHPe2gySFhL67oPAmPNjLNT40CiScerPKWOVQLsA0tzSNGYHV_aFXNFAzNV2H1r"/>
</div>
</header>
{/*  Canvas  */}
<main className="flex-1 overflow-y-auto p-container-padding space-y-gutter pb-32 md:pb-container-padding">
{/*  Page Header  */}
<div className="flex justify-between items-end mb-8">
<div>
<h2 className="font-display-lg text-display-lg text-emerald-950">Command Center</h2>
<p className="font-title-sm text-title-sm text-on-surface-variant mt-2">Macro-environmental administration &amp; sales intelligence.</p>
</div>
<div className="flex gap-4">
<button className="glass-card px-6 py-2 rounded-full font-title-sm text-title-sm text-emerald-900 hover:bg-white/60 transition-colors">Export Report</button>
</div>
</div>
{/*  Macro Metrics Grid  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<div className="glass-card rounded-xl p-glass-padding relative overflow-hidden group">
<div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
<p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Market Liquidity</p>
<h3 className="font-headline-md text-headline-md text-emerald-950">₹4.5B</h3>
<div className="flex items-center gap-2 mt-4 text-emerald-600">
<span className="material-symbols-outlined text-sm">trending_up</span>
<span className="font-title-sm text-[14px]">+12.5% this quarter</span>
</div>
</div>
<div className="glass-card rounded-xl p-glass-padding relative overflow-hidden group">
<div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
<p className="font-label-caps text-label-caps text-on-surface-variant mb-2">National Compliance</p>
<h3 className="font-headline-md text-headline-md text-emerald-950">84.2%</h3>
<div className="w-full bg-surface-variant rounded-full h-2 mt-4 overflow-hidden shadow-inner">
<div className="bg-emerald-600 h-2 rounded-full" style={{width: '84.2%'}}></div>
</div>
</div>
<div className="glass-card rounded-xl p-glass-padding relative overflow-hidden group">
<div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all"></div>
<p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Total Offsets Issued</p>
<h3 className="font-headline-md text-headline-md text-emerald-950">12.4M</h3>
<div className="flex items-center gap-2 mt-4 text-on-surface-variant">
<span className="font-title-sm text-[14px]">Metric Tons CO₂e</span>
</div>
</div>
</div>
{/*  Geospatial & Kanban Row  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Geospatial Intelligence (8 cols)  */}
<div className="lg:col-span-8 glass-card rounded-xl flex flex-col overflow-hidden h-[500px]">
<div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/20">
<h3 className="font-title-sm text-title-sm text-emerald-950 flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-700">public</span> Geospatial Intelligence
                        </h3>
<span className="px-3 py-1 bg-white/60 rounded-full font-label-caps text-label-caps text-emerald-800">Live Telemetry</span>
</div>
<div className="flex-1 relative bg-emerald-50/50">
{/*  Simulated Map Background  */}
<img alt="Map of India" className="w-full h-full object-cover opacity-80 mix-blend-multiply" data-alt="clean minimal 3D topographic map visualization of India with soft lighting" data-location="India" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgP3uABIBWIHFTqLHALUCBae0PvhR9PDIcEq1l-nT8zZIDdXSMnBbGYMgw60KxbqiV5wN_pBjX6xmz-LpzL7cGrKSp6Meyfuq7FLBsleU0241z4yfampZeuizAeTsG7TdnFakgLU1lBU-4NgJVuQHMjvR8eI45mFUdkJMshWUBZR1f1lVgiaaj1pMryndXwvjm3Tzev7WgfTEBtxEqE89RL8_U5PEBZRWQw0MBSDfwHCtH51d5rJ279LwshdPt6UC41_SIxgaiExyI"/>
{/*  Map Overlays  */}
<div className="absolute top-[30%] left-[20%] group">
<div className="w-4 h-4 bg-error rounded-full animate-pulse shadow-[0_0_15px_rgba(186,26,26,0.6)]"></div>
<div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity w-48 border border-white/50 pointer-events-none">
<p className="font-title-sm text-sm text-emerald-950 font-bold mb-1">Jamnagar Cluster</p>
<p className="font-label-caps text-label-caps text-error mb-2">High Emissions</p>
<div className="flex justify-between items-center pt-2 border-t border-surface-variant">
<span className="text-xs text-on-surface-variant">TAM Potential</span>
<span className="text-xs font-bold text-emerald-700">₹850M</span>
</div>
</div>
</div>
<div className="absolute top-[40%] left-[25%] group">
<div className="w-3 h-3 bg-secondary rounded-full shadow-[0_0_10px_rgba(0,99,154,0.5)]"></div>
<div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity w-48 border border-white/50 pointer-events-none">
<p className="font-title-sm text-sm text-emerald-950 font-bold mb-1">Kutch Region</p>
<p className="font-label-caps text-label-caps text-secondary mb-2">Offset Verified</p>
</div>
</div>
</div>
</div>
{/*  Kanban Queue (4 cols)  */}
<div className="lg:col-span-4 glass-card rounded-xl p-glass-padding flex flex-col h-[500px]">
<div className="flex justify-between items-center mb-6">
<h3 className="font-title-sm text-title-sm text-emerald-950 flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-700">view_kanban</span> Regulatory Queue
                        </h3>
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-emerald-700">more_horiz</span>
</div>
<div className="flex-1 overflow-y-auto space-y-4 pr-2">
{/*  Kanban Card  */}
<div className="bg-white/60 border border-white/80 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab">
<div className="flex justify-between items-start mb-2">
<span className="px-2 py-1 bg-error-container text-on-error-container rounded font-label-caps text-[10px]">Pending Audit</span>
<span className="material-symbols-outlined text-sm text-on-surface-variant">factory</span>
</div>
<p className="font-title-sm text-sm text-emerald-950 mb-1">Tata Steel Pvt Ltd</p>
<p className="font-body-md text-xs text-on-surface-variant mb-3">Q3 Emissions Report Verification</p>
<div className="flex justify-between items-center">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-emerald-200 border border-white flex items-center justify-center text-[10px] font-bold text-emerald-900">JS</div>
</div>
<span className="text-xs font-bold text-emerald-700">24h SLA</span>
</div>
</div>
{/*  Kanban Card  */}
<div className="bg-white/60 border border-white/80 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab">
<div className="flex justify-between items-start mb-2">
<span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded font-label-caps text-[10px]">Issue CCCs</span>
<span className="material-symbols-outlined text-sm text-on-surface-variant">eco</span>
</div>
<p className="font-title-sm text-sm text-emerald-950 mb-1">Adani Green</p>
<p className="font-body-md text-xs text-on-surface-variant mb-3">Solar Grid Expansion Kutch</p>
<div className="flex justify-between items-center">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-blue-200 border border-white flex items-center justify-center text-[10px] font-bold text-blue-900">AK</div>
</div>
<span className="text-xs font-bold text-emerald-700">Ready</span>
</div>
</div>
</div>
<button className="w-full mt-4 py-2 border border-dashed border-emerald-700/30 rounded-lg text-emerald-800 text-sm font-title-sm hover:bg-emerald-50/50 transition-colors">View All Queue</button>
</div>
</div>
{/*  Master Company Ledger  */}
<div className="glass-card rounded-xl p-glass-padding">
<div className="flex justify-between items-center mb-6">
<div>
<h3 className="font-headline-md text-[24px] text-emerald-950">Master Company Ledger</h3>
<p className="font-body-md text-sm text-on-surface-variant">High-density grid for compliance tracking and CCC issuance.</p>
</div>
<div className="flex gap-2">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">filter_list</span>
<select className="pl-9 pr-8 py-2 rounded-lg bg-white/40 border border-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-emerald-900">
<option>All Sectors</option>
<option>Energy</option>
<option>Manufacturing</option>
</select>
</div>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-surface-variant/50">
<th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">Company Entity</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">Compliance %</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">Target (Tons)</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant">CCC Balance</th>
<th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant text-right">Admin Actions</th>
</tr>
</thead>
<tbody className="font-mono-stream text-mono-stream text-emerald-950">
<tr className="border-b border-surface-variant/30 hover:bg-white/30 transition-colors group">
<td className="py-4 px-4 flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center font-title-sm text-xs text-on-surface">RIL</div>
<span className="font-title-sm text-sm">Reliance Ind.</span>
</td>
<td className="py-4 px-4">
<div className="flex items-center gap-2">
<span className="text-error">78%</span>
<div className="w-16 bg-surface-variant rounded-full h-1.5"><div className="bg-error h-1.5 rounded-full" style={{width: '78%'}}></div></div>
</div>
</td>
<td className="py-4 px-4">4,500,000</td>
<td className="py-4 px-4 text-emerald-700 font-bold">120,500</td>
<td className="py-4 px-4 text-right">
<button className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-title-sm hover:bg-emerald-200 transition-colors">Verify Audit</button>
</td>
</tr>
<tr className="border-b border-surface-variant/30 hover:bg-white/30 transition-colors group">
<td className="py-4 px-4 flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center font-title-sm text-xs text-on-surface">JWS</div>
<span className="font-title-sm text-sm">JSW Steel</span>
</td>
<td className="py-4 px-4">
<div className="flex items-center gap-2">
<span className="text-secondary">92%</span>
<div className="w-16 bg-surface-variant rounded-full h-1.5"><div className="bg-secondary h-1.5 rounded-full" style={{width: '92%'}}></div></div>
</div>
</td>
<td className="py-4 px-4">2,100,000</td>
<td className="py-4 px-4 text-emerald-700 font-bold">850,000</td>
<td className="py-4 px-4 text-right">
<button className="px-3 py-1 bg-primary text-white rounded text-xs font-title-sm shadow-sm hover:bg-primary-fixed-variant transition-colors">Issue CCCs</button>
</td>
</tr>
<tr className="hover:bg-white/30 transition-colors group">
<td className="py-4 px-4 flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center font-title-sm text-xs text-on-surface">ITC</div>
<span className="font-title-sm text-sm">ITC Limited</span>
</td>
<td className="py-4 px-4">
<div className="flex items-center gap-2">
<span className="text-emerald-600">100%</span>
<div className="w-16 bg-surface-variant rounded-full h-1.5"><div className="bg-emerald-600 h-1.5 rounded-full" style={{width: '100%'}}></div></div>
</div>
</td>
<td className="py-4 px-4">800,000</td>
<td className="py-4 px-4 text-emerald-700 font-bold">2,100,000</td>
<td className="py-4 px-4 text-right">
<button className="px-3 py-1 border border-emerald-300 text-emerald-800 rounded text-xs font-title-sm hover:bg-emerald-50 transition-colors">View Profile</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</main>
</div>
{/*  BottomNavBar (Mobile Only)  */}
<nav className="md:hidden fixed bottom-0 w-full rounded-t-3xl border-t z-50 border-white/40 dark:border-emerald-700/30 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] bg-white/80 dark:bg-emerald-950/80 backdrop-blur-xl flex justify-around items-center px-4 pb-6 pt-3">
<button className="flex flex-col items-center justify-center bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-50 rounded-2xl p-2 w-16 scale-90 duration-150 font-['Space_Grotesk'] text-[10px] font-medium">
<span className="material-symbols-outlined mb-1" style={{fontVariationSettings: '"FILL" 1'}}>grid_view</span>
            Home
        </button>
<button className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 font-['Space_Grotesk'] text-[10px] font-medium active:bg-emerald-200/50 dark:active:bg-emerald-800/50">
<span className="material-symbols-outlined mb-1">biotech</span>
            Labs
        </button>
<button className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 font-['Space_Grotesk'] text-[10px] font-medium active:bg-emerald-200/50 dark:active:bg-emerald-800/50">
<span className="material-symbols-outlined mb-1">query_stats</span>
            Data
        </button>
<button className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 font-['Space_Grotesk'] text-[10px] font-medium active:bg-emerald-200/50 dark:active:bg-emerald-800/50">
<span className="material-symbols-outlined mb-1">person</span>
            User
        </button>
</nav>

    </>
  );
}
