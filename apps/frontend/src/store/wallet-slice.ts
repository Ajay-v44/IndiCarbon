import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getWallet,
  getAllWallets,
  adminAddFunds,
  getWalletTransactions,
  getAllWalletTransactions,
} from "@/lib/api/wallet";
import {
  WalletResponse,
  WalletTransactionResponse,
  AdminAddFundsRequest,
  AdminAddFundsResponse,
} from "@/lib/api/types";

type WalletState = {
  wallet: WalletResponse | null;
  allWallets: WalletResponse[];
  transactions: WalletTransactionResponse[];
  allTransactions: WalletTransactionResponse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFundResult: AdminAddFundsResponse | null;
};

const initialState: WalletState = {
  wallet: null,
  allWallets: [],
  transactions: [],
  allTransactions: [],
  status: "idle",
  error: null,
  lastFundResult: null,
};

export const fetchWallet = createAsyncThunk<
  WalletResponse,
  string,
  { rejectValue: string }
>("wallet/fetchWallet", async (orgId, { rejectWithValue }) => {
  try {
    return await getWallet(orgId);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch wallet.");
  }
});

export const fetchAllWallets = createAsyncThunk<
  WalletResponse[],
  void,
  { rejectValue: string }
>("wallet/fetchAllWallets", async (_, { rejectWithValue }) => {
  try {
    return await getAllWallets();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch wallets.");
  }
});

export const addFunds = createAsyncThunk<
  AdminAddFundsResponse,
  AdminAddFundsRequest,
  { rejectValue: string }
>("wallet/addFunds", async (payload, { rejectWithValue }) => {
  try {
    return await adminAddFunds(payload);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to add funds.");
  }
});

export const fetchWalletTransactions = createAsyncThunk<
  WalletTransactionResponse[],
  string,
  { rejectValue: string }
>("wallet/fetchTransactions", async (orgId, { rejectWithValue }) => {
  try {
    return await getWalletTransactions(orgId);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch transactions.");
  }
});

export const fetchAllTransactions = createAsyncThunk<
  WalletTransactionResponse[],
  void,
  { rejectValue: string }
>("wallet/fetchAllTransactions", async (_, { rejectWithValue }) => {
  try {
    return await getAllWalletTransactions();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch transactions.");
  }
});

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWalletError(state) {
      state.error = null;
    },
    clearLastFundResult(state) {
      state.lastFundResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.wallet = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch wallet.";
      })

      .addCase(fetchAllWallets.fulfilled, (state, action) => {
        state.allWallets = action.payload;
      })

      .addCase(addFunds.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addFunds.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastFundResult = action.payload;
        if (state.wallet && state.wallet.organization_id === action.payload.organization_id) {
          state.wallet.balance = action.payload.new_balance;
        }
        state.allWallets = state.allWallets.map((w) =>
          w.organization_id === action.payload.organization_id
            ? { ...w, balance: action.payload.new_balance }
            : w
        );
      })
      .addCase(addFunds.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to add funds.";
      })

      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })

      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.allTransactions = action.payload;
      });
  },
});

export const { clearWalletError, clearLastFundResult } = walletSlice.actions;
export const walletReducer = walletSlice.reducer;
