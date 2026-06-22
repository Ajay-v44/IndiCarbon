import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createProposal,
  listProposals,
  acceptProposal,
  rejectProposal,
  cancelProposal,
} from "@/lib/api/marketplace";
import {
  CreateProposalRequest,
  ProposalAcceptResponse,
  ProposalResponse,
} from "@/lib/api/types";

type ProposalsState = {
  sent: ProposalResponse[];
  received: ProposalResponse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  actionStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastAcceptResult: ProposalAcceptResponse | null;
};

const initialState: ProposalsState = {
  sent: [],
  received: [],
  status: "idle",
  actionStatus: "idle",
  error: null,
  lastAcceptResult: null,
};

export const fetchSentProposals = createAsyncThunk<
  ProposalResponse[],
  string,
  { rejectValue: string }
>("proposals/fetchSent", async (orgId, { rejectWithValue }) => {
  try {
    return await listProposals(orgId, "buyer");
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch sent proposals.");
  }
});

export const fetchReceivedProposals = createAsyncThunk<
  ProposalResponse[],
  string,
  { rejectValue: string }
>("proposals/fetchReceived", async (orgId, { rejectWithValue }) => {
  try {
    return await listProposals(orgId, "seller");
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to fetch received proposals.");
  }
});

export const submitProposal = createAsyncThunk<
  ProposalResponse,
  CreateProposalRequest,
  { rejectValue: string }
>("proposals/submit", async (payload, { rejectWithValue }) => {
  try {
    return await createProposal(payload);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to submit proposal.");
  }
});

export const doAcceptProposal = createAsyncThunk<
  ProposalAcceptResponse,
  string,
  { rejectValue: string }
>("proposals/accept", async (proposalId, { rejectWithValue }) => {
  try {
    return await acceptProposal(proposalId);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to accept proposal.");
  }
});

export const doRejectProposal = createAsyncThunk<
  ProposalResponse,
  { proposalId: string; reason?: string },
  { rejectValue: string }
>("proposals/reject", async ({ proposalId, reason }, { rejectWithValue }) => {
  try {
    return await rejectProposal(proposalId, reason);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to reject proposal.");
  }
});

export const doCancelProposal = createAsyncThunk<
  ProposalResponse,
  string,
  { rejectValue: string }
>("proposals/cancel", async (proposalId, { rejectWithValue }) => {
  try {
    return await cancelProposal(proposalId);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to cancel proposal.");
  }
});

const proposalsSlice = createSlice({
  name: "proposals",
  initialState,
  reducers: {
    clearProposalsError(state) {
      state.error = null;
    },
    clearLastAcceptResult(state) {
      state.lastAcceptResult = null;
    },
    resetActionStatus(state) {
      state.actionStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSentProposals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSentProposals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sent = action.payload;
      })
      .addCase(fetchSentProposals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch proposals.";
      })

      .addCase(fetchReceivedProposals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReceivedProposals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.received = action.payload;
      })
      .addCase(fetchReceivedProposals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch proposals.";
      })

      .addCase(submitProposal.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(submitProposal.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.sent.unshift(action.payload);
      })
      .addCase(submitProposal.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload ?? "Failed to submit proposal.";
      })

      .addCase(doAcceptProposal.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(doAcceptProposal.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.lastAcceptResult = action.payload;
        const idx = state.received.findIndex((p) => p.id === action.payload.proposal.id);
        if (idx >= 0) state.received[idx] = action.payload.proposal;
      })
      .addCase(doAcceptProposal.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload ?? "Failed to accept proposal.";
      })

      .addCase(doRejectProposal.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(doRejectProposal.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const idx = state.received.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.received[idx] = action.payload;
      })
      .addCase(doRejectProposal.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload ?? "Failed to reject proposal.";
      })

      .addCase(doCancelProposal.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(doCancelProposal.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const idx = state.sent.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.sent[idx] = action.payload;
      })
      .addCase(doCancelProposal.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload ?? "Failed to cancel proposal.";
      });
  },
});

export const { clearProposalsError, clearLastAcceptResult, resetActionStatus } =
  proposalsSlice.actions;
export const proposalsReducer = proposalsSlice.reducer;
