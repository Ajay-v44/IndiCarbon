import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { listCredits, placeOrder } from "@/lib/api/marketplace";
import { CarbonCredit, PlaceOrderRequest, PlaceOrderResponse } from "@/lib/api/types";

type MarketplaceState = {
  credits: CarbonCredit[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastOrderResponse: PlaceOrderResponse | null;
};

const initialState: MarketplaceState = {
  credits: [],
  status: "idle",
  error: null,
  lastOrderResponse: null,
};

export const fetchOrgCredits = createAsyncThunk<
  CarbonCredit[],
  string,
  { rejectValue: string }
>("marketplace/fetchCredits", async (orgId, { rejectWithValue }) => {
  try {
    return await listCredits(orgId);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch carbon credits.");
  }
});

export const submitMarketOrder = createAsyncThunk<
  PlaceOrderResponse,
  PlaceOrderRequest,
  { rejectValue: string }
>("marketplace/submitOrder", async (payload, { rejectWithValue }) => {
  try {
    return await placeOrder(payload);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to place trade order.");
  }
});

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState,
  reducers: {
    clearMarketplaceError(state) {
      state.error = null;
    },
    resetMarketplaceStatus(state) {
      state.status = "idle";
    },
    clearLastOrderResponse(state) {
      state.lastOrderResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Credits listing
      .addCase(fetchOrgCredits.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOrgCredits.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.credits = action.payload;
        state.error = null;
      })
      .addCase(fetchOrgCredits.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch credits.";
      })

      // Order book placing
      .addCase(submitMarketOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitMarketOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastOrderResponse = action.payload;
        state.error = null;
      })
      .addCase(submitMarketOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to place order.";
      });
  },
});

export const { clearMarketplaceError, resetMarketplaceStatus, clearLastOrderResponse } =
  marketplaceSlice.actions;
export const marketplaceReducer = marketplaceSlice.reducer;
