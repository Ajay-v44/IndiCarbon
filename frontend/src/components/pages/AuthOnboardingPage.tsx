/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function AuthOnboardingPage() {
  return (
    <>

{/*  Decorative Background Elements for "No Pollution" Aesthetic  */}
<div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
<div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-fixed opacity-20 blur-[120px]"></div>
<div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary-fixed opacity-30 blur-[100px]"></div>
</div>
{/*  Main Container  */}
<div className="w-full max-w-6xl glass-panel shadow-xl rounded-xl lg:rounded-3xl overflow-hidden flex flex-col lg:flex-row relative z-10 border-outline-variant">
{/*  Left Side: Brand & Visual Context (Hidden on mobile)  */}
<div className="hidden lg:flex w-[40%] bg-surface-container-low flex-col justify-between relative overflow-hidden p-12">
{/*  Background Image with Overlay  */}
<img alt="Clean environment background" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply" data-alt="abstract view of clear blue sky through lush green canopy of leaves, bright clean natural lighting, evoking environmental purity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqD7fH-hXdQsl-plgAylEI7fd8553hj6SeGqR7rIlTSDte5GOtA3i57COdV8W5FWSRxdgLoVpagAUXkLov93jftapwqn9CGqVkI4neZfDdzt8YqHYPkb09vbkL7i5ERRoJ01xVuqjCoM0FLaup0luGtpUkI1UJ9Ls7XImFuQHsoMT0HSx4cCHAsOb3nr3TEvvvPWMZjA3EZms7kraHVTwEAAckWXB27tJ9kID07Fp5kT_T19IhWfj1tJek1jlwzJikUQjp19zGyID-"/>
<div className="absolute inset-0 bg-gradient-to-b from-surface-container-low/80 to-surface-container-low/20"></div>
<div className="relative z-10">
<div className="flex items-center gap-2 mb-16">
<span className="material-symbols-outlined text-[32px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>eco</span>
<h1 className="font-display-lg text-display-lg text-on-surface">IndiCarbon</h1>
</div>
<div className="space-y-6 max-w-sm">
<h2 className="font-headline-md text-headline-md text-on-surface">Carbon Intelligence for a clearer tomorrow.</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Configure your operational context to enable high-precision emission tracking and SEBI-compliant reporting frameworks.</p>
</div>
</div>
<div className="relative z-10 mt-auto">
<div className="flex items-center gap-4 bg-surface-container-highest/50 backdrop-blur-md p-4 rounded-xl leaf-radius border border-outline-variant/30">
<span className="material-symbols-outlined text-primary-container">shield_lock</span>
<p className="font-label-caps text-label-caps text-on-surface-variant">Enterprise-grade security powered by Supabase Auth</p>
</div>
</div>
</div>
{/*  Right Side: Interactive Flow (Auth/KYC)  */}
<div className="w-full lg:w-[60%] bg-surface-container-lowest p-8 lg:p-16 flex flex-col">
{/*  Minimal Mobile Header (Only visible on mobile)  */}
<div className="flex items-center gap-2 mb-8 lg:hidden">
<span className="material-symbols-outlined text-[24px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>eco</span>
<span className="font-headline-md text-[24px] font-bold text-on-surface">IndiCarbon</span>
</div>
{/*  Stepper Indicator  */}
<div className="flex items-center gap-2 mb-12">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-caps text-[10px]">
<span className="material-symbols-outlined text-[14px]">check</span>
</div>
<span className="font-label-caps text-label-caps text-on-surface-variant">Account</span>
</div>
<div className="w-8 h-px bg-outline-variant"></div>
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps text-[10px]">2</div>
<span className="font-label-caps text-label-caps text-primary">Context</span>
</div>
<div className="w-8 h-px bg-outline-variant"></div>
<div className="flex items-center gap-2 opacity-50">
<div className="w-6 h-6 rounded-full border border-outline text-on-surface-variant flex items-center justify-center font-label-caps text-[10px]">3</div>
<span className="font-label-caps text-label-caps text-on-surface-variant">Verify</span>
</div>
</div>
{/*  Form Content  */}
<div className="flex-grow flex flex-col justify-center max-w-md w-full mx-auto">
<div className="mb-8">
<h2 className="font-headline-md text-headline-md text-on-surface mb-2">Establish Context</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Define your operational industry to align our machine learning models with appropriate SEBI emission factors.</p>
</div>
<form className="space-y-6">
{/*  Input Group  */}
<div className="space-y-2">
<label className="block font-label-caps text-label-caps text-on-surface" htmlFor="company_name">Legal Entity Name</label>
<div className="relative">
<span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span className="material-symbols-outlined text-outline">business</span>
</span>
<input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leaf-radius transition-colors" id="company_name" placeholder="Enter company name" type="text" defaultValue="Acme Corp Ltd."/>
</div>
</div>
{/*  Select Group (The specific requested field)  */}
<div className="space-y-2">
<label className="block font-label-caps text-label-caps text-on-surface flex justify-between" htmlFor="industry_type">
<span>Primary Industry Type</span>
<span className="text-primary text-[10px]">*Required for SEBI</span>
</label>
<div className="relative">
<span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span className="material-symbols-outlined text-outline">factory</span>
</span>
<select className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leaf-radius transition-colors cursor-pointer" id="industry_type">
<option disabled defaultValue="">Select industry category...</option>
<option defaultValue="steel">Steel &amp; Metallurgy</option>
<option defaultValue="cement">Cement &amp; Construction Materials</option>
<option defaultValue="energy">Energy &amp; Power Generation</option>
<option defaultValue="manufacturing">Heavy Manufacturing</option>
<option defaultValue="logistics">Transportation &amp; Logistics</option>
<option defaultValue="other">Other / Mixed Operations</option>
</select>
<span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
<span className="material-symbols-outlined text-outline">expand_more</span>
</span>
</div>
</div>
{/*  Input Group  */}
<div className="space-y-2">
<label className="block font-label-caps text-label-caps text-on-surface" htmlFor="registration_number">Corporate Registration (CIN)</label>
<div className="relative">
<span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span className="material-symbols-outlined text-outline">badge</span>
</span>
<input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leaf-radius transition-colors" id="registration_number" placeholder="L12345XX1234XXX123456" type="text"/>
</div>
</div>
{/*  Actions  */}
<div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
<button className="w-full sm:w-auto px-6 py-3 font-title-sm text-title-sm text-on-surface-variant bg-surface-container hover:bg-surface-container-high leaf-radius transition-colors spring-hover text-center" type="button">
                            Back
                        </button>
<button className="w-full sm:flex-1 px-6 py-3 font-title-sm text-title-sm text-on-primary-container bg-primary-container hover:bg-primary-fixed-dim leaf-radius transition-colors spring-hover flex items-center justify-center gap-2 shadow-sm" type="button">
                            Continue to Verification
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</form>
</div>
{/*  Footer  */}
<div className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-center">
<p className="font-label-caps text-label-caps text-outline flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">lock</span>
                    Data is encrypted and stored securely.
                </p>
</div>
</div>
</div>

    </>
  );
}
