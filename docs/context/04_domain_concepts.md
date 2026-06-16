# IndiCarbon — Domain Concepts

Understanding the business domain is essential for contributing to this codebase. IndiCarbon sits at the intersection of environmental compliance, financial trading, and AI — all within the Indian regulatory context.

## The Three Pillars

### Pillar 1: Carbon Accounting (Compliance)

**What it does**: Helps companies measure, record, and report their greenhouse gas (GHG) emissions.

**GHG Protocol Scopes** (the international standard used):
| Scope | Definition | Examples |
|-------|-----------|---------|
| Scope 1 | Direct emissions from owned/controlled sources | Company vehicles, on-site fuel combustion |
| Scope 2 | Indirect emissions from purchased energy | Electricity consumed from the grid |
| Scope 3 | All other indirect emissions in value chain | Supply chain, business travel, waste disposal |

**Key features**:
- **Emission Factors**: Conversion factors (e.g. kg CO₂e per kWh of electricity). IndiCarbon maintains a database with vintage years and India-localized values.
- **BRSR Report**: SEBI mandates listed Indian companies to file a Business Responsibility & Sustainability Report annually. IndiCarbon auto-generates this from entered emissions data.
- **Document Management**: Companies upload facility audit documents (PDFs). The system registers, stores, and verifies them; AI agent can extract emissions data from them.
- **Sector Benchmarks**: Industry-specific emissions intensity targets (e.g. tCO₂e per unit of production). Used for gap analysis — showing how a company compares to its sector.

**Regulatory context**:
- **BRSR**: SEBI (Securities and Exchange Board of India) mandate for ESG reporting
- **CPCB**: Central Pollution Control Board — India's primary emissions regulator
- **NDC**: India's Nationally Determined Contributions under the Paris Agreement

---

### Pillar 2: Carbon Marketplace (Trading)

**What it does**: Enables companies to buy carbon credits to offset their emissions, and sell credits they've generated through sustainability projects.

**Carbon Credits**:
- A carbon credit = 1 tonne of CO₂ equivalent avoided or removed
- Standards: **Verra VCS** (Verified Carbon Standard) and **Gold Standard** — the two leading global certification bodies
- Each credit has a **vintage year** (when the emission reduction occurred) and a **project type**

**Project Types** (common in India):
- Agro-forestry (tree planting)
- Renewable energy (wind, solar)
- Improved cookstoves
- Methane capture

**Trading mechanics**:
- **Order Book**: Buyers post buy orders at a price; sellers post sell orders. The matching engine pairs compatible orders.
- **Settlement**: Reserve → Commit pattern (see backend architecture doc for details)
- **Carbon Vault** (Portfolio page): A company's owned carbon credits and transaction history

---

### Pillar 3: AI Agent — "IndiCarbon Agenti"

**What it does**: An AI assistant that can answer compliance questions, analyze documents, and model reduction strategies.

**Two Personas** (LangChain ReAct agents):

| Persona | Role | Typical queries |
|---------|------|-----------------|
| **Auditor** | Compliance expert | "What are my Scope 2 emissions this quarter?", "Does my BRSR report comply with SEBI requirements?", "What emission factor should I use for grid electricity in Maharashtra?" |
| **Strategist** | Emissions reduction advisor | "How can I reach net-zero by 2040?", "What offset projects are available for my sector?", "Model a 20% renewable energy shift for my facility." |

**Capabilities**:
- **Chat**: Persistent conversation history stored in Supabase
- **Document Analysis**: Upload a PDF facility audit report → agent extracts emissions data automatically
- **Simulation**: Scenario modeling — "if we switch 30% of fleet to EV, what is the projected Scope 1 reduction?"
- **Agent Registry**: Multiple agent configurations can be registered and switched

**Guardrail Stack** (applied to every message before reaching the LLM):
1. **PII Masking**: Strips names, emails, phone numbers, financial account numbers
2. **Domain Guard**: Rejects queries unrelated to carbon/emissions/sustainability (prevents misuse)
3. **PDF Injection Protection**: Sanitizes uploaded document content to prevent prompt injection

**Observability**: Every LLM call is traced in **Langfuse** with full prompt/response, token counts, and latency — supports compliance auditing of AI outputs.

---

## Key Regulatory Terms Glossary

| Term | Full Form | What It Means |
|------|-----------|--------------|
| BRSR | Business Responsibility & Sustainability Report | SEBI-mandated annual ESG report for listed Indian companies |
| CPCB | Central Pollution Control Board | India's national body for pollution standards |
| NDC | Nationally Determined Contributions | India's climate commitments under Paris Agreement |
| GHG Protocol | Greenhouse Gas Protocol | International standard for corporate GHG accounting |
| Verra VCS | Verra Verified Carbon Standard | Leading global carbon credit certification |
| Gold Standard | Gold Standard Foundation | Premium carbon credit certification |
| tCO₂e | Tonnes of CO₂ equivalent | Unit of carbon accounting (all GHGs normalized to CO₂) |
| Vintage Year | — | The year an emission reduction actually occurred |
| SEBI | Securities and Exchange Board of India | Financial regulator that mandates BRSR |

---

## Data Flow: A Typical User Journey

```
1. Company enters monthly emissions data (Compliance → emission_entries table)
2. System calculates Scope 1/2/3 totals using emission factors
3. Dashboard shows emissions trends and sector benchmark comparison
4. AI Auditor answers compliance questions using live data + document retrieval
5. Company buys carbon credits from Marketplace to offset remaining emissions
6. BRSR report auto-generated for SEBI filing
```
