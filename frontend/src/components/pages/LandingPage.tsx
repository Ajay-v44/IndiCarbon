/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function LandingPage() {
  return (
    <>

{/*  JSON Component: TopAppBar  */}
<header className="fixed top-0 z-50 docked full-width border-b bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 border-white/40 dark:border-slate-800/40 shadow-sm flex justify-between items-center px-6 py-3 w-full">
<div className="flex items-center gap-4">
<span className="text-xl font-bold text-emerald-900 dark:text-emerald-50 tracking-tighter">IndiCarbon AI</span>
</div>
<div className="flex items-center gap-6">
<div className="hidden md:flex items-center gap-2 bg-surface-container-low/50 px-4 py-2 rounded-full border border-outline-variant/30">
<span className="material-symbols-outlined text-outline">search</span>
<span className="font-body-md text-body-md text-on-surface-variant text-sm">Search</span>
</div>
<div className="flex items-center gap-4">
<button className="font-space-grotesk text-sm font-medium tracking-wide text-emerald-900 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-200 ease-in-out p-2 rounded-full flex items-center justify-center">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="font-space-grotesk text-sm font-medium tracking-wide text-emerald-900 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-200 ease-in-out p-2 rounded-full flex items-center justify-center">
<span className="material-symbols-outlined">account_circle</span>
</button>
</div>
</div>
</header>
<main className="pt-[100px] flex flex-col gap-section-gap pb-section-gap overflow-x-hidden">
{/*  Hero Section  */}
<section className="px-container-padding max-w-[1440px] mx-auto w-full">
<div className="glass-panel rounded-xl p-glass-padding md:p-12 flex flex-col md:flex-row items-center gap-gutter relative overflow-hidden">
{/*  Abstract background decoration within the card  */}
<div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] bg-secondary-container/10 blur-[100px] rounded-full pointer-events-none"></div>
<div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[150%] bg-primary-container/5 blur-[100px] rounded-full pointer-events-none"></div>
<div className="w-full md:w-1/2 flex flex-col gap-6 relative z-10">
<div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1 rounded-full w-fit">
<span className="material-symbols-outlined text-primary text-[16px]" style={{fontVariationSettings: '"FILL" 1'}}>public</span>
<span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Target 2030</span>
</div>
<h1 className="font-display-lg text-display-lg text-on-surface text-balance">
                        Accelerating India&apos;s <br/>
<span className="text-primary-container">Net-Zero</span> Future.
                    </h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                        Advanced predictive carbon accounting and localized offset trading to meet National Determined Contribution (NDC) goals with precision.
                    </p>
<div className="flex flex-wrap items-center gap-4 mt-4">
<button className="bg-primary-container text-on-primary font-label-caps text-label-caps px-6 py-4 leaf-radius uppercase tracking-widest hover:opacity-90 transition-opacity">
                            Start Simulation
                        </button>
<button className="glass-panel text-secondary font-label-caps text-label-caps px-6 py-4 leaf-radius uppercase tracking-widest flex items-center gap-2 border-secondary-container/50 hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined text-[18px]">play_circle</span>
                            Watch Vision
                        </button>
</div>
</div>
<div className="w-full md:w-1/2 relative min-h-[400px] flex items-center justify-center">
<img alt="" className="w-full max-w-[500px] h-auto object-contain z-10" data-alt="Abstract 3D rendering of the Indian subcontinent formed by glowing green and sky blue digital network nodes on a frosted glass pedestal, bright clean lighting, organic technological aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpOLB-XPQtdxZCUJF4t8BeeAu0CRDRYcgc_zJ2Ra7DV_sgoWWjq2gbXqU1TvxkuTrv6sYw285LCkgrwsMvIojzNYMNPn8uj_SKdNuavcOxg1FqfTEtgFNrbnbXJmRdNJZkFCfty7hx5bGav2uQ13jrA3wE-P0Vk2t0SWaAm3m_Z8PSylY3vyrKcNl1NKASqefvVQIv64c4CCK4yDqvY_uYddJkP3e_PA_5k_IWEUpXNb6njnzr_qxI0ROKjO8ckrAvLZsnoaW97GT1"/>
</div>
</div>
</section>
{/*  How it Works Section (Horizontal Scroll)  */}
<section className="w-full flex flex-col gap-8">
<div className="px-container-padding max-w-[1440px] mx-auto w-full flex flex-col gap-2">
<span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Methodology</span>
<h2 className="font-headline-md text-headline-md text-on-surface">Intelligence at Scale</h2>
</div>
<div className="w-full overflow-x-auto no-scrollbar snap-x snap-mandatory px-container-padding pb-8">
<div className="flex gap-gutter w-max max-w-[1440px] mx-auto">
{/*  Card 1: Audit  */}
<div className="w-[320px] md:w-[400px] snap-center glass-panel rounded-xl p-glass-padding flex flex-col gap-4 relative overflow-hidden group">
<div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 text-primary">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>radar</span>
</div>
<h3 className="font-title-sm text-title-sm text-on-surface">1. Localized Audit</h3>
<p className="font-body-md text-body-md text-on-surface-variant">
                            Ingest complex, region-specific emission data across manufacturing and logistics nodes with 99% accuracy.
                        </p>
{/*  Decorative element  */}
<div className="absolute right-0 bottom-0 w-32 h-32 bg-primary-container/5 rounded-tl-full -z-10 transition-transform group-hover:scale-110"></div>
</div>
{/*  Arrow Connector (hidden on mobile, visible on desktop layout conceptually, but keeping it simple in flex)  */}
<div className="hidden md:flex items-center justify-center text-outline-variant w-8">
<span className="material-symbols-outlined">arrow_forward</span>
</div>
{/*  Card 2: Predict  */}
<div className="w-[320px] md:w-[400px] snap-center glass-panel rounded-xl p-glass-padding flex flex-col gap-4 relative overflow-hidden group">
<div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center mb-4 text-secondary">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>analytics</span>
</div>
<h3 className="font-title-sm text-title-sm text-on-surface">2. AI Prediction</h3>
<p className="font-body-md text-body-md text-on-surface-variant">
                            Simulate intervention strategies. Forecast reduction trajectories against state-level environmental compliance targets.
                        </p>
<div className="absolute right-0 bottom-0 w-32 h-32 bg-secondary-container/10 rounded-tl-full -z-10 transition-transform group-hover:scale-110"></div>
</div>
<div className="hidden md:flex items-center justify-center text-outline-variant w-8">
<span className="material-symbols-outlined">arrow_forward</span>
</div>
{/*  Card 3: Trade  */}
<div className="w-[320px] md:w-[400px] snap-center glass-panel rounded-xl p-glass-padding flex flex-col gap-4 relative overflow-hidden group">
<div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 text-primary">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>currency_exchange</span>
</div>
<h3 className="font-title-sm text-title-sm text-on-surface">3. Offset Trading</h3>
<p className="font-body-md text-body-md text-on-surface-variant">
                            Seamlessly access verified local offset projects (agro-forestry, renewables) within the Indian domestic market.
                        </p>
<div className="absolute right-0 bottom-0 w-32 h-32 bg-primary-container/5 rounded-tl-full -z-10 transition-transform group-hover:scale-110"></div>
</div>
</div>
</div>
</section>
{/*  The Impact Section  */}
<section className="px-container-padding max-w-[1440px] mx-auto w-full">
<div className="bg-surface-container-low rounded-[32px] p-8 md:p-16 flex flex-col items-center justify-center text-center gap-12 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
<div className="flex flex-col gap-4 max-w-2xl">
<h2 className="font-headline-md text-headline-md text-on-surface">Simulated Impact</h2>
<p className="font-body-md text-body-md text-on-surface-variant">
                        Live monitoring of carbon equivalents offset through our ecosystem, contributing directly to the Panchamrit goals.
                    </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
{/*  Metric 1  */}
<div className="glass-panel rounded-xl p-8 flex flex-col items-center justify-center gap-2 border-secondary-container/30 bg-surface-bright/80">
<span className="font-display-lg text-display-lg text-secondary tracking-tighter">4.2M</span>
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Tons CO2e Reduced</span>
</div>
{/*  Metric 2  */}
<div className="glass-panel rounded-xl p-8 flex flex-col items-center justify-center gap-2 border-primary-container/20 bg-surface-bright/80 relative">
<div className="absolute top-4 right-4 flex items-center gap-1 text-primary-container">
<span className="material-symbols-outlined text-[16px] animate-pulse" style={{fontVariationSettings: '"FILL" 1'}}>fiber_manual_record</span>
<span className="font-label-caps text-[10px] uppercase font-bold tracking-widest">Live</span>
</div>
<span className="font-display-lg text-display-lg text-primary tracking-tighter">1,850+</span>
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Active Enterprises</span>
</div>
{/*  Metric 3  */}
<div className="glass-panel rounded-xl p-8 flex flex-col items-center justify-center gap-2 border-secondary-container/30 bg-surface-bright/80">
<span className="font-display-lg text-display-lg text-secondary tracking-tighter">₹800Cr</span>
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Offset Value Traded</span>
</div>
</div>
</div>
</section>
{/*  About Us Section  */}
<section className="px-container-padding max-w-[1440px] mx-auto w-full pt-8">
<div className="flex flex-col md:flex-row gap-gutter md:gap-16 items-center">
<div className="w-full md:w-1/2 relative">
<div className="aspect-[4/3] rounded-[24px] overflow-hidden glass-panel border-0 shadow-lg relative">
<img alt="" className="w-full h-full object-cover" data-alt="Aerial view of a futuristic sustainable industrial park in India integrating solar panels and lush green forestry alongside clean manufacturing facilities, bright daylight, optimistic atmosphere" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdbgTISDf_l3oFxuQZ07eu6W8xmLV6fFLzU7i1d9Me7o97U5CLSlhNyBFuBeiGEWRRauPlVeg8Huwtd-RygnTywHn7irobJoqHZuvUNFwXrnBd73tVfsn6cO9vycGH6ZRkBcbG1BW3SrwdjfWAHD3sUs09cc_1APseMUnmequTGKC8fHSGPhMLsr0KfO8lru9VXMmczKa6O63AMgVME1fce39R4jhm2gA7TMOMaxhUSioADr27hV5xrjgnj9JhINe9BVr_ikq54cGC"/>
{/*  Decorative overlay  */}
<div className="absolute inset-0 bg-gradient-to-tr from-primary-container/40 to-transparent mix-blend-multiply"></div>
</div>
{/*  Small floating stat card  */}
<div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 glass-panel p-4 rounded-xl flex items-center gap-4 border-white/60 shadow-xl bg-surface-bright/90 hidden sm:flex">
<div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary">psychology</span>
</div>
<div className="flex flex-col">
<span className="font-title-sm text-title-sm text-on-surface leading-tight">AI Driven</span>
<span className="font-label-caps text-label-caps text-outline text-[10px]">Continuous Learning</span>
</div>
</div>
</div>
<div className="w-full md:w-1/2 flex flex-col gap-6 mt-8 md:mt-0">
<div className="flex flex-col gap-2">
<span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Our Vision</span>
<h2 className="font-headline-md text-headline-md text-on-surface">Architecting India&apos;s Carbon Infrastructure</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
                        By 2070, India aims for Net-Zero. The journey requires unprecedented clarity in industrial emissions and localized mitigation strategies.
                    </p>
<p className="font-body-md text-body-md text-on-surface-variant">
                        IndiCarbon AI bridges the gap between high-level policy and factory-floor execution. We provide the digital instrumentation required to measure, predict, and trade environmental impact securely on an enterprise level.
                    </p>
<div className="pt-4">
<button className="bg-surface-container-high text-on-surface font-label-caps text-label-caps px-6 py-4 leaf-radius uppercase tracking-widest hover:bg-surface-variant transition-colors border border-outline-variant/30 flex items-center gap-2 w-fit">
                            Read the Manifesto
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</section>
</main>
{/*  Minimal Footer to cap the page  */}
<footer className="border-t border-outline-variant/20 bg-surface-container-lowest mt-section-gap">
<div className="max-w-[1440px] mx-auto px-container-padding py-12 flex flex-col md:flex-row justify-between items-center gap-6">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary" style={{fontVariationSettings: '"FILL" 1'}}>eco</span>
<span className="font-title-sm text-title-sm text-on-surface font-bold">IndiCarbon AI</span>
</div>
<div className="flex gap-6">
<span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary cursor-pointer transition-colors uppercase">Privacy</span>
<span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary cursor-pointer transition-colors uppercase">Terms</span>
<span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary cursor-pointer transition-colors uppercase">Contact</span>
</div>
</div>
</footer>

    </>
  );
}
