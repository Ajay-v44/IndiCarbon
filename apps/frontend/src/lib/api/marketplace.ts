import { apiCall } from "./axios-client";
import { CarbonCredit, PlaceOrderRequest, PlaceOrderResponse } from "./types";

export function placeOrder(payload: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  return apiCall<PlaceOrderResponse>({
    url: "/api/v1/orders",
    method: "POST",
    data: payload,
  });
}

export function listCredits(organizationId: string): Promise<CarbonCredit[]> {
  return apiCall<CarbonCredit[]>({
    url: `/api/v1/credits/${organizationId}`,
    method: "GET",
  });
}
