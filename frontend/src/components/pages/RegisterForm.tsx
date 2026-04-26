/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function RegisterForm() {
  return (
    <>

{/*  Main App Container (Fluid Bento Grid)  */}
<main className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-12 bg-surface-container-lowest/70 backdrop-blur-2xl rounded-3xl shadow-xl border border-outline-variant/40 overflow-hidden relative">
{/*  Left Column: Context & Branding  */}
<aside className="col-span-1 lg:col-span-5 relative bg-primary-container p-container-padding flex flex-col justify-between overflow-hidden min-h-[300px] lg:min-h-full">
{/*  Decorative Background  */}
<div className="absolute inset-0 bg-gradient-to-br from-primary-container to-primary opacity-90 z-0"></div>
<img alt="Background Texture" className="absolute inset-0 object-cover w-full h-full mix-blend-overlay opacity-20 z-0" data-alt="abstract architectural glass and steel structure with lush green botanical elements reflecting inside, moody dramatic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeaJiem2SEf9cRlQ5Oruv5Sbk_AN_vMoOAS1j9MCv3a-au7BxXbD_xdSR2Hzw4EjueX2SYPLqk8XYIrEqos-qWNAY_Hw1qHJ-K7MltUxaUgvCaW4E0zKHhRz4NQkCouye8Fjzt3z2VIovrihJMGryGN0hoqoQTTlNTMwssc3IAC7oC-HlAjCdu2nF1rQzYICLDmsphPaKmAuPcK8gx8e2aO1MNF-QVgqKcTYxl2BaV00a5bqJgoR2MMvz-o_tM2WfolOEoOgmi_f3o"/>
<header className="relative z-10 flex flex-col gap-unit">
<div className="flex items-center gap-2 mb-2 text-primary-fixed">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>eco</span>
<span className="font-label-caps text-label-caps tracking-widest uppercase">IndiCarbon AI</span>
</div>
<h1 className="font-display-lg text-display-lg text-on-primary">Environmental<br/>Intelligence</h1>
</header>
<div className="relative z-10 mt-section-gap lg:mt-auto bg-surface-container-lowest/10 backdrop-blur-md p-glass-padding rounded-2xl border border-white/10">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-primary-fixed">memory</span>
<h3 className="font-title-sm text-title-sm text-on-primary">KYC Initialization</h3>
</div>
<p className="font-body-md text-body-md text-on-primary/80">Configure your operational matrix to establish baseline emissions and unlock predictive compliance pathways tailored to your sector.</p>
</div>
</aside>
{/*  Right Column: Multi-step Form Canvas  */}
<section className="col-span-1 lg:col-span-7 p-container-padding lg:p-[48px] flex flex-col bg-surface-container-lowest">
{/*  Progress Tracker  */}
<nav aria-label="Progress" className="mb-12 relative">
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-surface-variant z-0"></div>
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-[2px] bg-primary z-0"></div>
<ol className="flex items-center justify-between relative z-10" role="list">
<li className="flex flex-col items-center gap-2 w-1/3">
<div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center ring-4 ring-surface-container-lowest">
<span className="material-symbols-outlined text-[16px] font-bold">check</span>
</div>
<span className="font-label-caps text-label-caps text-on-surface uppercase">Account</span>
</li>
<li className="flex flex-col items-center gap-2 w-1/3">
<div className="w-8 h-8 rounded-full bg-surface-container-lowest border-2 border-primary text-primary flex items-center justify-center ring-4 ring-surface-container-lowest">
<span className="font-title-sm text-[14px]">2</span>
</div>
<span className="font-label-caps text-label-caps text-primary uppercase">Sector</span>
</li>
<li className="flex flex-col items-center gap-2 w-1/3">
<div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center ring-4 ring-surface-container-lowest">
<span className="font-title-sm text-[14px]">3</span>
</div>
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Energy Mix</span>
</li>
</ol>
</nav>
{/*  Form Content  */}
<div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
<header className="mb-8">
<h2 className="font-headline-md text-headline-md text-on-surface mb-2">Operational Profile</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Define your primary industrial parameters.</p>
</header>
<form className="flex flex-col gap-8">
{/*  Sector Selection (Bento Cards with Theme Shift logic)  */}
<fieldset>
<legend className="block font-title-sm text-title-sm text-on-surface mb-4">Primary Sector</legend>
<div className="grid grid-cols-3 gap-unit">
{/*  Steel (Active - Theme shifted to tertiary/orange notes)  */}
<label className="relative cursor-pointer group">
<input checked className="peer sr-only" name="sector" type="radio" defaultValue="steel"/>
<div className="h-full p-4 rounded-xl border-2 border-surface-variant bg-surface-container hover:bg-surface-variant transition-colors peer-checked:border-tertiary-container peer-checked:bg-tertiary-container/5 flex flex-col items-center justify-center gap-3">
<div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-on-surface-variant group-hover:text-on-surface transition-colors peer-checked:bg-tertiary-container peer-checked:text-on-tertiary-container shadow-sm">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>factory</span>
</div>
<span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wide">Steel</span>
</div>
<div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-tertiary-container text-on-tertiary-container opacity-0 peer-checked:opacity-100 flex items-center justify-center transition-opacity">
<span className="material-symbols-outlined text-[10px] font-bold">check</span>
</div>
</label>
{/*  Cement  */}
<label className="relative cursor-pointer group">
<input className="peer sr-only" name="sector" type="radio" defaultValue="cement"/>
<div className="h-full p-4 rounded-xl border-2 border-surface-variant bg-surface-container hover:bg-surface-variant transition-colors peer-checked:border-primary peer-checked:bg-primary/5 flex flex-col items-center justify-center gap-3">
<div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-on-surface-variant group-hover:text-on-surface transition-colors peer-checked:bg-primary peer-checked:text-on-primary shadow-sm">
<span className="material-symbols-outlined">architecture</span>
</div>
<span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wide">Cement</span>
</div>
</label>
{/*  Power  */}
<label className="relative cursor-pointer group">
<input className="peer sr-only" name="sector" type="radio" defaultValue="power"/>
<div className="h-full p-4 rounded-xl border-2 border-surface-variant bg-surface-container hover:bg-surface-variant transition-colors peer-checked:border-secondary peer-checked:bg-secondary/5 flex flex-col items-center justify-center gap-3">
<div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-on-surface-variant group-hover:text-on-surface transition-colors peer-checked:bg-secondary peer-checked:text-on-secondary shadow-sm">
<span className="material-symbols-outlined">electric_bolt</span>
</div>
<span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wide">Power</span>
</div>
</label>
</div>
</fieldset>
{/*  Annual Turnover  */}
<div>
<label className="block font-title-sm text-title-sm text-on-surface mb-2" htmlFor="turnover">Annual Turnover</label>
<div className="relative">
<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span className="font-body-md text-on-surface-variant">USD</span>
</div>
<input className="block w-full pl-14 pr-4 py-3 bg-surface border-outline-variant rounded-xl font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-on-surface-variant/50 transition-shadow shadow-inner" id="turnover" name="turnover" placeholder="0.00" type="text"/>
</div>
</div>
{/*  Current Energy Mix Overview  */}
<div className="bg-surface-container-low p-glass-padding rounded-2xl border border-surface-variant">
<label className="block font-title-sm text-title-sm text-on-surface mb-4">Current Energy Mix Overview</label>
<div className="flex flex-col gap-4">
{/*  Renewable Slider  */}
<div className="flex items-center gap-4">
<div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[16px]">solar_power</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<span className="font-body-md text-body-md text-on-surface">Renewable</span>
<span className="font-label-caps text-label-caps text-primary">35%</span>
</div>
<div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-primary" style={{width: '35%'}}></div>
</div>
</div>
</div>
{/*  Non-Renewable Slider  */}
<div className="flex items-center gap-4">
<div className="w-8 h-8 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary shrink-0">
<span className="material-symbols-outlined text-[16px]">oil_barrel</span>
</div>
<div className="flex-1">
<div className="flex justify-between mb-1">
<span className="font-body-md text-body-md text-on-surface">Fossil / Conventional</span>
<span className="font-label-caps text-label-caps text-tertiary">65%</span>
</div>
<div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-tertiary" style={{width: '65%'}}></div>
</div>
</div>
</div>
</div>
</div>
</form>
</div>
{/*  Bottom Actions  */}
<footer className="mt-12 pt-6 border-t border-outline-variant/30 flex items-center justify-between">
<button className="px-6 py-2 rounded-full font-title-sm text-title-sm text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Back
                </button>
<button className="px-8 py-3 rounded-full bg-primary text-on-primary font-title-sm text-title-sm shadow-md hover:bg-primary/90 hover:shadow-lg transition-all flex items-center gap-2" type="button">
                    Continue to Energy Mix
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</footer>
</section>
</main>

    </>
  );
}
