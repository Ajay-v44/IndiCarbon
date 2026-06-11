---
name: document-analysis
description: Skills and API contracts to run multi-agent LangGraph pipelines for ESG reports and manage document compliance vaults.
---

# AI Agent & Document Analysis Skill

This skill teaches the model how to trigger document analysis pipelines, perform RAG queries, and retrieve interactions with the AI agent.

## Downstream API Integrations

All API calls must go through the Central Gateway at `http://localhost:8000`.

### 1. Trigger ESG Document Analysis Pipeline
* **Endpoint**: `POST /api/v1/ai/analyse-document`
* **Content-Type**: `multipart/form-data`
* **Body Form Parameters**:
  * `file` (binary, required): The PDF/DOCX/xlsx ESG report to parse
  * `revenue_crore` (float, optional): Revenue for intensity calculations
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "run_id": "uuid-string",
      "extracted_data": {
        "fiscal_year": "2023-2024",
        "scope_1_emissions": 340.5,
        "scope_2_emissions": 120.2,
        "intensity_value": 1.2
      }
    }
  }
  ```

### 2. General Chat Agent
* **Endpoint**: `POST /api/v1/ai/chat`
* **Request Payload**:
  ```json
  {
    "query": "What are my Scope 1 emissions for FY24?"
  }
  ```
* **Response**:
  ```json
  {
    "answer": "Your Scope 1 emissions for FY24 are 340.5 tCO2e as analyzed from your report.",
    "sources": ["esg-report-2024.pdf"],
    "run_id": "uuid-string"
  }
  ```

### 3. Retrieve Chat History
* **Endpoint**: `GET /api/v1/ai/chat/history`
* **Query Parameters**:
  * `limit` (number, optional)
  * `offset` (number, optional)
* **Response**:
  ```json
  {
    "items": [
      {
        "interaction_id": "uuid-string",
        "query": "What is the grid factor used?",
        "answer": "The Indian grid factor used was 0.82 kgCO2/kWh.",
        "created_at": "2026-05-21T08:00:00Z"
      }
    ]
  }
  ```

## Guidelines for LLMs
1. **Document Parsing**: When analyzing reports, use the `/api/v1/ai/analyse-document` endpoint. It initiates background workers to parse and store vectors in the database.
2. **Context-Aware Responses**: When replying to user queries in chat, use historical details in `/api/v1/ai/chat/history` to provide contextual, consistent carbon advisory recommendations.
3. **Audit Tracking**: Ensure all questions about emissions check the underlying document source before giving hard answers.
