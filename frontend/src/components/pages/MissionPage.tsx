/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function MissionPage() {
  return (
    <>

{/*  TopNavBar (Web)  */}
<nav className="hidden md:flex flex justify-between items-center w-full px-8 py-4 bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl docked full-width top-0 border-b border-white/40 dark:border-emerald-700/30 shadow-sm fixed z-50">
<div className="flex items-center gap-4">
<span className="text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-50">IndiCarbon AI</span>
</div>
<div className="flex gap-8 items-center">
{/*  Navigation Links - This is an About/Mission page, so no generic tabs are active  */}
<a className="text-slate-600 dark:text-slate-400 font-['Space_Grotesk'] antialiased hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors px-3 py-2 rounded-lg" href="#">Home</a>
<a className="text-emerald-600 dark:text-emerald-300 font-bold font-['Space_Grotesk'] antialiased hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors px-3 py-2 rounded-lg" href="#">Mission</a>
<a className="text-slate-600 dark:text-slate-400 font-['Space_Grotesk'] antialiased hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors px-3 py-2 rounded-lg" href="#">Platform</a>
</div>
<div className="flex items-center gap-4">
<button className="text-emerald-800 dark:text-emerald-400 hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors p-2 rounded-full">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-emerald-800 dark:text-emerald-400 hover:bg-white/40 dark:hover:bg-emerald-800/20 transition-colors p-2 rounded-full">
<span className="material-symbols-outlined">settings</span>
</button>
<div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant">
<img alt="Chief Ecology Officer" className="w-full h-full object-cover" data-alt="professional portrait of a female chief ecology officer in modern corporate setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaDjK7w3J5niyKd_kNZQvZzds5jhnnrmMhyx7Zxr8uRe6H6AVGVxfii8i9iaPrHHPLqnkQtWv3Z1j9Ps8HLd_eP0nBm9B63iZwQWPO1AEthWTtvgmIxbuopu30wuzXAfUDseFjvA-lg8h4ARf91VtxuSZmjMztul0QVP4V24RWLJ1DNFU8y9NHyiNClQJtJNeDe57kU9pTdqH54VY5B55dr2sYL5MeamuSNpI9xBVnAg-oklOuIEB0YxNUNRkoLjpM7jG5xMBTeyHb"/>
</div>
</div>
</nav>
{/*  SideNavBar (Web) - Suppressed for storytelling/mission page to allow full canvas  */}
{/*  Main Content Canvas  */}
<main className="w-full pt-24 pb-32">
{/*  Section 1: The Crisis  */}
<section className="min-h-[921px] flex flex-col justify-center items-center px-container-padding py-section-gap relative">
<div className="absolute inset-0 z-0">
<img alt="Industrial Pollution" className="w-full h-full object-cover opacity-30 grayscale mix-blend-multiply" data-alt="monochrome image of heavy industrial smokestacks emitting thick smoke into the sky" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDewMGS8WzI86SVFea5ii8VSK44dChJmUsM36y7WhXfG0KTvGv0STiFRvjlRSnYUjskpj1y7_24rfWqYAdi6bfqdTCZByJXKVCxq606uuSjeH8yVppsiU98yH7NuVzdz9tD1gcZ4CCQ6c84SIWBPihMJw30PwtcIqHipXR1Y1uFZtWOLHf11-bfgkLr0odkcPgwTmjaZwG15zkyDz5TJFax75Dgxp_uHJrenIFdccYnrlmlcrJsoNIUg46gp6tej8myl9r5mZDKroEM"/>
<div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
</div>
<div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest bg-surface-variant/50 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant">The Reality</span>
<h1 className="font-display-lg text-display-lg text-on-primary-fixed">The Industrial Era Left a Mark.</h1>
<p className="font-body-md text-body-md text-on-surface text-lg max-w-2xl mx-auto">India&apos;s rapid growth has driven incredible progress, but the ecological toll is mounting. Heavy industries, energy sectors, and urban sprawl demand a new paradigm of accountability and intelligence to reverse the damage.</p>
</div>
</section>
{/*  Section 2: The Solution (Timeline)  */}
<section className="px-container-padding py-section-gap max-w-6xl mx-auto">
<div className="text-center mb-16 space-y-4">
<span className="font-label-caps text-label-caps text-primary uppercase tracking-widest bg-primary-container/20 px-4 py-2 rounded-full border border-primary-fixed-dim/30">The Roadmap</span>
<h2 className="font-headline-md text-headline-md text-on-primary-fixed">CCTS 2026: The Compliance Frontier</h2>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">India&apos;s Carbon Credit Trading Scheme (CCTS) fundamentally alters the industrial landscape. IndiCarbon AI is built to navigate this complex transition.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-12 gap-gutter relative">
{/*  Timeline Line  */}
<div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant/50 -translate-x-1/2 z-0"></div>
{/*  Timeline Item 1  */}
<div className="md:col-span-5 flex justify-end z-10">
<div className="bg-surface-bright/60 backdrop-blur-xl border border-outline-variant/30 rounded-xl p-glass-padding shadow-xl w-full">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-secondary">policy</span>
<h3 className="font-title-sm text-title-sm text-on-surface">Phase 1: Baselines</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">Establishing accurate, tamper-proof emissions baselines for heavy industries using AI-driven sensor fusion and legacy data parsing.</p>
</div>
</div>
<div className="md:col-span-2 flex justify-center items-center z-10 hidden md:flex">
<div className="w-4 h-4 rounded-full bg-secondary ring-4 ring-secondary-container"></div>
</div>
<div className="md:col-span-5"></div>
{/*  Timeline Item 2  */}
<div className="md:col-span-5"></div>
<div className="md:col-span-2 flex justify-center items-center z-10 hidden md:flex">
<div className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary-container"></div>
</div>
<div className="md:col-span-5 flex justify-start z-10">
<div className="bg-surface-bright/60 backdrop-blur-xl border border-outline-variant/30 rounded-xl p-glass-padding shadow-xl w-full">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-primary">analytics</span>
<h3 className="font-title-sm text-title-sm text-on-surface">Phase 2: Targets</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">Agentic models analyze facility operations to simulate pathways toward mandatory emission reduction targets required by CCTS regulations.</p>
</div>
</div>
</div>
</section>
{/*  Section 3: The Tech (Bento Grid)  */}
<section className="px-container-padding py-section-gap max-w-7xl mx-auto bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/20 mt-16 relative overflow-hidden">
<div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
<div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-container/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
<div className="relative z-10 text-center mb-16 space-y-4">
<span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest bg-secondary-container/20 px-4 py-2 rounded-full border border-secondary-fixed-dim/30">The Engine</span>
<h2 className="font-headline-md text-headline-md text-on-primary-fixed">Intelligence Meets Compliance</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-12 gap-gutter relative z-10">
{/*  Card 1: Agentic AI  */}
<div className="md:col-span-8 bg-surface/80 backdrop-blur-2xl border border-outline-variant/40 rounded-2xl p-glass-padding shadow-xl flex flex-col justify-between overflow-hidden relative group">
<div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none"></div>
<div className="flex items-start justify-between mb-8">
<div>
<div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-4">
<span className="material-symbols-outlined">psychology</span>
</div>
<h3 className="font-title-sm text-title-sm text-on-surface">Agentic AI Workflows</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">Powered by Ollama, our localized LLM agents autonomously query regulatory frameworks and cross-reference real-time facility data.</p>
</div>
</div>
{/*  AI Stream Simulation  */}
<div className="bg-surface-container-low rounded-xl p-4 shadow-inner font-mono-stream text-mono-stream text-on-surface-variant space-y-2 border border-outline-variant/20">
<div className="opacity-30">&gt; initializing agent_compliance_check...</div>
<div className="opacity-60">&gt; querying CCTS_Rulebook_2024.pdf...</div>
<div className="opacity-100 text-primary flex items-center gap-2">
                            &gt; calculating scope_1_variance... <span className="w-2 h-4 bg-primary animate-pulse inline-block"></span>
</div>
</div>
</div>
{/*  Card 2: pgvector  */}
<div className="md:col-span-4 bg-surface/80 backdrop-blur-2xl border border-outline-variant/40 rounded-2xl p-glass-padding shadow-xl flex flex-col">
<div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center mb-4">
<span className="material-symbols-outlined">dataset</span>
</div>
<h3 className="font-title-sm text-title-sm text-on-surface">Vector Compliance</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-2 flex-grow">Semantic search across thousands of pages of Indian environmental law using pgvector, ensuring automated recommendations are rooted in legal fact.</p>
<div className="mt-6 flex flex-wrap gap-2">
<span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface">PostgreSQL</span>
<span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface">Embeddings</span>
</div>
</div>
{/*  Card 3: Carbon Math  */}
<div className="md:col-span-12 bg-surface/80 backdrop-blur-2xl border border-outline-variant/40 rounded-2xl p-glass-padding shadow-xl flex flex-col md:flex-row items-center gap-8">
<div className="flex-1">
<div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-lg flex items-center justify-center mb-4">
<span className="material-symbols-outlined">calculate</span>
</div>
<h3 className="font-title-sm text-title-sm text-on-surface">Rigorous Carbon Math</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">Deterministic calculation engines handle the strict formulas required for CCTS credit issuance. AI assists, but hard math rules the ledger.</p>
</div>
<div className="flex-1 w-full bg-surface-container-low rounded-xl p-6 shadow-inner border border-outline-variant/20">
<div className="flex justify-between items-end mb-2">
<span className="font-label-caps text-label-caps text-on-surface-variant">Verification Confidence</span>
<span className="font-title-sm text-title-sm text-primary">99.8%</span>
</div>
<div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-secondary to-primary w-[99.8%] rounded-full"></div>
</div>
</div>
</div>
</div>
</section>
</main>
{/*  BottomNavBar (Mobile)  */}
<nav className="md:hidden flex justify-around items-center px-4 pb-6 pt-3 w-full bg-white/80 dark:bg-emerald-950/80 backdrop-blur-xl fixed bottom-0 w-full rounded-t-3xl border-t border-white/40 dark:border-emerald-700/30 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] z-50">
<a className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 active:bg-emerald-200/50 dark:active:bg-emerald-800/50 transition-colors" href="#">
<span className="material-symbols-outlined mb-1">grid_view</span>
<span className="font-['Space_Grotesk'] text-[10px] font-medium">Home</span>
</a>
<a className="flex flex-col items-center justify-center bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-50 rounded-2xl p-2 w-16 active:scale-90 duration-150 transition-all" href="#">
<span className="material-symbols-outlined mb-1">biotech</span>
<span className="font-['Space_Grotesk'] text-[10px] font-medium">Labs</span>
</a>
<a className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 active:bg-emerald-200/50 dark:active:bg-emerald-800/50 transition-colors" href="#">
<span className="material-symbols-outlined mb-1">query_stats</span>
<span className="font-['Space_Grotesk'] text-[10px] font-medium">Data</span>
</a>
<a className="flex flex-col items-center justify-center text-emerald-800/50 dark:text-emerald-400/40 p-2 active:bg-emerald-200/50 dark:active:bg-emerald-800/50 transition-colors" href="#">
<span className="material-symbols-outlined mb-1">person</span>
<span className="font-['Space_Grotesk'] text-[10px] font-medium">User</span>
</a>
</nav>

    </>
  );
}
