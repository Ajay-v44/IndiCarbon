# IndiCarbon — Frontend API Layer

All frontend API integration lives in `apps/frontend/src/lib/api/`.

## Axios Client (`src/lib/api/axios-client.ts`)

Central axios instance used by all API service files.

```typescript
// Base configuration
baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
// All endpoints are relative, e.g. '/api/v1/auth/login'

// Request interceptor — auto-injects JWT
const tokens = localStorage.getItem('indicarbon_tokens');
if (tokens) {
  config.headers.Authorization = `Bearer ${JSON.parse(tokens).access_token}`;
}

// Response interceptor — handles 401
if (error.response?.status === 401) {
  localStorage.removeItem('indicarbon_tokens');
  // Dispatches logout action
}
```

**`apiCall()` helper** — wraps every request to normalize the standard API envelope:
```typescript
// All backend responses follow: { success: boolean, data: T, message: string }
// apiCall() throws an Error if success === false, returns data on success
const data = await apiCall<MyType>(axiosClient.get('/api/v1/resource'));
```

## API Service Files

### `auth.ts` — `/api/v1/auth/`

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| `login(email, password)` | POST | `/auth/login` | Returns JWT tokens |
| `register(userData)` | POST | `/auth/register` | Creates user + org |
| `refreshTokens(refreshToken)` | POST | `/auth/refresh` | Refreshes access token |
| `verifyToken(token)` | GET | `/auth/verify` | Validates JWT |
| `listRoles()` | GET | `/auth/roles` | Lists available roles |
| `assignRole(userId, role)` | POST | `/auth/roles/assign` | Assigns role to user |
| `createRole(roleData)` | POST | `/auth/roles` | Creates a new role |

### `compliance.ts` — `/api/v1/compliance/`

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| `createEmissionEntry(data)` | POST | `/compliance/emissions` | Submit new emission record |
| `getEmissionsSummary(params)` | GET | `/compliance/emissions/summary` | Aggregated totals by scope/period |
| `getBRSRReport(orgId, year)` | GET | `/compliance/brsr` | Generated BRSR report |
| `getEmissionFactors(filters)` | GET | `/compliance/factors` | Emission conversion factors |
| `registerDocument(file, meta)` | POST | `/compliance/documents` | Upload audit document |
| `listDocuments(orgId)` | GET | `/compliance/documents` | List org's documents |
| `verifyDocument(docId)` | PATCH | `/compliance/documents/:id/verify` | Approve document |
| `getBenchmarks(sector)` | GET | `/compliance/benchmarks` | Sector intensity targets |
| `createBenchmark(data)` | POST | `/compliance/benchmarks` | Add benchmark entry |
| `calculateScopeEmissions(data)` | POST | `/compliance/calculate` | On-demand scope calc |

### `marketplace.ts` — `/api/v1/marketplace/`

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| `placeOrder(orderData)` | POST | `/marketplace/orders` | Submit buy or sell order |
| `listMarketOrders(filters)` | GET | `/marketplace/orders` | Fetch order book |
| `listCarbonCredits(filters)` | GET | `/marketplace/credits` | List available credits |

### `ai.ts` — `/api/v1/ai/`

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| `sendChatMessage(message, sessionId)` | POST | `/ai/chat` | Send message to AI agent |
| `fetchChatHistory(sessionId)` | GET | `/ai/chat/history` | Load prior messages |
| `analyzeDocument(docId)` | POST | `/ai/analyze` | Trigger AI doc analysis |
| `getAgentRegistry()` | GET | `/ai/agents` | List registered agents |
| `registerAgent(config)` | POST | `/ai/agents` | Register new agent config |
| `modifyAgent(agentId, config)` | PATCH | `/ai/agents/:id` | Update agent config |
| `removeAgent(agentId)` | DELETE | `/ai/agents/:id` | Delete agent config |

### `types.ts`

TypeScript interfaces for all API request/response shapes. Import types from here — never define inline API types in components or slices.

## Redux Thunk Convention

All API calls are made inside Redux async thunks — never call API service functions directly from components.

```typescript
// Standard pattern — every API call follows this shape
export const fetchEmissionsSummary = createAsyncThunk(
  'compliance/fetchEmissionsSummary',
  async (params: SummaryParams, { rejectWithValue }) => {
    try {
      return await getEmissionsSummary(params);  // from compliance.ts
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// In components:
const dispatch = useAppDispatch();
const { summary, status, error } = useAppSelector(s => s.compliance);

useEffect(() => {
  dispatch(fetchEmissionsSummary({ orgId, period: 'Q1-2025' }));
}, [dispatch]);
```

## Adding a New API Integration (Checklist)

1. Add TypeScript types to `src/lib/api/types.ts`
2. Add the API function to the relevant service file (or create a new one)
3. Create an async thunk in the relevant Redux slice
4. Add state fields + `pending/fulfilled/rejected` handlers to the slice
5. Use `useAppDispatch` and `useAppSelector` in the component — no direct API calls
