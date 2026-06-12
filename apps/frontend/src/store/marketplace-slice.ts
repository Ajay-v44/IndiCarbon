import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { listCredits, placeOrder, getMarketOrders } from "@/lib/api/marketplace";
import { CarbonCredit, PlaceOrderRequest, PlaceOrderResponse } from "@/lib/api/types";

type MarketplaceState = {
  credits: CarbonCredit[];
  marketBook: PlaceOrderResponse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastOrderResponse: PlaceOrderResponse | null;
};

const initialState: MarketplaceState = {
  credits: [],
  marketBook: [],
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

export const fetchMarketBook = createAsyncThunk<
  PlaceOrderResponse[],
  void,
  { rejectValue: string }
>("marketplace/fetchMarketBook", async (_, { rejectWithValue }) => {
  try {
    return await getMarketOrders();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch market book.");
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

      // Market Book
      .addCase(fetchMarketBook.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMarketBook.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.marketBook = action.payload;
        state.error = null;
      })
      .addCase(fetchMarketBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch market book.";
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
