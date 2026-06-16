import { apiCall } from "./axios-client";
import { CarbonCredit, MarketOrder, PlaceOrderRequest, PlaceOrderResponse } from "./types";

export function placeOrder(payload: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  const idempotencyKey = crypto.randomUUID();
  return apiCall<PlaceOrderResponse>({
    url: "/api/v1/orders",
    method: "POST",
    data: payload,
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
}

export function getMarketOrders(): Promise<MarketOrder[]> {
  return apiCall<MarketOrder[]>({
    url: "/api/v1/orders/market",
    method: "GET",
  });
}

// Backend exposes credits as a query param: GET /api/v1/credits?organization_id=...
export function listCredits(organizationId: string): Promise<CarbonCredit[]> {
  return apiCall<CarbonCredit[]>({
    url: "/api/v1/credits",
    method: "GET",
    params: { organization_id: organizationId },
  });
}
