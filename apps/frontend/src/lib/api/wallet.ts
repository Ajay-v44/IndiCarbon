import { apiCall } from "./axios-client";
import {
  WalletResponse,
  WalletTransactionResponse,
  AdminAddFundsRequest,
  AdminAddFundsResponse,
} from "./types";

export function getWallet(organizationId: string): Promise<WalletResponse> {
  return apiCall<WalletResponse>({
    url: "/api/v1/wallet",
    method: "GET",
    params: { organization_id: organizationId },
  });
}

export function getAllWallets(): Promise<WalletResponse[]> {
  return apiCall<WalletResponse[]>({
    url: "/api/v1/wallet/all",
    method: "GET",
  });
}

export function adminAddFunds(payload: AdminAddFundsRequest): Promise<AdminAddFundsResponse> {
  return apiCall<AdminAddFundsResponse>({
    url: "/api/v1/wallet/admin/add-funds",
    method: "POST",
    data: payload,
  });
}

export function getWalletTransactions(organizationId: string): Promise<WalletTransactionResponse[]> {
  return apiCall<WalletTransactionResponse[]>({
    url: "/api/v1/wallet/transactions",
    method: "GET",
    params: { organization_id: organizationId },
  });
}

export function getAllWalletTransactions(): Promise<WalletTransactionResponse[]> {
  return apiCall<WalletTransactionResponse[]>({
    url: "/api/v1/wallet/transactions/all",
    method: "GET",
  });
}
