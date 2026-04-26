/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function SimulatorPage() {
  return (
    <>

{/*  SideNavBar (Web)  */}
<nav className="hidden md:flex flex-col h-full py-8 px-6 space-y-8 bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl fixed left-0 w-64 border-r border-white/40 dark:border-emerald-700/30 shadow-xl z-50">
<div className="flex items-center space-x-3 mb-8">
<img alt="IndiCarbon Logo" className="w-10 h-10 rounded-full" data-alt="Abstract emerald green gradient sphere resembling a stylized earth or tech logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdbLAdgIPmGaAkxT87fDVuX44sWqnxN-T_mRpDQtqL94ZgmhNRDQq0hYdcJdyGkK_isVjSOorkAnXsSHAANduNv5w4f5Rgbr0QH4MaZ5PpG_2N1xitpC9LkrjRt89ane9Zj7JmJ9nsbXa5I6SSEZWGuTEJZlqXS5IcbZSt7x1JOqc-VePjtCqynFvafB78QBFjLN0F09aPIFGdWz7yg6cpZ8WPBOkoMId4O8DIayI9CkIVqlhFEyD-yz0iX9q3XN8FdA5a-XeeBpDc"/>
<div>
<h1 className="text-lg font-black text-emerald-950 dark:text-emerald-100 font-['Space_Grotesk']">IndiCarbon AI</h1>
<p className="text-[10px] text-emerald-800/60 font-['Manrope'] uppercase tracking-widest">The Great Restoration</p>
</div>
</div>
<button className="w-full bg-primary text-on-primary py-3 rounded-full font-label-caps text-label-caps font-bold hover:opacity-90 transition-opacity">
            New Simulation
        </button>
<div className="flex-1 mt-8">
<ul className="space-y-4 font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold">
<li>
<a className="flex items-center space-x-4 p-2 text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span>Command Center</span>
</a>
</li>
<li>
<a className="flex items-center space-x-4 p-2 text-emerald-900 dark:text-emerald-100 relative after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-1 after:bg-emerald-600 after:rounded-l-full bg-emerald-50/50 dark:bg-emerald-900/30 rounded-lg Active: translate-x-1 duration-200" href="#">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>science</span>
<span>Climate Lab</span>
</a>
</li>
<li>
<a className="flex items-center space-x-4 p-2 text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">history_edu</span>
<span>Restoration Log</span>
</a>
</li>
<li>
<a className="flex items-center space-x-4 p-2 text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">psychology</span>
<span>Eco Intelligence</span>
</a>
</li>
</ul>
</div>
<div className="mt-auto">
<ul className="space-y-4 font-['Space_Grotesk'] uppercase tracking-widest text-xs font-semibold">
<li>
<a className="flex items-center space-x-4 p-2 text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">help_outline</span>
<span>Support</span>
</a>
</li>
<li>
<a className="flex items-center space-x-4 p-2 text-emerald-800/60 dark:text-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">manage_accounts</span>
<span>Account</span>
</a>
</li>
</ul>
</div>
</nav>
{/*  TopNavBar (Web/Mobile)  */}
<div className="flex-1 flex flex-col md:ml-64 relative min-h-screen">
<header className="hidden md:flex justify-between items-center w-full px-8 py-4 bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl docked full-width top-0 border-b border-white/40 dark:border-emerald-700/30 shadow-sm z-40 sticky">
<div className="flex items-center">
{/*  Branding hidden on desktop as sidebar handles it  */}
</div>
<div className="flex items-center space-x-6">
{/*  Search on right per JSON  */}
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
<input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary w-64 bg-white/50 backdrop-blur-sm" placeholder="Search scenarios..." type="text"/>
</div>
<button className="text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors p-2 rounded-full">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors p-2 rounded-full">
<span className="material-symbols-outlined">settings</span>
</button>
<img alt="Chief Ecology Officer" className="w-10 h-10 rounded-full border-2 border-primary-fixed" data-alt="Professional portrait of a woman in a modern office environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7P-3l5k14q7-H-_mcNPrSkFgxNBowqdN8wnmk0fMjuNHgnRB59dmNxTviKpTlSkZMpJ0ZFxpJfoan6Y9VugM96XEQxQVkCyO_PXxxKAqJVhhVdAuKyWtXRTukP9CDxUp6e4G5s4U_ISiCC08yA5wCDANBBkchNVn6mkcBj2bh1UfbdTtTNFTCVmXpWDHO_BrFCqae8zitLHh8qGGY3XZ__zzNEsoYeIyldJNbU0N4tNTDv0k_4LKIhDn_wha6WmtGt2zPVN5fXsvZ"/>
</div>
</header>
{/*  Mobile Top Nav (Simplified)  */}
<header className="md:hidden flex justify-between items-center w-full px-4 py-3 bg-white/60 backdrop-blur-2xl sticky top-0 z-40">
<h1 className="text-xl font-bold tracking-tight text-emerald-900 font-['Space_Grotesk'] antialiased">IndiCarbon AI</h1>
<img alt="Chief Ecology Officer" className="w-8 h-8 rounded-full border border-primary-fixed" data-alt="Professional portrait of a woman in a modern office environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADOhlOf_CvoQoTxzrqa-lZ2_r8dDsyGQf6k8waULdMen2fYu4BKhiAqDD0-imImclhPQdtUCELKvOOcLX8u04fNzzttyby2000l0aX4Yhqh2fhy7XECNJM79p-icIfY4824zcD0eGUxFaTXsuORBk_0cuY9Hb6ftg5rUhtJvDnhEKVZOH_16_KmsRhnpbPlIwhKHX2R_uscyJkfcVjp1iHkdUC75bfz_9Y1qX85JF3LfPhRGyU9z4Vm-PqlS_wwSOez2qJcW1QjWQz"/>
</header>
{/*  Main Content Canvas  */}
<main className="flex-1 p-container-padding flex flex-col gap-section-gap w-full max-w-[1600px] mx-auto pb-32 md:pb-8">
{/*  Page Header  */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
<div>
<h2 className="font-display-lg text-display-lg text-on-surface">Climate Lab</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">Simulate enterprise carbon footprint reductions and optimize your sustainability investments using predictive AI modeling.</p>
</div>
</div>
{/*  Bento Grid Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Left Column: Controls (4 columns)  */}
<div className="lg:col-span-4 flex flex-col gap-gutter">
{/*  Simulation Controls Card  */}
<div className="bg-surface-bright/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-glass-padding relative overflow-hidden">
{/*  Decorative Earth Texture Background  */}
<div className="absolute inset-0 opacity-5 pointer-events-none" data-alt="Subtle, dark topographical map texture resembling earth terrain" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCm5_IUCLh_OPZzdouNVCx6_dLs9Pxahf_CFhmWQNsCnG46J7dYUBHevwp-n2JyGLl-jNoizID-SMOL8srhlYL6MzzQBO9sDuh7CcsDFMSF6WMtRVya0sulYz8pvl3KjkmsgGajZpWgXS3ajry8u3KGwkqd4Qf3y3_F2hagct7ypYPmInI6uphiHfsR-FqXTPSgMlzthK_Ck9XG2VmJkNRJksUMS0_FaItNk2447kt69VT4qOKIBVFpqOU-SgNr5V_04mtNyERwoafE')", backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
<div className="relative z-10">
<h3 className="font-title-sm text-title-sm text-on-surface mb-6 flex items-center gap-2">
<span className="material-symbols-outlined text-primary">tune</span>
                                Simulation Parameters
                            </h3>
<div className="space-y-8">
{/*  Slider 1  */}
<div>
<div className="flex justify-between items-center mb-2">
<label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Renewable Energy Adoption</label>
<span className="font-mono-stream text-mono-stream font-bold text-primary">45%</span>
</div>
<input className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" max="100" min="0" type="range" defaultValue="45"/>
<div className="flex justify-between text-xs text-on-surface-variant/60 mt-1">
<span>Current Base</span>
<span>Aggressive Shift</span>
</div>
</div>
{/*  Slider 2  */}
<div>
<div className="flex justify-between items-center mb-2">
<label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Energy Efficiency Upgrades</label>
<span className="font-mono-stream text-mono-stream font-bold text-secondary">Level 3</span>
</div>
<input className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary" max="5" min="1" type="range" defaultValue="3"/>
<div className="flex justify-between text-xs text-on-surface-variant/60 mt-1">
<span>Minimal</span>
<span>Maximized</span>
</div>
</div>
<div className="pt-4 border-t border-outline-variant/30">
<button className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-caps text-label-caps font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined">auto_awesome</span>
                                        Run AI Prediction
                                    </button>
</div>
</div>
</div>
</div>
{/*  AI Processing Log (Loading State Mockup)  */}
<div className="bg-surface-container-low shadow-inner border border-outline-variant/20 rounded-2xl p-glass-padding font-mono-stream text-mono-stream text-on-surface-variant">
<div className="flex items-center gap-2 mb-4 pb-2 border-b border-outline-variant/20">
<span className="material-symbols-outlined text-primary animate-spin">memory</span>
<span className="font-bold text-on-surface">LangGraph Terminal</span>
</div>
<div className="space-y-2 opacity-30">
<p>&gt; Initializing environmental constraints...</p>
<p>&gt; Loading historical emission datasets...</p>
</div>
<div className="space-y-2 opacity-60 mt-2">
<p>&gt; Applying predictive vector models...</p>
<p>&gt; Simulating grid adoption scenario alpha...</p>
</div>
<div className="space-y-2 mt-2">
<p className="text-primary">&gt; Calculating projected liability vs credit delta...</p>
<p className="animate-pulse">_</p>
</div>
</div>
</div>
{/*  Right Column: Visualization (8 columns)  */}
<div className="lg:col-span-8 flex flex-col gap-gutter">
{/*  Chart Card  */}
<div className="bg-surface-bright/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-glass-padding h-full flex flex-col min-h-[500px]">
<div className="flex justify-between items-center mb-8">
<div>
<h3 className="font-title-sm text-title-sm text-on-surface">Financial Impact Projection</h3>
<p className="text-sm text-on-surface-variant mt-1">Projected Carbon Liability vs. Carbon Credit Savings (2024-2030)</p>
</div>
<div className="flex gap-4">
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-error"></div>
<span className="text-xs font-label-caps text-label-caps text-on-surface-variant">Liability Cost ($)</span>
</div>
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-primary"></div>
<span className="text-xs font-label-caps text-label-caps text-on-surface-variant">Credit Savings ($)</span>
</div>
</div>
</div>
{/*  Faux Recharts Dual Axis Line Chart  */}
<div className="flex-1 relative flex items-end">
{/*  Y-Axis Left (Liability)  */}
<div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-on-surface-variant/50 font-mono-stream text-right pr-2">
<span>$10M</span>
<span>$8M</span>
<span>$6M</span>
<span>$4M</span>
<span>$2M</span>
<span>$0</span>
</div>
{/*  Grid Lines  */}
<div className="absolute left-12 right-12 top-2 bottom-8 flex flex-col justify-between">
<div className="w-full h-px bg-outline-variant/20"></div>
<div className="w-full h-px bg-outline-variant/20"></div>
<div className="w-full h-px bg-outline-variant/20"></div>
<div className="w-full h-px bg-outline-variant/20"></div>
<div className="w-full h-px bg-outline-variant/20"></div>
<div className="w-full h-px bg-outline-variant/40"></div>
</div>
{/*  Lines Visualization  */}
<div className="absolute left-12 right-12 top-2 bottom-8">
{/*  Liability Line (Trending Down)  */}
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
<path d="M0,20 C20,25 40,40 60,60 C80,80 90,85 100,90" fill="none" stroke="var(--color-error, #ba1a1a)" strokeDasharray="4 4" strokeWidth="2" vector-effect="non-scaling-stroke"></path>
{/*  Points  */}
<circle cx="0" cy="20" fill="var(--color-error, #ba1a1a)" r="1"></circle>
<circle cx="60" cy="60" fill="var(--color-error, #ba1a1a)" r="1"></circle>
<circle cx="100" cy="90" fill="var(--color-error, #ba1a1a)" r="1"></circle>
</svg>
{/*  Savings Line (Trending Up)  */}
<svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
<path d="M0,95 C20,90 40,70 60,50 C80,30 90,15 100,10" fill="none" stroke="var(--color-primary, #002c06)" strokeWidth="3" vector-effect="non-scaling-stroke"></path>
{/*  Points  */}
<circle cx="0" cy="95" fill="var(--color-primary, #002c06)" r="1.5"></circle>
<circle cx="60" cy="50" fill="var(--color-primary, #002c06)" r="1.5"></circle>
<circle cx="100" cy="10" fill="var(--color-primary, #002c06)" r="1.5"></circle>
</svg>
{/*  Hover Tooltip Mockup  */}
<div className="absolute top-[40%] left-[60%] bg-surface border border-outline-variant/50 shadow-lg rounded-lg p-3 transform -translate-x-1/2 -translate-y-full mb-2 pointer-events-none">
<div className="text-xs font-bold text-on-surface mb-1 text-center">2027 Projection</div>
<div className="flex items-center justify-between gap-4 text-sm">
<span className="text-error font-mono-stream">$4.2M</span>
<span className="text-primary font-mono-stream font-bold">$5.8M</span>
</div>
</div>
</div>
{/*  Y-Axis Right (Savings)  */}
<div className="absolute right-0 top-0 bottom-8 flex flex-col justify-between text-xs text-on-surface-variant/50 font-mono-stream text-left pl-2">
<span>100k C</span>
<span>80k C</span>
<span>60k C</span>
<span>40k C</span>
<span>20k C</span>
<span>0</span>
</div>
{/*  X-Axis  */}
<div className="w-full pl-12 pr-12 flex justify-between text-xs text-on-surface-variant/70 font-mono-stream mt-2 absolute bottom-0 left-0">
<span>&apos;24</span>
<span>&apos;25</span>
<span>&apos;26</span>
<span>&apos;27</span>
<span>&apos;28</span>
<span>&apos;29</span>
<span>&apos;30</span>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
{/*  BottomNavBar (Mobile)  */}
<nav className="md:hidden flex justify-around items-center px-4 pb-6 pt-3 w-full bg-white/80 dark:bg-emerald-950/80 backdrop-blur-xl fixed bottom-0 w-full rounded-t-3xl border-t z-50 border-white/40 dark:border-emerald-700/30 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] font-['Space_Grotesk'] text-[10px] font-medium">
<a className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 active:bg-emerald-200/50 dark:active:bg-emerald-800/50 rounded-2xl transition-all" href="#">
<span className="material-symbols-outlined mb-1">grid_view</span>
            Home
        </a>
<a className="flex flex-col items-center justify-center bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-50 rounded-2xl p-2 w-16 Active: scale-90 duration-150" href="#">
<span className="material-symbols-outlined mb-1" style={{fontVariationSettings: '"FILL" 1'}}>biotech</span>
            Labs
        </a>
<a className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 active:bg-emerald-200/50 dark:active:bg-emerald-800/50 rounded-2xl transition-all" href="#">
<span className="material-symbols-outlined mb-1">query_stats</span>
            Data
        </a>
<a className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 active:bg-emerald-200/50 dark:active:bg-emerald-800/50 rounded-2xl transition-all" href="#">
<span className="material-symbols-outlined mb-1">person</span>
            User
        </a>
</nav>

    </>
  );
}
