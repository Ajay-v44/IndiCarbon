---
name: marketplace-trading
description: Skills and API contracts to check carbon credit registries and submit trade orders.
---

# Carbon Credits Marketplace & Trading Skill

This skill teaches the model how to interface with the IndiCarbon Marketplace microservice to manage carbon credit inventories and execute trades.

## Downstream API Integrations

All API calls must go through the Central Gateway at `http://localhost:8000`.

### 1. Retrieve Carbon Credits Registry
* **Endpoint**: `GET /api/v1/credits`
* **Query Parameters**:
  * `organization_id` (string, UUID): The organization holding the credits
* **Headers**: `X-User-ID`, `X-Organization-ID`
* **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "credit_id": "uuid-string",
        "project_name": "solar-energy-gujarat",
        "vintage_year": 2023,
        "quantity_tonnes": 500.0,
        "status": "active"
      }
    ]
  }
  ```

### 2. Place Trade Order (BUY or SELL)
* **Endpoint**: `POST /api/v1/orders`
* **Headers**: `X-User-ID`, `X-Organization-ID`
* **Request Payload**:
  ```json
  {
    "organization_id": "uuid-string",
    "side": "buy" | "sell",
    "credit_project_id": "uuid-of-carbon-project",
    "vintage_year": 2023,
    "quantity_tonnes": 150.0,
    "price_per_tonne_inr": 850.00
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "order_id": "uuid-string",
      "status": "placed" | "matched" | "partially_matched",
      "filled_quantity": 0.0,
      "remaining_quantity": 150.0
    }
  }
  ```

## Guidelines for LLMs
1. **Trading Sides**:
   * **`buy`**: Placing an order to acquire carbon credits at a bid price.
   * **`sell`**: Listing credits from your active registry inventory at an ask price.
2. **Registry Verification**: Before placing a `sell` order, the model must verify that the organization owns the specified project credits and has sufficient `quantity_tonnes` in their registry balance.
3. **Execution Guardrails**: Confirm pricing with the user if the transaction exceeds 10,000 tonnes or if the price per tonne deviates by more than 20% from the recent market average (INR 800 - 1,200).
4. **HITL (Human-in-the-Loop)**: Any large orders must ask for explicit human confirmation.
