# IndiCarbon — Frontend Architecture

Frontend lives entirely under `apps/frontend/src/`. Next.js 16 App Router, React 19, TypeScript strict mode.

## Route Map

| Route | Page Component | Auth Required | Purpose |
|-------|---------------|---------------|---------|
| `/` | `LandingPage` | No | Public hero, feature showcase, testimonials, CTA |
| `/auth/login` | `LoginForm` | No | JWT login form |
| `/auth/register` | `RegisterForm` | No | New account registration |
| `/dashboard` | `DashboardPage` | Yes | KPI cards, emissions trends (area chart), sector breakdown, activity feed |
| `/dashboard/chat` | `AgentChatPage` | Yes | Chat interface with AI agent; shows sources & guardrail audit |
| `/simulator` | `SimulatorPage` | Yes | AI scenario modeling for emissions reduction |
| `/portfolio` | `PortfolioPage` | Yes | Carbon Vault — user's credit holdings and transaction history |
| `/marketplace` | — | Yes | Redirects to `/marketplace/buy` |
| `/marketplace/buy` | `MarketplaceBuyPage` | Yes | Buy carbon credits (order book view) |
| `/marketplace/sell` | `MarketplaceSellPage` | Yes | Sell carbon credits |
| `/admin` | `AdminPage` | Yes (internal only) | Admin command center for user/role management |
| `/settings` | `SettingsPage` | Yes | User and organization settings |
| `/mission` | `MissionPage` | No | Company mission / about page |

## Component Structure

```
src/components/
├── layout/
│   ├── Navbar.tsx        # Top nav bar — user profile dropdown, notifications, mobile menu
│   ├── Sidebar.tsx       # Desktop sidebar — navigation items + live emissions stats widget
│   └── AuthGuard.tsx     # Client component; checks auth state, redirects unauthenticated users
├── pages/                # Full-page components, one per route (e.g. DashboardPage.tsx)
└── ui/                   # 17 shadcn/ui primitives: button, card, dialog, input, label,
                          # progress, select, separator, sheet, skeleton, slider, badge,
                          # avatar, chart, table, toast, etc.
```

## Auth Guard Logic

`AuthGuard` is a client component that wraps all protected layouts:
1. Reads Redux auth state + `localStorage.indicarbon_tokens`
2. If unauthenticated → redirect to `/auth/login?redirect=<current-path>`
3. If `is_internal=true` → redirect to `/admin`
4. Otherwise → allow through to the protected page

## Redux Store (`src/store/`)

### Files
- `store.ts` — configures Redux store with all slices
- `provider.tsx` — `StoreProvider` React component (wraps app in `<Provider>`)
- `hooks.ts` — typed `useAppDispatch` and `useAppSelector` hooks (always use these, not raw hooks)

### Slices

**`auth-slice.ts`**
- State: `tokens`, `status` (`idle|loading|succeeded|failed`), `error`
- Thunks: `login(credentials)`, `register(userData)`
- Reducers: `initializeAuth` (hydrate from localStorage on app load), `logout`, `clearAuthError`

**`compliance-slice.ts`**
- State: `summary`, `factors`, `documents`, `brsrReport`, `status`, `error`
- Thunks: `fetchEmissionsSummary`, `submitEmissionEntry`, `fetchBRSRReport`, `fetchDocumentsList`, `approveDocument`, `calculateScopeEmissions`

**`marketplace-slice.ts`**
- State: `credits[]`, `marketBook[]`, `lastOrderResponse`, `status`, `error`
- Thunks: `fetchOrgCredits`, `fetchMarketBook`, `submitMarketOrder`

**`ai-slice.ts`**
- State: `chatHistory[]`, `activeChatResponse`, `analysisResult`, `agents[]`, `status`, `error`
- Thunks: `fetchChatHistory`, `sendChatMessageThunk`, `triggerDocumentAnalysis`, `fetchAgentRegistry`, `registerAgent`, `modifyAgent`, `removeAgent`

## Styling System

- **CSS framework**: Tailwind CSS v4
- **Component library**: shadcn/ui with `base-nova` style (configured in `components.json`)
- **CSS variables** defined in `globals.css`:
  ```css
  --brand-green: #16a34a
  --brand-emerald: #10b981
  --brand-teal: #0d9488
  --background: #ffffff (light) / #000000 (dark)
  --foreground: #0a0a0a (light) / #ffffff (dark)
  ```
- **Typography**: Inter (body), Space Grotesk (headings) — Google Fonts
- **Icons**: Lucide React
- **Animations**: Framer Motion + tw-animate-css
- **Toast notifications**: Sonner
- **Theme switching**: next-themes (dark/light mode)

## TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Path alias `@/` maps to `src/` — use `@/components/...`, `@/store/...`, `@/lib/...` throughout.
