/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function LoginForm() {
  return (
    <>

{/*  Background Layer  */}
<div className="absolute inset-0 z-0 overflow-hidden">
<img alt="Background forest canopy" className="w-full h-full object-cover object-center" data-alt="aerial view of dense, vibrant lush green Indian rainforest canopy with soft morning mist and golden sunlight filtering through the trees" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoIJ-8DikFnxpmZYIh2Lmk9NGwzb0QQb5CT9O3i8s6guvrJCYUtYTD92ItC-EAyqSBYuOFD9cjXIVkgmtsgUHLh5daLT44biPg8oycgiLMjEGT4SLqV7jxeZBA0dpcjV-yc-2xS8vzCmQt3RIlXSQxSxGcELEo32JkwPoss74Z7Lkj_XiSfkoZuEIWWZbRgwPJDlL9MJrxwAv1HZSqZ7TMhvjD_nrZHx8_VgzAUObutzJ2kqa0L6lYc3NjVdtUTthVX61IrfWZFcjj"/>
<div className="absolute inset-0 bg-primary/30 mix-blend-multiply"></div>
<div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent"></div>
</div>
{/*  Main Content Canvas  */}
<main className="relative z-10 w-full max-w-md">
{/*  Glassmorphism Login Card  */}
<div className="bg-surface/70 backdrop-blur-2xl rounded-xl border border-surface-container-high/50 shadow-2xl p-glass-padding flex flex-col gap-[32px]">
{/*  Header Group  */}
<header className="text-center flex flex-col gap-unit items-center">
<div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center mb-2 shadow-inner">
<span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>eco</span>
</div>
<h1 className="font-headline-md text-headline-md text-primary tracking-tight">IndiCarbon AI</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Access your environmental intelligence.</p>
</header>
{/*  Authentication Actions  */}
<div className="flex flex-col gap-4">
{/*  Social Auth  */}
<div className="flex flex-col gap-3">
<button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest/60 hover:bg-surface-container-low transition-colors duration-200" type="button">
<img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDApsgYI4vIhwl_GXDWWapKiCgOien6kwvnTWwD9UxV7BTQVJyt9hpt45v50ELiPj-5SgUfEKHQxLCDP2Z3rfqN1vNDAG73ekbkTRpVyYPXEt-7apFOdTcUfgDID7T__QrmUs0ZjMIl4vhVqsJGytmOS16jUdy2nnoIQL5voINvluCUQL8g23ebakOt9egB6iGI8jr49xMj2V1uMzaNjZAIJDHK3tRgEFgSEAxJxSZpRx5UwzysXh6KCO2_8YM9KXaDnKsi3K84k01J"/>
<span className="font-title-sm text-title-sm text-on-surface">Continue with Google</span>
</button>
<button className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest/60 hover:bg-surface-container-low transition-colors duration-200" type="button">
<img alt="LinkedIn Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWekm9lJQpTRICyTGFT8d0V0lbMuLFv-cCy2vOxw6Z74zs2jMi270U8w90TMvpEJH2vabXTo4NG9vKpIeZ8v3rVfnDVL7nSrNFTXccnFIviU8EBHWszptGwtbNEXoJsEhsjZfh32O5i8WsX5o082sEalwNQ7FxLCm4ZqU4WmLmnKqUt1TolXQQbMPwKCGRcZ55g92fDPrePichAEvmS-NMD48fgJ6aYUFwa7wehbMtO3JiKwak31kaj6YzKauBzCdAElLSHCQkhkPo"/>
<span className="font-title-sm text-title-sm text-on-surface">Continue with LinkedIn</span>
</button>
</div>
{/*  Divider  */}
<div className="flex items-center gap-4 py-2">
<div className="h-px bg-outline-variant/40 flex-1"></div>
<span className="font-label-caps text-label-caps text-outline">OR EMAIL</span>
<div className="h-px bg-outline-variant/40 flex-1"></div>
</div>
{/*  Email Form  */}
<form action="#" className="flex flex-col gap-[20px]" method="POST">
<div className="flex flex-col gap-2">
<label className="font-title-sm text-title-sm text-on-surface" htmlFor="email">Work Email</label>
<input className="w-full bg-surface-container-lowest/80 border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline shadow-inner" id="email" name="email" placeholder="name@company.com" required type="email"/>
</div>
<div className="flex flex-col gap-2">
<div className="flex items-center justify-between">
<label className="font-title-sm text-title-sm text-on-surface" htmlFor="password">Password</label>
<a className="font-body-md text-body-md text-secondary hover:text-secondary-fixed-dim transition-colors text-[14px]" href="#">Forgot password?</a>
</div>
<div className="relative">
<input className="w-full bg-surface-container-lowest/80 border border-outline-variant rounded-lg pl-4 pr-10 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline shadow-inner" id="password" name="password" placeholder="••••••••" required type="password"/>
<button aria-label="Toggle password visibility" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button">
<span className="material-symbols-outlined text-[20px]">visibility_off</span>
</button>
</div>
</div>
<button className="w-full bg-primary hover:bg-primary-container text-on-primary font-title-sm text-title-sm py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-md hover:shadow-lg" type="submit">
                        Sign In
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</form>
</div>
{/*  Footer Link  */}
<div className="text-center pt-2">
<p className="font-body-md text-body-md text-on-surface-variant">
                    Don&apos;t have an account?
                    <a className="text-secondary font-semibold hover:text-secondary-fixed-dim transition-colors underline decoration-secondary/30 underline-offset-4" href="#">Request Access</a>
</p>
</div>
</div>
</main>

    </>
  );
}
