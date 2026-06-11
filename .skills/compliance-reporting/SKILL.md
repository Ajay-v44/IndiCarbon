---
name: compliance-reporting
description: Skills and API contracts to audit emissions, record GHG ledger activities, and compile regulatory BRSR reports.
---

# Compliance Reporting & GHG Auditing Skill

This skill teaches the model how to interface with the IndiCarbon Compliance and GHG ledger microservice. 

## Downstream API Integrations

All API calls must go through the Central Gateway at `http://localhost:8000`.

### 1. Retrieve Historical Emissions Summary
* **Endpoint**: `GET /api/v1/emissions/summary`
* **Query Parameters**:
  * `organization_id` (string, UUID): The organization target
  * `period_start` (string, YYYY-MM-DD): Start date
  * `period_end` (string, YYYY-MM-DD): End date
* **Headers**: `X-User-ID`, `X-Organization-ID` (injected automatically or supplied explicitly)
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "scope_1_total": 120.5,
      "scope_2_total": 45.2,
      "scope_3_total": 230.1,
      "total_emissions": 395.8,
      "breakdown_by_category": { ... }
    }
  }
  ```

### 2. Submit GHG Emissions Entry
* **Endpoint**: `POST /api/v1/emissions/report`
* **Headers**: `X-User-ID`, `X-Organization-ID`
* **Request Payload**:
  ```json
  {
    "organization_id": "uuid-string",
    "reporting_period_start": "YYYY-MM-DD",
    "reporting_period_end": "YYYY-MM-DD",
    "scope_type": "SCOPE_1" | "SCOPE_2" | "SCOPE_3",
    "raw_quantity": 2500,
    "activity_unit": "kWh",
    "factor_key": "grid-electricity-india-2024",
    "document_evidence_id": "optional-document-uuid"
  }
  ```

### 3. Generate SEBI BRSR (Business Responsibility and Sustainability Report)
* **Endpoint**: `GET /api/v1/emissions/brsr`
* **Query Parameters**:
  * `period_start` (string, YYYY-MM-DD)
  * `period_end` (string, YYYY-MM-DD)
  * `revenue_crore` (number, optional): Used to compute emissions intensity per crore of revenue
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "fiscal_year": "2024-2025",
      "scope_1": 150.2,
      "scope_2": 80.4,
      "intensity_metric": "tCO2e/Crore",
      "intensity_value": 2.3
    }
  }
  ```

## Guidelines for LLMs
1. **Validation**: Ensure dates are in YYYY-MM-DD format and chronological (`period_start` must be before `period_end`).
2. **Units Mapping**: Common mappings include:
   * Grid Electricity -> `kWh`
   * Diesel/Petrol -> `litres`
   * Employee Travel -> `passenger-km`
3. **Auditing**: Always check if a `document_evidence_id` exists in the system before approving a report entry.
