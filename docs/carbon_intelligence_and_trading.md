# IndiCarbon — Carbon Intelligence & Trading Platform (New Features Documentation)

This document provides a detailed technical overview of the new Carbon Intelligence & Trading features implemented in the IndiCarbon platform.

---

## 📂 Table of Contents
1. [Overview of New Workflows](#1-overview-of-new-workflows)
2. [Upload-First AI Project Submission (`POST /api/v1/ai/analyse-project`)](#2-upload-first-ai-project-submission-post-apiv1aianalyse-project)
3. [AI Carbon Credit Calculator (`credit_calculator.py`)](#3-ai-carbon-credit-calculator-credit_calculatorpy)
4. [Admin Project Approval & Auto-Minting Flow](#4-admin-project-approval--auto-minting-flow)
5. [Credit Ledger & Net Carbon Position (Paging Enabled)](#5-credit-ledger--net-carbon-position-paging-enabled)
6. [Server-Side Pagination across Listing APIs](#6-server-side-pagination-across-listing-apis)
7. [Admin Per-Organization Audit Trail subpage](#7-admin-per-organization-audit-trail-subpage)
8. [Gateway Error Interception & System Logs (500 Error Tracing & Resolution)](#8-gateway-error-interception--system-logs-500-error-tracing--resolution)
9. [Mobile Responsive Navigation Sidebar](#9-mobile-responsive-navigation-sidebar)

---

## 1. Overview of New Workflows

IndiCarbon has transitioned from a Carbon Accounting platform into an end-to-end **AI-Driven Carbon Intelligence & Trading Platform**. The new workflow operates as follows:

```
[Organization uploads Project Document/PDD PDF]
                        │
                        ▼
   [AI parses document & pre-fills form details]
  (Name, type, description, lifetime, registry, etc.)
                        │
                        ▼
  [AI calculates credit potential via CDM metrics]
(Solar: 0.82 tCO2/MWh, Forestry: 6 tCO2/ha/yr)
                        │
                        ▼
  [Admin reviews, overrides count & verifies project]
                        │
                        ▼
[Carbon credits auto-minted (status: ISSUED) to org]
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
[Apply to Emissions]           [Retire Credits] (FIFO)
 (status: APPLIED)              (status: RETIRED)
         │                             │
         └──────────────┬──────────────┘
                        ▼
          [Reduces Net Carbon Position]
```

---

## 2. Upload-First AI Project Submission (`POST /api/v1/ai/analyse-project`)

To eliminate manual data entry errors and simplify calculations for users, project submission has been refactored into a strictly **upload-first workflow**.

### Processing Steps:
1.  **Strict Upload Requirement**: All manual metric input forms are hidden on initial view. The user is presented with exactly **one option: upload a document** (e.g., PDD PDF, energy audit sheet).
2.  **Document Analysis Service (`project_analysis_service.py`)**: 
    - The document is parsed via the `parse_document` engine.
    - The raw text is passed to the LLM using **structured output binding** (`llm.with_structured_output`) via LangChain to guarantee schema alignment.
    - Extracted parameters include: Concisely generated name, project type, description summary, carbon registry, project lifetime, energy/fuel/waste metrics, and checklist of detected document types.
3.  **Client-Side Confirmation**: The front-end renders the AI-extracted details in a preview form, allowing the organization to review, correct minor issues, and finalize submission.

### AI agent analysis endpoint:
`POST /api/v1/ai/analyse-project`
- **Request**: Multipart form data with `file` upload.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "name": "Ambuja Kodinar Wind Farm",
      "project_type": "Wind",
      "description": "50 MW wind power plant grid connectivity...",
      "registry": "VERRA",
      "project_lifetime_years": 25,
      "energy_produced_mwh": 125000.0,
      "fuel_switched_litre": null,
      "waste_diverted_tonnes": null,
      "trees_planted": null,
      "area_hectares": null,
      "estimated_annual_reduction_tco2e": 102500.0,
      "estimated_credits": 2562500.0,
      "submitted_documents": ["Project Design Document", "Monitoring Report"]
    }
  }
  ```

---

## 3. AI Carbon Credit Calculator (`credit_calculator.py`)

A standalone credit calculation engine has been developed at `apps/backend/services/marketplace/app/services/credit_calculator.py`. It calculates credits based on India-specific CDM (Clean Development Mechanism) and VCS methodologies.

### India-Specific Emission & Avoidance Factors:
*   **Grid Connected Solar/Wind**: `0.82 tCO₂/MWh` (based on CEA India CO₂ Grid Baseline 2023-24).
*   **Biomass Net Factor**: `0.50 tCO₂/MWh` (accounts for biomass source carbon neutrality).
*   **Fuel Switching**: `0.00268 tCO₂/litre` for displaced diesel (IPCC Tier 1 baseline).
*   **Waste Avoidance**: `0.50 tCO₂e/tonne` of waste diverted from landfills (methane avoidance CDM AMS-III.F).
*   **Afforestation/Reforestation**:
    *   `3.67 tCO₂/tree` over a 10-year period (average Indian broadleaf species).
    *   `6.0 tCO₂/hectare/year` for area-based plantings (CDM AR baseline).
*   **Green Hydrogen**: `0.74 tCO₂/MWh` avoided (based on electrolysis displacement factor).

### API Endpoint: `POST /api/v1/projects/{id}/evaluate`
Runs the evaluation on demand for any project.

---

## 4. Admin Project Approval & Auto-Minting Flow

When an organization submits a project, the AI automatically evaluates the data and writes the results to `ai_estimated_credits` and `ai_methodology`.

### Admin Action via `PATCH /api/v1/projects/{project_id}/status`
1. The admin inspects the project details, including the LangGraph AI calculation recommendations and PDD files.
2. The admin can provide an override value in the `admin_approved_credits` field.
3. Upon changing status to `VERIFIED`:
   - The platform mints carbon credits directly to the organization's registry account.
   - The final credit quantity follows this priority hierarchy:
     $$\text{Mint Quantity} = \text{admin\_approved\_credits} \gg \text{ai\_estimated\_credits} \gg \text{estimated\_credits}$$
   - Unique, traceable serial numbers are generated for each credit in the format:
     `CCT-[UUID_HEX_8]-[ORG_ID_8]` (e.g., `CCT-A2F8B70E-E2B4FF43`).

---

## 5. Credit Ledger & Net Carbon Position (Paging Enabled)

To prevent double counting and distinguish between credit trade eligibility and emission offsets, a three-state credit lifecycle has been implemented:
1.  **`ISSUED`**: Owned by the organization. Eligible for listing on the Marketplace or OTC trading. *Does not yet reduce carbon emissions.*
2.  **`APPLIED`**: Applied against the organization's direct emissions. Locked from trading. Reduces Net Carbon Position.
3.  **`RETIRED`**: Permanently burned. locked from trading. Also reduces Net Carbon Position.

### Net Carbon Position Formula:
$$\text{Net Carbon Position (tCO₂e)} = \text{Max}\Big(0.0, \text{Gross Emissions} - \big(\text{Applied Credits} + \text{Retired Credits}\big)\Big)$$

### Credit Ledger Page (`/ledger`)
A dedicated user dashboard at `/ledger` displays:
*   **KPI Panel**: Count of Available, Applied, Retired, and Sold credits, total offset coverage, and current Net Carbon Position.
*   **Apply Dialog**: Let users apply a specified quantity of available credits to lower their net emissions position. Features a preview showing what their Net Carbon Position will be *after* applying.
*   **Retire Dialog**: Let users permanently retire a specified quantity of credits.
*   **Transaction Table (Paginated)**: A complete, filterable audit log of every credit event (Issued, Applied, Retired, Sold) with pagination support (Page X of Y, Previous/Next navigation).

---

## 6. Server-Side Pagination across Listing APIs

To optimize query latency and backend resource utilization, server-side pagination using `limit` and `offset` query parameters has been implemented across the listing endpoints. The frontend updates dynamically as page toggles are triggered.

### Paginated Endpoints:
1.  **Organization Projects** (`GET /api/v1/projects`):
    - Query parameters: `limit: int` (default 10), `offset: int` (default 0).
    - Response contains: `{"projects": [...], "total": int, "limit": int, "offset": int}`.
2.  **Admin Review Queue** (`GET /api/v1/projects/admin/all`):
    - Query parameters: `limit: int` (default 10), `offset: int` (default 0).
    - Response contains: `{"projects": [...], "total": int, "limit": int, "offset": int}`.
3.  **Credit Event Ledger** (`GET /api/v1/credits/ledger`):
    - Query parameters: `limit: int` (default 50), `offset: int` (default 0).
    - Response contains: `{"ledger": [...], "total": int, "limit": int, "offset": int}`.

---

## 7. Admin Per-Organization Audit Trail subpage

Instead of listing all data in a single cluttered panel, a dedicated subpage has been built at `/admin/org/[id]` to provide super-admins and government auditors a granular view of any enterprise client.

### Inspected Panels:
*   **Enterprise Profile**: Legal Name, trade name, registration number (CIN), industry sector, and active subscription status.
*   **Emissions & Compliance**: Gross annual emissions, applied offsets, retired offsets, Net Carbon Position, and offset coverage percentage progress bar.
*   **Credit Registry Inventory**: Lists all carbon credits held by this organization, showing serial numbers, project types, vintage years, and statuses (`ISSUED`/`APPLIED`/`RETIRED`).
*   **Wallet Cash Ledger**: Balance and cash-flow history showing both administrative grants (`ADMIN_CREDIT`) and marketplace transaction debits/credits.
*   **Submitted Projects**: List of carbon reduction projects submitted by the organization with status logs.
*   **OTC Proposals**: List of over-the-counter trades involving the organization as buyer or seller.

---

## 8. Gateway Error Interception & System Logs (500 Error Tracing & Resolution)

All HTTP traffic passes through the API Gateway (`apps/backend/services/gateway/main.py`). The gateway has been upgraded to log all service errors to the shared database for admin visibility.

### Error Analysis & DB Repair (Case Study):
1.  **The Issue**: Traced gateway HTTP 500 error logs to user **Raj Ahuja** of organization **Ahuja Cements** (`90cca1f3-767d-45da-aceb-09515cf160fe`) when attempting to access `/api/v1/projects` or submit new projects.
2.  **The Diagnosis**: Traced to missing columns in the `carbon_projects` table. Since the table already existed in PostgreSQL, SQLAlchemy `create_all()` did not modify the table on start, triggering `UndefinedColumn` errors on insert/select.
3.  **The Fix**: Executed SQL statements to alter `carbon_projects` to add all missing AI-calculator fields (`ai_estimated_credits`, `ai_annual_reduction_tco2e`, `ai_methodology`, `ai_confidence_score`, `ai_evaluation_notes`, `ai_evaluated_at`, `admin_approved_credits`, `credits_issued`).

---

## 9. Mobile Responsive Navigation Sidebar

The main dashboard navigation sidebar (`Sidebar.tsx`) has been rewritten to support mobile and tablet devices:
*   **Desktop (lg+)**: Permanent left-side sidebar showing full labels.
*   **Mobile (< lg)**: Hidden by default. Opens as a slide-over overlay drawer toggled by a floating hamburger menu button. Dismissed by clicking the overlay or pressing the `Escape` key.
*   **Aesthetic Theme**: Styled with modern glassmorphism, harmonious border lines, active link indicators in emerald green (`bg-emerald-500/10 text-emerald-600`), and dark mode support.
*   **Nav Link**: Integration of the new **Credit Ledger** route (`/ledger`) in the navigation menu.
